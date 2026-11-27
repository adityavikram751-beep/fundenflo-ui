"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight, BadgeCheck, Bot, CircleCheck, CircleX, Clock, IndianRupee, Lightbulb, Percent, Printer, Sparkles,
  Target, TriangleExclamationPoint, TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ScoreGauge, SEV_COLOR } from "@/components/score-gauge"
import { openChat } from "@/components/chat-widget"
import { toast } from "@/components/toaster"
import { inr, productById } from "@/lib/data"
import { simulateScore, type Issue, type Profile, type ScoreResult, type Severity } from "@/lib/scoring"
import { KEYS, useStored, type SavedOffer } from "@/lib/store"
import { cn } from "@/lib/utils"

const SEV_ICON = { good: CircleCheck, warn: TriangleExclamationPoint, bad: CircleX }
const SEV_LABEL: Record<Severity, string> = { good: "Strong", warn: "Average", bad: "Weak" }
const SEV_BG: Record<Severity, string> = { good: "bg-success-soft", warn: "bg-warning-soft", bad: "bg-error-soft" }

function percentile(score: number) {
  // rough normal CDF around a typical applicant pool (mean 690, sd 70)
  const z = (score - 690) / 70
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return Math.min(99, Math.max(1, Math.round((z > 0 ? 1 - p : p) * 100)))
}

export function verdict(r: ScoreResult) {
  const top = r.issues.find((i) => i.sev === "bad") ?? r.issues.find((i) => i.sev === "warn" && i.impact)
  const potential = r.improvements.length ? simulateScore(r.profile, r.improvements.map((i) => i.id)).score : r.score
  if (r.grade.cls === "good" && !r.issues.some((i) => i.sev === "bad"))
    return `Strong profile. You qualify for prime-rate lenders — lock an offer below while your score is ${r.score}.`
  if (r.grade.cls === "bad")
    return `Most banks would decline right now${top ? `, mainly because of “${top.title.toLowerCase()}”` : ""}. Follow the improvement plan — your score can reach about ${potential}.`
  return `Approvable, but ${top ? `“${top.title.toLowerCase()}”` : "a few gaps"} is costing you points. Fixing the top items can take you to about ${potential}.`
}

export function ScoreReport({ result: r, compactHeader = false }: { result: ScoreResult; raw?: Profile; compactHeader?: boolean }) {
  const p = r.profile
  const product = productById(p.product)
  const pctl = percentile(r.score)
  const bad = r.issues.filter((i) => i.sev !== "good")
  const good = r.issues.filter((i) => i.sev === "good")

  return (
    <div className="grid min-w-0 gap-6 [&>*]:min-w-0">
      {/* ---------- top: gauge + KPIs ---------- */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="py-6">
          <CardContent>
            <ScoreGauge score={r.score} />
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Better than <b className="text-navy">{pctl}%</b> of applicants for {product.name.toLowerCase()}s
            </p>
          </CardContent>
        </Card>

        <Card className="py-6">
          <CardContent className="grid gap-5">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <Kpi icon={IndianRupee} label="Eligible amount" value={inr(r.eligible, { short: true })} sub={`You asked ${inr(p.loanAmount, { short: true })}`} />
              <Kpi icon={Percent} label="Est. interest rate" value={`${r.rate}%`} sub={`${product.name} · p.a.`} />
              <Kpi icon={Clock} label="Monthly EMI" value={inr(r.emi)} sub={`${p.tenureMonths} months`} />
              <Kpi icon={Target} label="Approval chance" value={`${Math.round(r.approval * 100)}%`} bar={r.approval} />
            </div>
            <div className="flex gap-3 rounded-xl border border-[#f3d98a] bg-gold-soft/70 p-4 text-sm text-[#5a4200]">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-gold-deep" />
              <div><b className="text-navy">Flo&apos;s verdict: </b>{verdict(r)}</div>
            </div>
            {!compactHeader && (
              <div className="no-print flex flex-wrap gap-2">
                <Button className="h-10 rounded-xl px-4" onClick={() => document.getElementById("improve")?.scrollIntoView({ behavior: "smooth" })}>
                  <TrendingUp /> Improve my score
                </Button>
                <Button variant="outline" className="h-10 rounded-xl px-4" onClick={() => openChat("Why is my score low?")}>
                  <Bot /> Ask Flo about my score
                </Button>
                <Button variant="outline" className="h-10 rounded-xl px-4" onClick={() => window.print()}>
                  <Printer /> Download report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------- factors + issues ---------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-semibold text-navy">Score breakdown</CardTitle>
            <CardDescription>6 factors lenders look at — each scored out of 100</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {r.factors.map((f) => {
              const Icon = SEV_ICON[f.status]
              return (
                <div key={f.key}>
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <div className="text-sm font-semibold text-navy">
                      {f.name} <span className="text-xs font-medium text-muted-foreground">· {f.weight}% weight</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: SEV_COLOR[f.status] }}>
                        <Icon className="size-3.5" /> {SEV_LABEL[f.status]}
                      </span>
                      <b className="ff-num text-right text-navy sm:w-14">{Math.round(f.value)}/100</b>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-2.5 cursor-default overflow-hidden rounded-full bg-track py-0">
                        <div className="h-full rounded-full bg-chart-1 transition-[width] duration-700" style={{ width: `${Math.max(2, f.value)}%` }} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {f.name}: {Math.round(f.value)}/100 · {f.lost > 0 ? `costing ${f.lost} points` : "no points lost"}
                    </TooltipContent>
                  </Tooltip>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {f.note}
                    {f.lost > 0 && <span className="font-semibold text-destructive"> · −{f.lost} pts</span>}
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg font-semibold text-navy">Why your score is {r.score}, not 900</CardTitle>
            <CardDescription>{bad.length ? `${bad.length} issue${bad.length > 1 ? "s" : ""} found — biggest impact first` : "No major issues found"}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2.5">
            {bad.map((i, k) => <IssueRow key={k} i={i} />)}
            {good.length > 0 && (
              <>
                <div className="mt-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">What&apos;s working</div>
                {good.map((i, k) => <IssueRow key={`g${k}`} i={i} />)}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Simulator r={r} />
      <Offers r={r} />
    </div>
  )
}

function Kpi({ icon: Icon, label, value, sub, bar }: { icon: React.ElementType; label: string; value: string; sub?: string; bar?: number }) {
  return (
    <div className="rounded-xl border bg-subtle/60 p-3 sm:p-3.5">
      <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase"><Icon className="size-3.5 shrink-0" /> {label}</div>
      <div className="ff-num mt-1 font-heading text-xl font-bold text-navy sm:text-2xl">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      {bar != null && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-track">
          <div className="h-full rounded-full bg-chart-1" style={{ width: `${bar * 100}%` }} />
        </div>
      )}
    </div>
  )
}

function IssueRow({ i }: { i: Issue }) {
  const Icon = SEV_ICON[i.sev]
  return (
    <div className="flex items-start gap-3 rounded-xl border border-l-4 bg-white p-3.5" style={{ borderLeftColor: SEV_COLOR[i.sev] }}>
      <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg", SEV_BG[i.sev])} style={{ color: SEV_COLOR[i.sev] }}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
          <div className="text-sm font-semibold text-navy">{i.title}</div>
          {i.impact ? <span className="ff-num text-xs font-bold whitespace-nowrap sm:text-sm" style={{ color: SEV_COLOR[i.sev] }}>−{i.impact} pts</span> : null}
        </div>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{i.why}</p>
        {i.sev !== "good" && (
          <div className="mt-2 flex gap-2 rounded-lg bg-subtle px-2.5 py-2 text-[13px] text-navy">
            <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-gold-deep" />
            <span><b>Fix:</b> {i.fix}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function Simulator({ r }: { r: ScoreResult }) {
  const [sel, setSel] = useState<string[]>([])
  const sim = useMemo(() => (sel.length ? simulateScore(r.profile, sel) : null), [sel, r.profile])
  if (!r.improvements.length) return null
  const newScore = sim?.score ?? r.score
  const delta = newScore - r.score
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <Card id="improve" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold text-navy"><TrendingUp className="size-5 text-gold-deep" /> Score improvement simulator</CardTitle>
        <CardDescription>Tick the fixes you can do — see your new score, rate and eligibility instantly</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-dashed">
          {r.improvements.map((imp) => (
            <label key={imp.id} className="flex cursor-pointer items-center gap-3 py-3">
              <Checkbox checked={sel.includes(imp.id)} onCheckedChange={() => toggle(imp.id)} aria-label={imp.t} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-navy">{imp.t}</div>
                <div className="text-xs text-muted-foreground">{imp.d}</div>
              </div>
              <span className="ff-num text-sm font-bold text-success">+{imp.gain} pts</span>
            </label>
          ))}
          <div className="flex gap-2 pt-3">
            <Button size="sm" variant="outline" onClick={() => setSel(r.improvements.map((i) => i.id))}>Select all</Button>
            <Button size="sm" variant="ghost" onClick={() => setSel([])}>Clear</Button>
          </div>
        </div>
        <div className="ff-navy-grad rounded-2xl p-5 text-white">
          <div className="text-xs font-semibold tracking-wider text-[#b8c6e3] uppercase">Potential score</div>
          <div className="mt-1 flex items-end gap-3">
            <span className="ff-num font-heading text-5xl font-bold">{newScore}</span>
            <span className={cn("ff-num mb-2 rounded-full px-2 py-0.5 text-sm font-bold", delta > 0 ? "bg-gold text-navy" : "bg-white/10 text-white")}>
              {delta > 0 ? `+${delta}` : "±0"}
            </span>
          </div>
          <div className="mt-1 text-sm text-[#b8c6e3]">from {r.score} today</div>
          <div className="mt-5 grid gap-2.5 text-sm">
            <Row k="Interest rate" a={`${r.rate}%`} b={sim ? `${sim.rate}%` : null} />
            <Row k="Eligible amount" a={inr(r.eligible, { short: true })} b={sim ? inr(sim.eligible, { short: true }) : null} />
            <Row k="Approval chance" a={`${Math.round(r.approval * 100)}%`} b={sim ? `${Math.round(sim.approval * 100)}%` : null} />
          </div>
          {sel.length > 0 && sim && (
            <p className="mt-4 rounded-lg bg-white/10 p-3 text-xs leading-relaxed text-[#d8e2ea]">
              On a {inr(r.profile.loanAmount, { short: true })} loan, a {Math.max(0, r.rate - sim.rate).toFixed(2)}% lower rate saves about{" "}
              <b className="text-gold">{inr(Math.max(0, (r.emi - sim.emi) * r.profile.tenureMonths), { short: true })}</b> in interest.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Row({ k, a, b }: { k: string; a: string; b: string | null }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-2">
      <span className="text-[#b8c6e3]">{k}</span>
      <span className="ff-num font-semibold">
        {b && b !== a ? <><span className="mr-1.5 text-[#8ea0bf] line-through">{a}</span>{b}</> : a}
      </span>
    </div>
  )
}

function Offers({ r }: { r: ScoreResult }) {
  const [chosen, setChosen] = useStored<SavedOffer>(KEYS.offer)
  const select = (o: ScoreResult["offers"][number]) => {
    setChosen({ code: o.code, name: o.name, rate: o.rate, amount: o.amount, speed: o.speed, at: new Date().toISOString() })
    toast(`Offer from ${o.name} locked — track it on your dashboard`)
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold text-navy"><BadgeCheck className="size-5 text-trust-blue" /> Matched lender offers</CardTitle>
        <CardDescription>Ranked by your approval chance · demo lenders, indicative terms</CardDescription>
      </CardHeader>
      <CardContent>
        {/* mobile cards */}
        <div className="grid gap-3 md:hidden">
          {r.offers.map((o, i) => (
            <div key={o.code} className={cn("rounded-xl border p-4", i === 0 && "border-gold bg-gold-soft/30")}>
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-extrabold text-white" style={{ background: o.color }}>{o.code}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 font-semibold text-navy">
                    <span>{o.name}</span>
                    {i === 0 && <span className="rounded bg-gold px-1.5 py-px text-[10px] font-extrabold text-navy">BEST MATCH</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{o.type} · {o.fee} · {o.speed}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-white/80 p-2.5 text-center">
                <div><div className="text-[10px] text-muted-foreground uppercase">Rate</div><div className="ff-num font-bold text-navy">{o.rate}%</div></div>
                <div><div className="text-[10px] text-muted-foreground uppercase">Amount</div><div className="ff-num font-bold text-navy">{inr(o.amount, { short: true })}</div></div>
                <div><div className="text-[10px] text-muted-foreground uppercase">EMI</div><div className="ff-num font-bold text-navy">{inr(o.emi)}</div></div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-track"><div className="h-full rounded-full bg-chart-1" style={{ width: `${o.chance}%` }} /></div>
                  <span className="ff-num text-xs font-bold text-navy">{o.chance}%</span>
                </div>
                {chosen?.code === o.code ? (
                  <Button size="sm" variant="outline" asChild><Link href="/dashboard"><CircleCheck className="text-success" /> Selected</Link></Button>
                ) : (
                  <Button size="sm" disabled={o.chance < 10} onClick={() => select(o)}>Select <ArrowRight /></Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* desktop table */}
        <div className="hidden overflow-x-auto rounded-xl border md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-subtle text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Lender</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">EMI</th>
                <th className="px-4 py-3">Fee · Speed</th>
                <th className="px-4 py-3">Approval chance</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {r.offers.map((o, i) => (
                <tr key={o.code} className={cn(i === 0 && "bg-gold-soft/30")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg text-xs font-extrabold text-white" style={{ background: o.color }}>{o.code}</span>
                      <div>
                        <div className="font-semibold text-navy">{o.name} {i === 0 && <span className="ml-1 rounded bg-gold px-1.5 py-px text-[10px] font-extrabold text-navy">BEST MATCH</span>}</div>
                        <div className="text-xs text-muted-foreground">{o.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ff-num px-4 py-3 text-right font-bold text-navy">{o.rate}%</td>
                  <td className="ff-num px-4 py-3 text-right">{inr(o.amount, { short: true })}</td>
                  <td className="ff-num px-4 py-3 text-right">{inr(o.emi)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.fee} · {o.speed}</td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[130px] items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-track"><div className="h-full rounded-full bg-chart-1" style={{ width: `${o.chance}%` }} /></div>
                      <span className="ff-num w-9 text-right text-xs font-bold text-navy">{o.chance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {chosen?.code === o.code ? (
                      <Button size="sm" variant="outline" asChild><Link href="/dashboard"><CircleCheck className="text-success" /> Selected</Link></Button>
                    ) : (
                      <Button size="sm" disabled={o.chance < 10} onClick={() => select(o)}>Select <ArrowRight /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
