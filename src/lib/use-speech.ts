"use client"
/* Browser speech-to-text (Web Speech API). Works in Chrome / Edge / Android Chrome.
   No server or API key needed; unsupported browsers fall back to typing. */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

interface SpeechAlt { transcript: string }
interface SpeechResult { isFinal: boolean; 0: SpeechAlt; length: number }
interface SpeechEvent { resultIndex: number; results: { length: number; [i: number]: SpeechResult } }
interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean
  start(): void; stop(): void; abort(): void
  onresult: ((e: SpeechEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}
type RecognitionCtor = new () => Recognition

const getCtor = (): RecognitionCtor | null => {
  if (typeof window === "undefined") return null
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
const noop = () => () => {}

export function useSpeech(onFinal: (text: string) => void) {
  const supported = useSyncExternalStore(noop, () => !!getCtor(), () => false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState("")
  const [error, setError] = useState<string | null>(null)
  const rec = useRef<Recognition | null>(null)
  const wanted = useRef(false) // keep listening across the browser's auto-stops
  const finalRef = useRef(onFinal)
  useEffect(() => { finalRef.current = onFinal })

  const stop = useCallback(() => {
    wanted.current = false
    rec.current?.stop()
    setListening(false)
    setInterim("")
  }, [])

  const start = useCallback((lang: string) => {
    const Ctor = getCtor()
    if (!Ctor) { setError("Voice input isn't supported in this browser — please use Chrome or Edge, or type instead."); return }
    rec.current?.abort()
    const r = new Ctor()
    r.lang = lang
    r.continuous = true
    r.interimResults = true
    r.onresult = (e) => {
      let live = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) finalRef.current(res[0].transcript.trim())
        else live += res[0].transcript
      }
      setInterim(live)
    }
    r.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return
      setError(e.error === "not-allowed" || e.error === "service-not-allowed"
        ? "Microphone permission was blocked. Allow mic access in the browser's address bar and try again."
        : `Voice input stopped (${e.error}). You can keep typing.`)
      wanted.current = false
      setListening(false)
    }
    r.onend = () => {
      if (wanted.current) { try { r.start() } catch { /* already restarting */ } }
      else { setListening(false); setInterim("") }
    }
    rec.current = r
    wanted.current = true
    setError(null)
    try { r.start(); setListening(true) } catch { setError("Couldn't start the microphone. Please try again.") }
  }, [])

  useEffect(() => () => { wanted.current = false; rec.current?.abort() }, [])

  return { supported, listening, interim, error, start, stop }
}

/* ---------- Devanagari → Hinglish tokens, so Hindi speech can be parsed ---------- */
const HI_MAP: Record<string, string> = {
  "लाख": "lakh", "करोड़": "crore", "करोड": "crore", "हज़ार": "thousand", "हजार": "thousand", "साल": "years", "वर्ष": "years",
  "महीने": "months", "महीना": "months", "लोन": "loan", "ऋण": "loan", "टर्नओवर": "turnover", "बिक्री": "sales", "सेल्स": "sales",
  "प्रॉफिट": "profit", "प्रोफिट": "profit", "मुनाफा": "profit", "मुनाफ़ा": "profit", "ईएमआई": "emi", "किस्त": "emi", "सिबिल": "cibil",
  "स्कोर": "score", "बिज़नेस": "business", "बिजनेस": "business", "व्यापार": "business", "धंधा": "business", "कंपनी": "company", "दुकान": "shop",
  "फैक्ट्री": "factory", "चाहिए": "chahiye", "पुराना": "purana", "पुरानी": "purani", "जीएसटी": "gst", "आईटीआर": "itr", "मशीन": "machine",
  "सैलरी": "salary", "तनख्वाह": "salary", "नौकरी": "naukri", "का": "ka", "की": "ki", "के": "ke", "है": "hai", "हैं": "hai", "नहीं": "nahi",
  "मेरा": "mera", "मेरी": "meri", "मुझे": "mujhe", "और": "and", "कोई": "koi", "लिए": "liye", "रुपये": "rupaye", "रुपए": "rupaye",
  "एक": "ek", "दो": "do", "तीन": "teen", "चार": "char", "पांच": "paanch", "पाँच": "paanch", "छह": "chhe", "सात": "saat", "आठ": "aath",
  "नौ": "nau", "दस": "das", "बीस": "bees", "पच्चीस": "pachees", "तीस": "tees", "चालीस": "chalees", "पचास": "pachaas", "सौ": "sau",
  "डेढ़": "dedh", "ढाई": "dhai", "प्रति": "per", "महीना।": "months",
}
const DIGITS: Record<string, string> = { "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9" }

export function devanagariToHinglish(s: string) {
  if (!/[ऀ-ॿ]/.test(s)) return s
  return s
    .replace(/[०-९]/g, (d) => DIGITS[d])
    .split(/(\s+)/)
    .map((tok) => {
      const core = tok.replace(/[।,.!?]/g, "")
      return HI_MAP[core] ? tok.replace(core, HI_MAP[core]) : tok
    })
    .join("")
    .replace(/।/g, ".")
}
