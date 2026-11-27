"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, Send, X } from "lucide-react"
import { DEFAULT_CHIPS, esc, greeting, reply, type BotReply } from "@/lib/chat-engine"
import { KEYS, useStored, type SavedOffer, type SavedResult } from "@/lib/store"
import { cn } from "@/lib/utils"

interface Msg { id: number; who: "bot" | "user"; html: string; typing?: boolean }
let seq = 0

/** Open Flo from anywhere: openChat("optional message to send") */
export function openChat(message?: string) {
  window.dispatchEvent(new CustomEvent("ff-chat-open", { detail: message }))
}

export function ChatWidget() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [chips, setChips] = useState<string[]>(DEFAULT_CHIPS)
  const [input, setInput] = useState("")
  const [result] = useStored<SavedResult>(KEYS.result)
  const [offer] = useStored<SavedOffer>(KEYS.offer)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const greeted = useRef(false)
  const ctx = useRef({ result, offer })
  useEffect(() => { ctx.current = { result, offer } }, [result, offer])

  const botSay = (r: BotReply) => {
    const id = ++seq
    setMsgs((m) => [...m, { id, who: "bot", html: "", typing: true }])
    const delay = Math.min(1300, 420 + r.html.length * 1.1)
    setTimeout(() => {
      setMsgs((m) => m.map((x) => (x.id === id ? { ...x, html: r.html, typing: false } : x)))
      setChips(r.chips ?? DEFAULT_CHIPS)
    }, delay)
  }

  const send = (text: string) => {
    const t = text.trim()
    if (!t) return
    setMsgs((m) => [...m, { id: ++seq, who: "user", html: esc(t) }])
    botSay(reply(t, ctx.current))
  }
  const sendRef = useRef(send)
  useEffect(() => { sendRef.current = send })

  // open requests from other components
  useEffect(() => {
    const on = (e: Event) => {
      setOpen(true)
      const m = (e as CustomEvent<string | undefined>).detail
      if (m) setTimeout(() => sendRef.current(m), 350)
    }
    window.addEventListener("ff-chat-open", on)
    return () => window.removeEventListener("ff-chat-open", on)
  }, [])

  useEffect(() => {
    if (open && !greeted.current) {
      greeted.current = true
      botSay(greeting(ctx.current))
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" })
  }, [msgs])

  const onBodyClick = (e: React.MouseEvent) => {
    const nav = (e.target as HTMLElement).closest<HTMLElement>("[data-nav]")
    if (nav?.dataset.nav) {
      router.push(nav.dataset.nav)
      if (window.innerWidth < 640) setOpen(false)
    }
  }

  return (
    <div className="no-print">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Flo AI assistant"
          className="fixed right-5 bottom-5 z-50 flex items-center gap-2.5 rounded-full bg-navy py-2.5 pr-5 pl-2.5 font-semibold text-white shadow-[0_12px_30px_rgb(10_25_47/0.35)] transition-transform hover:-translate-y-0.5"
        >
          <span className="relative grid size-10 place-items-center rounded-full bg-gold text-navy">
            <Bot className="size-5" />
            <span className="absolute top-0 right-0 size-2.5 rounded-full border-2 border-navy bg-[#2ecc71]" />
          </span>
          Ask Flo AI
        </button>
      )}

      <div
        role="dialog"
        aria-label="Flo AI assistant"
        className={cn(
          "fixed right-0 bottom-0 z-50 flex h-full w-full origin-bottom-right flex-col overflow-hidden bg-white shadow-2xl transition-all duration-200 sm:right-5 sm:bottom-5 sm:h-[min(640px,calc(100vh-40px))] sm:w-[400px] sm:rounded-2xl sm:border",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
        )}
      >
        <div className="ff-navy-grad flex items-center gap-3 px-4 py-3.5 text-white">
          <div className="grid size-10 place-items-center rounded-full bg-gold text-navy"><Bot className="size-5" /></div>
          <div>
            <div className="font-semibold">Flo · FundenFlo AI</div>
            <div className="flex items-center gap-1.5 text-xs text-[#b8c6e3]"><span className="size-1.5 rounded-full bg-[#2ecc71]" /> Online · English & Hinglish</div>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close chat" className="ml-auto grid size-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20">
            <X className="size-4" />
          </button>
        </div>

        <div ref={bodyRef} onClick={onBodyClick} className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-background p-4" aria-live="polite">
          {msgs.map((m) =>
            m.typing ? (
              <div key={m.id} className="flex gap-1 self-start rounded-2xl rounded-bl-sm border bg-white px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1.5 animate-pulse rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            ) : (
              <div
                key={m.id}
                className={cn(
                  "max-w-[88%] animate-in rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed fade-in slide-in-from-bottom-1",
                  m.who === "bot" ? "self-start rounded-bl-sm border bg-white" : "self-end rounded-br-sm bg-navy text-white",
                )}
                dangerouslySetInnerHTML={{ __html: m.html }}
              />
            ),
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 border-t bg-white px-3.5 pt-2.5">
          {chips.map((c) => (
            <button key={c} onClick={() => send(c)} className="rounded-full border border-input bg-white px-2.5 py-1 text-xs font-medium text-navy hover:border-trust-blue hover:bg-subtle">
              {c}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2 bg-white px-3.5 pt-2.5 pb-2"
          onSubmit={(e) => { e.preventDefault(); send(input); setInput("") }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type in English or Hinglish…"
            aria-label="Message"
            className="h-11 flex-1 rounded-xl border border-input px-3 text-sm outline-none focus:border-trust-blue focus:ring-3 focus:ring-trust-blue/15"
          />
          <button type="submit" aria-label="Send" className="grid w-11 place-items-center rounded-xl bg-gold text-navy hover:bg-[#ffc727]">
            <Send className="size-4" />
          </button>
        </form>
        <p className="bg-white pb-2 text-center text-[11px] text-muted-foreground">Demo assistant · answers are indicative, not a loan offer</p>
      </div>
    </div>
  )
}
