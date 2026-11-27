import Image from "next/image"
import { BadgeCheck, Gauge, LayoutDashboard, ShieldCheck, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const BENEFITS = [
  { icon: Gauge, t: "Free FundenFlo Score", d: "See your loan-readiness score and exactly why" },
  { icon: ShieldCheck, t: "No impact on CIBIL", d: "Soft check only — your credit score stays safe" },
  { icon: BadgeCheck, t: "Offers from 50+ lenders", d: "Compare rates, fees and approval chances" },
  { icon: LayoutDashboard, t: "Track everything", d: "Applications, documents and score in one place" },
]

/** Navy brand panel shown beside the login form */
export function LoginSide({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("ff-navy-grad relative flex flex-col overflow-hidden p-8 text-white", className)}>
      <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full border border-white/10" />
      <Image src="/brand/logo-white.png" alt="FundenFlo" width={160} height={36} className="relative h-9 w-[160px] self-start" />
      <h2 className={cn("relative mt-8 font-bold text-white", compact ? "text-2xl" : "text-3xl lg:text-4xl")}>
        Your Ambition.<br /><span className="text-gold">Our Direction.</span>
      </h2>
      <p className="relative mt-3 max-w-sm text-sm text-[#c9d4e3]">One login for your score, eligibility, offers and application tracking.</p>
      <ul className="relative mt-7 grid gap-4">
        {BENEFITS.slice(0, compact ? 3 : 4).map((b) => (
          <li key={b.t} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-gold"><b.icon className="size-4.5" /></span>
            <div>
              <div className="text-sm font-semibold">{b.t}</div>
              <div className="text-xs text-[#b8c6e3]">{b.d}</div>
            </div>
          </li>
        ))}
      </ul>
      {!compact && (
        <figure className="relative mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="flex gap-0.5 text-gold">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}</div>
          <blockquote className="mt-2 text-sm text-[#d8e2ea]">“Logged in with my number, saw my score and the reasons in a minute. Got my OD limit sanctioned in a week.”</blockquote>
          <figcaption className="mt-2 text-xs text-[#9fb0d0]">Meera K. · Textile unit owner, Surat</figcaption>
        </figure>
      )}
      <div className={cn("relative flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#9fb0d0]", compact ? "mt-auto pt-8" : "mt-6")}>
        <span>🔒 256-bit encrypted</span><span>RBI-regulated partners</span><span>5,000+ funded</span>
      </div>
    </div>
  )
}
