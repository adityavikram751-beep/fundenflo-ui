"use client"
import { useMemo, useState } from "react"
import { Calculator, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { emi, inr } from "@/lib/data"
import { cn } from "@/lib/utils"

const PRESETS = [
  { l: "Home", amount: 5000000, rate: 8.5, months: 240 },
  { l: "Business", amount: 2500000, rate: 12, months: 60 },
  { l: "Personal", amount: 500000, rate: 11, months: 36 },
  { l: "Car", amount: 900000, rate: 9, months: 60 },
]

export function EmiCalculator() {
  const [amount, setAmount] = useState(2500000)
  const [rate, setRate] = useState(11)
  const [months, setMonths] = useState(60)
  const [showTable, setShowTable] = useState(false)

  const e = emi(amount, rate, months)
  const total = e * months
  const interest = total - amount

  const yearly = useMemo(() => {
    const rows: { y: number; principal: number; interest: number; balance: number }[] = []
    let bal = amount
    const r = rate / 1200
    for (let y = 1; y <= Math.ceil(months / 12); y++) {
      let pp = 0, ii = 0
      for (let m = 0; m < 12 && (y - 1) * 12 + m < months; m++) {
        const it = bal * r, pr = e - it
        ii += it; pp += pr; bal = Math.max(0, bal - pr)
      }
      rows.push({ y, principal: pp, interest: ii, balance: bal })
    }
    return rows
  }, [amount, rate, months, e])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold text-navy"><Calculator className="size-5 text-trust-blue" /> EMI Calculator</CardTitle>
        <CardDescription>Drag the sliders or pick a preset</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid content-start gap-7">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.l} onClick={() => { setAmount(p.amount); setRate(p.rate); setMonths(p.months) }} className="rounded-full border border-input bg-white px-3 py-1 text-xs font-semibold text-navy hover:border-trust-blue hover:bg-subtle">
                {p.l} Loan
              </button>
            ))}
          </div>
          <SliderRow label="Loan Amount" value={inr(amount, { short: true })} min={50000} max={50000000} step={50000} v={amount} onChange={setAmount} />
          <SliderRow label="Interest Rate (p.a.)" value={`${rate}%`} min={7} max={24} step={0.25} v={rate} onChange={setRate} />
          <SliderRow label="Tenure" value={months < 12 ? `${months} Months` : `${+(months / 12).toFixed(1)} Years`} min={6} max={360} step={6} v={months} onChange={setMonths} />
        </div>

        <div className="rounded-2xl border bg-background p-6">
          <div className="text-center">
            <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Monthly EMI</div>
            <div className="ff-num font-heading text-4xl font-bold text-navy">{inr(e)}</div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
            <Donut parts={[{ label: "Principal", value: amount, color: "var(--color-chart-1)" }, { label: "Interest", value: interest, color: "var(--color-chart-2)" }]} />
            <div className="grid gap-2.5 text-sm">
              <LegendRow color="var(--color-chart-1)" label="Principal" value={inr(amount, { short: true })} />
              <LegendRow color="var(--color-chart-2)" label="Total Interest" value={inr(interest, { short: true })} />
              <div className="mt-1 border-t pt-2.5"><LegendRow label="Total Payable" value={inr(total, { short: true })} /></div>
            </div>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-2">
          <button onClick={() => setShowTable((s) => !s)} className="inline-flex items-center gap-1 text-sm font-semibold text-trust-blue hover:underline">
            <ChevronRight className={cn("size-4 transition-transform", showTable && "rotate-90")} /> {showTable ? "Hide" : "Show"} Year-Wise Repayment Schedule
          </button>
          {showTable && (
            <div className="mt-3 max-h-80 overflow-auto rounded-xl border">
              <table className="w-full min-w-[460px] text-sm">
                <thead className="sticky top-0 bg-subtle text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  <tr><th className="px-4 py-2.5">Year</th><th className="px-4 py-2.5 text-right">Principal Paid</th><th className="px-4 py-2.5 text-right">Interest Paid</th><th className="px-4 py-2.5 text-right">Balance</th></tr>
                </thead>
                <tbody className="divide-y">
                  {yearly.map((r) => (
                    <tr key={r.y}>
                      <td className="px-4 py-2">Year {r.y}</td>
                      <td className="ff-num px-4 py-2 text-right">{inr(r.principal)}</td>
                      <td className="ff-num px-4 py-2 text-right">{inr(r.interest)}</td>
                      <td className="ff-num px-4 py-2 text-right font-semibold text-navy">{inr(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function SliderRow({ label, value, v, min, max, step, onChange }: { label: string; value: string; v: number; min: number; max: number; step: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-navy">{label}</span>
        <span className="ff-num rounded-lg bg-subtle px-2.5 py-1 font-heading text-lg font-bold text-navy">{value}</span>
      </div>
      <Slider value={[v]} min={min} max={max} step={step} onValueChange={(x) => onChange(x[0])} aria-label={label} />
    </div>
  )
}

function LegendRow({ color, label, value }: { color?: string; label: string; value: string }) {
  return (
    <div className="flex w-full items-center gap-2.5 sm:min-w-48">
      {color ? <i className="size-3 rounded-sm" style={{ background: color }} /> : <i className="size-3" />}
      <span className="text-muted-foreground">{label}</span>
      <b className="ff-num ml-auto pl-4 text-navy">{value}</b>
    </div>
  )
}

/** 2-part donut with a 2px surface gap between segments; values are labelled in the legend beside it */
function Donut({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const total = parts.reduce((s, p) => s + p.value, 0)
  const R = 58, C = 2 * Math.PI * R
  const starts = parts.map((_, i) => parts.slice(0, i).reduce((s, q) => s + (q.value / total) * C, 0))
  return (
    <div className="relative">
      <svg viewBox="0 0 150 150" className="size-40 -rotate-90" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(", ")}>
        <circle cx="75" cy="75" r={R} fill="none" stroke="var(--color-track)" strokeWidth="20" />
        {parts.map((p, i) => {
          const len = (p.value / total) * C
          return (
            <circle
              key={p.label}
              cx="75" cy="75" r={R} fill="none" stroke={p.color} strokeWidth={hover === i ? 24 : 20}
              strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-starts[i]}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="transition-[stroke-width]"
            />
          )
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="ff-num font-heading text-xl font-bold text-navy">{Math.round(((hover ?? 1) === 1 ? parts[1].value : parts[0].value) / total * 100)}%</div>
          <div className="text-[11px] text-muted-foreground">{(hover ?? 1) === 1 ? parts[1].label : parts[0].label}</div>
        </div>
      </div>
    </div>
  )
}
