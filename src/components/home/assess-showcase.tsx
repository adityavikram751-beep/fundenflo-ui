import { ArrowRight, CircleCheck, FileCheck, Mic, ShieldCheck, Sparkles, TriangleExclamationPoint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedLink } from "@/components/auth/require-login"

/** Home-page section introducing the voice/text Smart Credit Assessment */
export function AssessShowcase() {
  return (
    <section className="relative overflow-hidden bg-navy py-14 text-white sm:py-20">
      <div className="pointer-events-none absolute -top-40 -left-40 size-[560px] rounded-full border border-white/5" />
      <div className="pointer-events-none absolute -right-32 -bottom-48 size-[520px] rounded-full bg-trust-blue/20 blur-3xl" />
      <div className="ff-container relative grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-xs font-extrabold tracking-wider text-navy uppercase"><Sparkles className="size-3.5" /> New · Smart Credit Assessment</span>
          <h2 className="mt-5 text-3xl font-bold text-white md:text-5xl">Don&apos;t Fill Forms. <span className="text-gold">Just Tell Us.</span></h2>
          <p className="mt-4 max-w-xl text-lg text-[#c9d4e3]">Speak on your phone or type it the way you&apos;d explain it to your CA — loan amount, business age, turnover. Our AI builds your credit assessment, then verifies it against your balance sheets and bank statements.</p>
          <ol className="mt-8 grid gap-3">
            {[
              [Mic, "Speak Or Write", "English or Hindi — “I need a ₹50 lakh loan for a machine, my business is 6 years old…”"],
              [Sparkles, "Instant Preliminary Assessment", "Score, eligibility, matched lenders and what's holding you back."],
              [ShieldCheck, "Verify With Documents", "2 years of balance sheets + bank statements confirm what you said and add points."],
            ].map(([Icon, t, d], i) => {
              const I = Icon as React.ElementType
              return (
                <li key={i} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 transition-colors hover:bg-white/[0.07]">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-gold ring-1 ring-white/10"><I className="size-5" /></span>
                  <div><div className="font-semibold">{t as string}</div><div className="text-sm text-[#b8c6e3]">{d as string}</div></div>
                </li>
              )
            })}
          </ol>
          <Button asChild className="mt-8 h-12 rounded-xl bg-gold px-6 text-base font-bold text-navy shadow-[0_10px_24px_rgb(253_185_1/0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#ffc727]"><ProtectedLink href="/assess"><Mic className="size-5" /> Try It Now — It&apos;s Free</ProtectedLink></Button>
        </div>

        {/* mock product UI */}
        <div className="relative mx-auto w-full max-w-[540px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="relative grid size-12 place-items-center rounded-full bg-gold text-navy">
                <span className="absolute inset-0 animate-ping rounded-full bg-gold/30" />
                <Mic className="relative size-5" />
              </span>
              <div className="flex h-8 items-end gap-1" aria-hidden>
                {[40, 75, 55, 95, 60, 85, 45, 70, 35, 80, 50, 65].map((h, i) => (
                  <i key={i} className="w-1.5 animate-[wave_1s_ease-in-out_infinite] rounded-full bg-gold/80" style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
              <span className="ml-auto text-xs text-[#9fb0d0]">Listening · English</span>
            </div>
            <p className="mt-4 rounded-2xl rounded-tl-sm bg-white p-4 text-[15px] leading-relaxed text-navy">
              “I need a <mark className="rounded bg-gold-soft px-1 text-navy">50 lakh loan</mark> for a new machine. My business is <mark className="rounded bg-gold-soft px-1 text-navy">6 years old</mark>, <mark className="rounded bg-gold-soft px-1 text-navy">turnover 3 crore</mark>, profit 25 lakh…”
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Loan ₹50 L", "Machinery loan", "6 yrs vintage", "Turnover ₹3 Cr", "Profit ₹25 L"].map((c) => (
                <span key={c} className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2.5 py-1 text-xs font-semibold text-[#9be3b8]"><CircleCheck className="size-3.5" /> {c}</span>
              ))}
            </div>
          </div>

          <div className="relative -mt-4 ml-auto w-[92%] rounded-3xl bg-white p-4 text-navy shadow-2xl sm:w-[88%] sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Credit Assessment</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-bold text-success"><ShieldCheck className="size-3" /> Document-Verified</span>
            </div>
            <div className="mt-3 flex items-end gap-4">
              <div><div className="text-[11px] text-muted-foreground">Self-Declared</div><div className="ff-num font-heading text-3xl font-bold text-slate-400">795</div></div>
              <ArrowRight className="mb-2 size-5 text-gold-deep" />
              <div><div className="text-[11px] text-muted-foreground">Verified</div><div className="ff-num font-heading text-4xl font-bold">852</div></div>
              <span className="ff-num mb-2 rounded-full bg-gold px-2 py-0.5 text-sm font-bold">+57</span>
            </div>
            <div className="mt-4 grid gap-2 text-xs">
              <div className="flex items-center gap-2"><FileCheck className="size-4 text-success" /> Turnover matches balance sheet <b className="ml-auto text-success">+12</b></div>
              <div className="flex items-center gap-2"><FileCheck className="size-4 text-success" /> Revenue growth 16% YoY <b className="ml-auto text-success">+6</b></div>
              <div className="flex items-center gap-2"><TriangleExclamationPoint className="size-4 text-warning" /> 1 undisclosed EMI found <b className="ml-auto text-destructive">−8</b></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
