"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SliderRow } from "@/components/tools/emi-calculator"
import { inr, principalFromEmi } from "@/lib/data"

export function EligibilityCalculator() {
  const [income, setIncome] = useState(80000)
  const [existing, setExisting] = useState(10000)
  const [rate, setRate] = useState(10.5)
  const [months, setMonths] = useState(120)
  const foirLimit = 0.55
  const maxEmi = Math.max(0, income * foirLimit - existing)
  const amount = Math.floor(principalFromEmi(maxEmi, rate, months) / 10000) * 10000
  const usedPct = Math.min(100, (existing / (income * foirLimit || 1)) * 100)

  return (
    <Card id="eligibility" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold text-navy"><Target className="size-5 text-trust-blue" /> Eligibility Calculator</CardTitle>
        <CardDescription>Lenders usually allow total EMIs up to ~55% of net monthly income (FOIR)</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid content-start gap-7">
          <SliderRow label="Net Monthly Income" value={inr(income)} min={15000} max={1000000} step={5000} v={income} onChange={setIncome} />
          <SliderRow label="Existing EMIs / Month" value={inr(existing)} min={0} max={Math.max(50000, income)} step={1000} v={existing} onChange={setExisting} />
          <SliderRow label="Interest Rate (p.a.)" value={`${rate}%`} min={7} max={20} step={0.25} v={rate} onChange={setRate} />
          <SliderRow label="Tenure" value={`${+(months / 12).toFixed(1)} Years`} min={12} max={360} step={12} v={months} onChange={setMonths} />
        </div>
        <div className="ff-navy-grad flex flex-col rounded-2xl p-6 text-white">
          <div className="text-xs font-semibold tracking-wider text-[#b8c6e3] uppercase">You Can Borrow Up To</div>
          <div className="ff-num mt-1 font-heading text-4xl font-bold text-gold">{inr(amount, { short: true })}</div>
          <div className="mt-1 text-sm text-[#c9d4e3]">With a max EMI of {inr(maxEmi)} / month</div>
          <div className="mt-6">
            <div className="mb-1.5 flex justify-between text-xs text-[#b8c6e3]"><span>EMI Capacity Already Used By Existing Loans</span><b className="ff-num text-white">{Math.round(usedPct)}%</b></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gold" style={{ width: `${usedPct}%` }} /></div>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-[#c9d4e3]">Indicative only. Your credit score, job/business stability and documents change the final amount — get your exact number with the FundenFlo Score.</p>
          <Button asChild className="mt-auto h-11 rounded-xl bg-gold font-bold text-navy hover:bg-[#ffc727]">
            <Link href="/apply">Get My Exact Eligibility <ArrowRight /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
