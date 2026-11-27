"use client"
import { useRef, useState } from "react"
import { Keyboard, Mic, MicOff, PhoneCall, Play, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/toaster"
import { devanagariToHinglish, useSpeech } from "@/lib/use-speech"
import { cn } from "@/lib/utils"

export const EXAMPLES = [
  { id: "en", label: "Business Owner · English", text: "Hi, my name is Rajesh Sharma from Pune. I run an auto parts manufacturing business which is 6 years old. Our annual turnover is 3 crore and net profit is around 25 lakh. I need a loan of 50 lakh for a new CNC machine, for 5 years. We currently pay EMI of 40,000 per month. My CIBIL score is 752 and we are GST registered." },
  { id: "hi", label: "व्यापार / ट्रेडिंग · हिंदी", text: "मेरा नाम सुनील है, इंदौर में होलसेल ट्रेडिंग का बिज़नेस है जो 4 साल पुराना है। साल का टर्नओवर डेढ़ करोड़ है और मुनाफा 12 लाख। मुझे स्टॉक के लिए 25 लाख का लोन चाहिए, 3 साल के लिए। अभी 15 हज़ार की ईएमआई चल रही है। जीएसटी रजिस्टर्ड है, सिबिल 718 है।" },
  { id: "sal", label: "Salaried · Home Loan", text: "I am Priya, 31 years old, working at an IT company in Bengaluru for 7 years. My in-hand salary is 1.2 lakh per month. I want a home loan of 60 lakh for 20 years. I have a car loan EMI of 14,000. My credit score is 781." },
]

const LANGS = [
  { id: "en-IN", label: "English (India)" },
  { id: "hi-IN", label: "हिंदी (Hindi)" },
]

/** Speak-or-type box. Final speech is appended to the text; interim words show live. */
export function VoiceComposer({ text, onText, textRef }: { text: string; onText: (t: string | ((prev: string) => string)) => void; textRef?: React.RefObject<HTMLTextAreaElement | null> }) {
  const [lang, setLang] = useState("en-IN")
  const typing = useRef<ReturnType<typeof setInterval> | null>(null)
  const speech = useSpeech((chunk) => onText((prev) => `${prev}${prev && !/\s$/.test(prev) ? " " : ""}${devanagariToHinglish(chunk)}`))

  const playExample = (t: string) => {
    if (typing.current) clearInterval(typing.current)
    speech.stop()
    let i = 0
    onText("")
    typing.current = setInterval(() => {
      i += 3
      onText(t.slice(0, i))
      if (i >= t.length && typing.current) { clearInterval(typing.current); typing.current = null }
    }, 18)
  }

  return (
    <div className="grid gap-5">
      {/* mic hero */}
      <div className="ff-navy-grad relative overflow-hidden rounded-2xl p-6 text-white">
        <div className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full border border-white/10" />
        <div className="relative flex flex-col items-center gap-5 sm:flex-row">
          <button
            onClick={() => (speech.listening ? speech.stop() : speech.start(lang))}
            aria-label={speech.listening ? "Stop listening" : "Start speaking"}
            className={cn("relative grid size-24 shrink-0 place-items-center rounded-full transition-transform hover:scale-105", speech.listening ? "bg-white text-destructive" : "bg-gold text-navy")}
          >
            {speech.listening && <>
              <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" />
              <span className="absolute -inset-3 animate-pulse rounded-full border-2 border-gold/50" />
            </>}
            {speech.listening ? <MicOff className="relative size-9" /> : <Mic className="relative size-9" />}
          </button>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="font-heading text-xl font-semibold text-white">
              {speech.listening ? "Listening… Speak Naturally" : "Tap The Mic And Tell Us About Your Loan"}
            </div>
            {speech.listening ? (
              <div className="mt-2 flex min-h-6 items-center gap-3">
                <span className="flex h-6 items-end gap-0.5" aria-hidden>
                  {[0, 1, 2, 3, 4].map((i) => <i key={i} className="w-1 animate-[wave_0.9s_ease-in-out_infinite] rounded-full bg-gold" style={{ animationDelay: `${i * 0.12}s` }} />)}
                </span>
                <span className="truncate text-sm text-[#c9d4e3] italic">{speech.interim || "…"}</span>
              </div>
            ) : (
              <p className="mt-1 text-sm text-[#c9d4e3]">Say it like you&apos;d tell a friend — loan amount, business age, turnover, profit, EMIs. English or Hindi both work.</p>
            )}
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {LANGS.map((l) => (
                <button key={l.id} onClick={() => { setLang(l.id); if (speech.listening) speech.start(l.id) }} className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-colors", lang === l.id ? "border-gold bg-gold text-navy" : "border-white/25 text-white hover:bg-white/10")}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {!speech.supported && <p className="relative mt-4 rounded-lg bg-white/10 px-3 py-2 text-xs text-[#d8e2ea]">Voice input needs Chrome or Edge (desktop or Android). You can always type below.</p>}
        {speech.error && <p role="alert" className="relative mt-4 rounded-lg bg-destructive/20 px-3 py-2 text-xs text-white">{speech.error}</p>}
      </div>

      {/* text */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase"><Keyboard className="size-3.5" /> Or Type — Your Words Appear Here</span>
          {text && <button onClick={() => onText("")} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive"><X className="size-3.5" /> Clear</button>}
        </div>
        <Textarea
          ref={textRef}
          value={text}
          onChange={(e) => onText(e.target.value)}
          placeholder={"E.g. I need a loan of 50 lakh. My business is 6 years old, turnover 3 crore, profit 25 lakh. EMI 40,000 per month. CIBIL 752."}
          className="min-h-[170px] bg-white text-[15px] leading-relaxed"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase"><Sparkles className="size-3.5 text-gold-deep" /> Try An Example</div>
        <div className="grid gap-2 sm:grid-cols-3">
          {EXAMPLES.map((e) => (
            <button key={e.id} onClick={() => playExample(e.text)} className="flex items-center gap-2 rounded-xl border-[1.5px] border-input bg-white p-3 text-left text-sm font-semibold text-navy transition-colors hover:border-trust-blue">
              <Play className="size-4 shrink-0 text-trust-blue" /> {e.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border bg-background px-4 py-3 text-sm">
        <span className="text-muted-foreground">Prefer to just talk to a person?</span>
        <Button variant="outline" size="sm" onClick={() => toast("Callback requested (demo) — an advisor will call within 2 working hours")}><PhoneCall /> Request A Call</Button>
      </div>
    </div>
  )
}
