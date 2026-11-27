"use client"
import { useState } from "react"
import { Calculator } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SliderRow } from "@/components/tools/emi-calculator"
import { emi, inr } from "@/lib/data"

/** Compact EMI calculator for product pages */
export function MiniEmi({ rate, months: m0, maxAmount }: { rate: number; months: number; maxAmount: number }) {
  const cap = Math.min(maxAmount, 50000000)
  const [amount, setAmount] = useState(Math.min(2500000, cap))
  const [months, setMonths] = useState(m0)
  const e = emi(amount, rate, months)
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 font-heading text-base font-semibold text-navy"><Calculator className="size-4 text-trust-blue" /> EMI Estimate</CardTitle></CardHeader>
      <CardContent className="grid gap-5">
        <SliderRow label="Amount" value={inr(amount, { short: true })} v={amount} min={50000} max={cap} step={50000} onChange={setAmount} />
        <SliderRow label="Tenure" value={months < 12 ? `${months} mo` : `${+(months / 12).toFixed(1)} yrs`} v={months} min={6} max={Math.max(m0, 360)} step={6} onChange={setMonths} />
        <div className="rounded-xl bg-navy p-4 text-center text-white">
          <div className="text-xs text-[#9fb0d0]">Monthly EMI at {rate.toFixed(2)}%</div>
          <div className="ff-num font-heading text-3xl font-bold text-gold">{inr(e)}</div>
          <div className="text-xs text-[#c9d4e3]">Total interest {inr(e * months - amount, { short: true })}</div>
        </div>
      </CardContent>
    </Card>
  )
}
