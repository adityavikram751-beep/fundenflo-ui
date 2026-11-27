"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Briefcase, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { inr, principalFromEmi } from "@/lib/data"
import { cn } from "@/lib/utils"

/** Live "how much can I borrow" widget on the home page */
export function QuickEligibility() {
  const [type, setType] = useState<"individual" | "business">("individual")
  const [income, setIncome] = useState(75000)
  const [emiNow, setEmiNow] = useState(5000)
  const isBiz = type === "business"
  const factor = isBiz ? 0.6 : 0.55
  const rate = isBiz ? 12.5 : 11
  const months = isBiz ? 60 : 60
  const maxEmi = Math.max(0, income * factor - emiNow)
  const amount = Math.floor(principalFromEmi(maxEmi, rate, months) / 10000) * 10000
  const home = Math.floor(principalFromEmi(maxEmi, 8.75, 240) / 10000) * 10000

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Quick eligibility check</h3>
        <div className="inline-flex rounded-lg border bg-subtle p-0.5 text-sm">
          {([["individual", "Individual", User], ["business", "Business", Briefcase]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setType(id)} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold text-muted-foreground", type === id && "bg-white text-navy shadow-sm")}>
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="font-medium text-muted-foreground">{isBiz ? "Monthly cash profit" : "Monthly in-hand income"}</span>
            <b className="ff-num text-lg text-navy">{inr(income)}</b>
          </div>
          <Slider value={[income]} min={15000} max={isBiz ? 2000000 : 500000} step={5000} onValueChange={(v) => setIncome(v[0])} aria-label="Monthly income" />
        </div>
        <div>
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="font-medium text-muted-foreground">Existing EMIs per month</span>
            <b className="ff-num text-lg text-navy">{inr(emiNow)}</b>
          </div>
          <Slider value={[emiNow]} min={0} max={Math.max(50000, income)} step={1000} onValueChange={(v) => setEmiNow(v[0])} aria-label="Existing EMIs" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-subtle p-4">
          <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{isBiz ? "Business loan" : "Personal loan"} · 5 yrs</div>
          <div className="ff-num mt-1 font-heading text-2xl font-bold text-navy">{inr(isBiz ? amount : Math.min(amount, income * 30), { short: true })}</div>
        </div>
        <div className="rounded-xl bg-subtle p-4">
          <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{isBiz ? "LAP / secured" : "Home loan"} · 20 yrs</div>
          <div className="ff-num mt-1 font-heading text-2xl font-bold text-navy">{inr(home, { short: true })}</div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Indicative, assuming a good credit score. Your exact eligibility depends on your FundenFlo Score.</p>
      <Button asChild className="mt-4 h-11 w-full rounded-xl text-sm font-semibold">
        <Link href={`/apply?type=${type}`}>Get my exact score & offers <ArrowRight /></Link>
      </Button>
    </div>
  )
}
