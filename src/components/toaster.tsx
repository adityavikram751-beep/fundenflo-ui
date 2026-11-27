"use client"
import { useEffect, useState } from "react"
import { CircleCheck } from "lucide-react"

/** Minimal toast: call toast("message") from any client component */
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("ff-toast", { detail: message }))
}

export function Toaster() {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([])
  useEffect(() => {
    const on = (e: Event) => {
      const id = Date.now() + Math.random()
      setItems((s) => [...s, { id, msg: (e as CustomEvent<string>).detail }])
      setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3200)
    }
    window.addEventListener("ff-toast", on)
    return () => window.removeEventListener("ff-toast", on)
  }, [])
  return (
    <div className="no-print pointer-events-none fixed top-20 left-1/2 z-[100] grid -translate-x-1/2 gap-2" aria-live="polite">
      {items.map((i) => (
        <div key={i.id} className="flex animate-in items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm text-white shadow-xl fade-in slide-in-from-top-2">
          <CircleCheck className="size-4 text-gold" /> {i.msg}
        </div>
      ))}
    </div>
  )
}
