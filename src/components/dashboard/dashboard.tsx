"use client"
import { useMemo } from "react"
import Link from "next/link"
import {
  ArrowRight, Bell, Bot, Calculator, Check, CircleCheck, FileCheck, FileText, Gauge, IndianRupee, LayoutDashboard, ListChecks, Percent,
  ScanText, Sparkles, TrendingUp, Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { openChat } from "@/components/chat-widget"
import { toast } from "@/components/toaster"
import { ScoreTrend } from "@/components/dashboard/score-trend"
import { DOCS, inr, initials, productById } from "@/lib/data"
import { computeScore, simulateScore, type Profile, type ScoreResult } from "@/lib/scoring"
import { KEYS, useStored, type SavedOffer, type SavedResult } from "@/lib/store"
import { maskPhone, useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

/** Shown until the user runs their own assessment */
const DEMO_PROFILE: Profile = {
  type: "business", product: "business", name: "Ayesha Khan", businessName: "Khan Organic Foods", city: "Indore", industry: "Packaged foods",
  loanAmount: 1500000, tenureMonths: 48, creditScore: 705, existingEmi: 9000, vintageYears: 1, annualTurnover: 1800000, netProfit: 720000,
  gst: false, itrYears: 0, chequeBounces: 1, latePayments: 0, enquiries: 2, docs: ["pan", "kyc", "bank"],
}

const SIDE = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "application", label: "Application", icon: FileText },
  { id: "plan", label: "Improvement Plan", icon: ListChecks },
  { id: "documents", label: "Documents", icon: FileCheck },
  { id: "offers", label: "Offers", icon: IndianRupee },
]

export function Dashboard() {
  const [saved, , ready] = useStored<SavedResult>(KEYS.result)
  // everything below reads the browser (localStorage, current date) — render it client-side only
  if (!ready) return <div className="ff-container py-10"><Card className="h-96 animate-pulse" /></div>
  return <DashboardBody saved={saved} />
}

function DashboardBody({ saved }: { saved: SavedResult | null }) {
  const [offer, setOffer] = useStored<SavedOffer>(KEYS.offer)
  const { user } = useAuth()
  const [tasks, setTasks] = useStored<string[]>(KEYS.tasks)
  const done = useMemo(() => tasks ?? [], [tasks])

  const isDemo = !saved
  const raw = useMemo(() => saved?.raw ?? DEMO_PROFILE, [saved])
  const r: ScoreResult = useMemo(() => computeScore(raw), [raw])
  const projected = useMemo(() => (done.length ? simulateScore(r.profile, done).score : null), [done, r.profile])
  const history = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
      return d.toLocaleString("en-IN", { month: "short" })
    })
    const offs = [-58, -44, -39, -22, -14, 0]
    return months.map((m, i) => ({ label: m, value: Math.max(300, r.score + offs[i]) }))
  }, [r.score])

  const p = r.profile
  const name = user?.name || p.name || "there" // greet the logged-in account
  const reqDocs = DOCS[p.type].filter((d) => d.req)
  const docsReady = reqDocs.filter((d) => p.docs.includes(d.id)).length
  const toggleTask = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id]
    setTasks(next)
    if (!done.includes(id)) toast("Nice! Task marked done — projected score updated")
  }

  const timeline = [
    { t: "Profile Created", s: saved ? new Date(saved.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Demo", done: true },
    { t: "AI Assessment Complete", s: `FundenFlo Score ${r.score}`, done: true },
    { t: offer ? `Offer Selected — ${offer.name}` : "Choose A Lender Offer", s: offer ? `${offer.rate}% · ${inr(offer.amount, { short: true })}` : "Compare matched offers below", done: !!offer, current: !offer },
    { t: "Document Verification", s: `${docsReady}/${reqDocs.length} key documents verified`, done: !!offer && docsReady === reqDocs.length, current: !!offer && docsReady < reqDocs.length },
    { t: "Lender Sanction", s: offer ? `Expected in ${offer.speed}` : "After documents", done: false, current: !!offer && docsReady === reqDocs.length },
    { t: "Disbursal", s: "Funds credited to your account", done: false },
  ]

  return (
    <div className="ff-container grid items-start gap-6 py-8 lg:grid-cols-[230px_1fr]">
      {/* ---------- side ---------- */}
      <aside className="hidden lg:sticky lg:top-24 lg:block">
        <Card className="py-4">
          <CardContent className="px-3">
            <div className="mb-3 flex items-center gap-3 border-b px-2 pb-4">
              <span className="grid size-10 place-items-center rounded-full bg-navy text-sm font-bold text-gold">{initials(user?.name || p.name)}</span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-navy">{user?.name || p.name || "Demo user"}</div>
                <div className="truncate text-xs text-muted-foreground">{user ? maskPhone(user.phone) : p.type === "business" ? p.businessName || "Business" : "Individual"}</div>
              </div>
            </div>
            <nav className="grid gap-0.5">
              {SIDE.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-navy hover:bg-subtle">
                  <s.icon className="size-4 text-trust-blue" /> {s.label}
                </a>
              ))}
              <Link href="/tools" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-navy hover:bg-subtle"><Calculator className="size-4 text-trust-blue" /> EMI Tools</Link>
            </nav>
            <button onClick={() => openChat()} className="mt-4 flex w-full items-center gap-2 rounded-xl bg-gold-soft p-3 text-left text-xs text-[#5a4200]">
              <Bot className="size-5 shrink-0 text-gold-deep" /> <span><b className="text-navy">Need Help?</b><br />Ask Flo, 24×7</span>
            </button>
          </CardContent>
        </Card>
      </aside>

      {/* ---------- main ---------- */}
      <div className="grid min-w-0 gap-6">
        <nav aria-label="Dashboard sections" className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {SIDE.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.5 text-xs font-semibold text-navy shadow-xs hover:bg-subtle">
              <s.icon className="size-3.5 text-trust-blue" /> {s.label}
            </a>
          ))}
        </nav>
        {isDemo && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f3d98a] bg-gold-soft/70 px-4 py-3 text-sm text-[#5a4200]">
            <span><b className="text-navy">No assessment yet.</b> Showing a sample profile below — run your own to see your real numbers.</span>
            <div className="flex gap-2">
              <Button asChild size="sm"><Link href="/apply">Check My Score</Link></Button>
            </div>
          </div>
        )}

        <section id="overview" className="ff-navy-grad relative scroll-mt-24 overflow-hidden rounded-2xl p-5 text-white sm:p-7">
          <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full border border-white/10" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="text-sm text-[#b8c6e3]">Welcome back,</div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{name} 👋</h1>
              <p className="mt-1 max-w-lg text-sm text-[#c9d4e3] sm:text-base">
                {offer ? <>Your application with <b className="text-white">{offer.name}</b> is moving. Complete your documents to speed up sanction.</> : <>You&apos;re eligible for up to <b className="text-gold">{inr(r.eligible, { short: true })}</b>. Pick an offer to start your application.</>}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild className="h-10 rounded-xl bg-gold px-4 font-bold text-navy hover:bg-[#ffc727]"><Link href="/result"><Gauge /> Full Score Report</Link></Button>
                <Button className="h-10 rounded-xl border border-white/25 bg-white/10 px-4 text-white hover:bg-white/20" onClick={() => openChat("Why is my score low?")}><Bot /> Ask Flo</Button>
              </div>
            </div>
            <div className="w-full rounded-2xl bg-white/10 px-6 py-4 text-center backdrop-blur sm:w-auto sm:px-7 sm:py-5">
              <div className="text-xs font-semibold tracking-wider text-[#b8c6e3] uppercase">FundenFlo Score</div>
              <div className="ff-num font-heading text-4xl font-bold sm:text-5xl">{r.score}</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold"><TrendingUp className="size-3.5 text-gold" /> +14 This Month · {r.grade.label}</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <Stat icon={IndianRupee} label="Eligible Amount" value={inr(r.eligible, { short: true })} sub={productById(p.product).name} />
          <Stat icon={Percent} label="Best Rate" value={`${r.offers[0]?.rate ?? r.rate}%`} sub={r.offers[0]?.name} />
          <Stat icon={Sparkles} label="Approval Chance" value={`${Math.round(r.approval * 100)}%`} sub="With Best-Match Lender" />
          <Stat icon={FileCheck} label="Documents Ready" value={`${docsReady}/${reqDocs.length}`} sub={docsReady === reqDocs.length ? "All Key Docs In" : "Upload The Rest"} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <Card id="application" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-semibold text-navy">Application Tracker</CardTitle>
              <CardDescription>{productById(p.product).name} · {inr(p.loanAmount, { short: true })} · {p.tenureMonths} months</CardDescription>
            </CardHeader>
            <CardContent>
              <ol>
                {timeline.map((s, i) => (
                  <li key={s.t} className="relative flex gap-3.5 pb-5 last:pb-0">
                    {i < timeline.length - 1 && <span className={cn("absolute top-7 bottom-0 left-[11px] w-0.5", s.done ? "bg-success" : "bg-border")} />}
                    <span className={cn("z-10 grid size-6 shrink-0 place-items-center rounded-full border-2 bg-white",
                      s.done && "border-success bg-success text-white", s.current && "border-gold-deep ring-4 ring-gold-soft")}>
                      {s.done ? <Check className="size-3.5" /> : s.current ? <span className="size-2 rounded-full bg-gold-deep" /> : null}
                    </span>
                    <div>
                      <div className={cn("text-sm font-semibold", s.done || s.current ? "text-navy" : "text-muted-foreground")}>{s.t}</div>
                      <div className="text-xs text-muted-foreground">{s.s}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg font-semibold text-navy">Score Trend</CardTitle>
              <CardDescription>Last 6 months{projected ? ` · projected ${projected} after your completed tasks` : " · tick tasks in your plan to see the projection"}</CardDescription>
            </CardHeader>
            <CardContent><ScoreTrend points={history} projected={projected} /></CardContent>
          </Card>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-2">
          <Card id="plan" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold text-navy"><ListChecks className="size-5 text-gold-deep" /> Your Improvement Plan</CardTitle>
              <CardDescription>AI-picked actions, biggest gain first. Mark them done as you go.</CardDescription>
            </CardHeader>
            <CardContent>
              {r.improvements.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-success"><CircleCheck className="size-4" /> Your profile is already in great shape.</p>
              ) : (
                <div className="divide-y">
                  {r.improvements.map((imp) => (
                    <label key={imp.id} className="flex cursor-pointer items-start gap-3 py-3">
                      <Checkbox checked={done.includes(imp.id)} onCheckedChange={() => toggleTask(imp.id)} className="mt-0.5" aria-label={imp.t} />
                      <div className="flex-1">
                        <div className={cn("text-sm font-semibold text-navy", done.includes(imp.id) && "text-muted-foreground line-through")}>{imp.t}</div>
                        <div className="text-xs text-muted-foreground">{imp.d}</div>
                      </div>
                      <span className="ff-num text-xs font-bold text-success">+{imp.gain}</span>
                    </label>
                  ))}
                </div>
              )}
              {projected && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-success-soft px-4 py-3 text-sm">
                  <span className="text-success">Projected score with completed tasks</span>
                  <b className="ff-num text-lg text-navy">{r.score} → {projected}</b>
                </div>
              )}
            </CardContent>
          </Card>

          <Card id="documents" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold text-navy"><FileCheck className="size-5 text-trust-blue" /> Documents</CardTitle>
              <CardDescription>{docsReady} of {reqDocs.length} key documents verified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-track"><div className="h-full rounded-full bg-success" style={{ width: `${(docsReady / reqDocs.length) * 100}%` }} /></div>
              <ul className="grid gap-2">
                {DOCS[p.type].map((d) => {
                  const ok = p.docs.includes(d.id)
                  return (
                    <li key={d.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm">
                      <span className={cn("grid size-7 place-items-center rounded-md", ok ? "bg-success-soft text-success" : "bg-subtle text-muted-foreground")}>{ok ? <Check className="size-4" /> : <FileText className="size-4" />}</span>
                      <span className="flex-1 font-medium text-navy">{d.name}{!d.req && <span className="ml-1 text-xs font-normal text-muted-foreground">(Optional)</span>}</span>
                      {ok ? <span className="text-xs font-semibold text-success">Verified</span> : (
                        <Button asChild size="xs" variant="outline"><Link href={`/apply?type=${p.type}`}><Upload /> Upload</Link></Button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card id="offers" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="font-heading text-lg font-semibold text-navy">Top Offers For You</CardTitle>
            <CardDescription>Demo lenders · terms based on your FundenFlo Score</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {r.offers.slice(0, 3).map((o, i) => {
              const sel = offer?.code === o.code
              return (
                <div key={o.code} className={cn("flex flex-col rounded-2xl border p-5", sel ? "border-success ring-4 ring-success-soft" : i === 0 && "border-gold ring-4 ring-gold-soft")}>
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg text-xs font-extrabold text-white" style={{ background: o.color }}>{o.code}</span>
                    <div>
                      <div className="font-semibold text-navy">{o.name}</div>
                      <div className="text-xs text-muted-foreground">{o.type}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><div className="text-xs text-muted-foreground">Rate</div><b className="ff-num text-lg text-navy">{o.rate}%</b></div>
                    <div><div className="text-xs text-muted-foreground">Amount</div><b className="ff-num text-lg text-navy">{inr(o.amount, { short: true })}</b></div>
                    <div><div className="text-xs text-muted-foreground">EMI</div><b className="ff-num text-navy">{inr(o.emi)}</b></div>
                    <div><div className="text-xs text-muted-foreground">Approval</div><b className="ff-num text-navy">{o.chance}%</b></div>
                  </div>
                  <Button
                    className="mt-5 rounded-xl"
                    variant={sel ? "outline" : "default"}
                    disabled={o.chance < 10}
                    onClick={() => { setOffer({ code: o.code, name: o.name, rate: o.rate, amount: o.amount, speed: o.speed, at: new Date().toISOString() }); toast(`Offer from ${o.name} selected`) }}
                  >
                    {sel ? <><CircleCheck className="text-success" /> Selected</> : <>Select Offer <ArrowRight /></>}
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold text-navy"><Bell className="size-5 text-trust-blue" /> Recent Activity</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {[
              [ScanText, `AI assessment completed — score ${r.score} (${r.grade.label})`, "Just now"],
              [Sparkles, r.improvements.length ? `${r.improvements.length} improvement actions found — the top one adds +${r.improvements[0].gain} points` : "No improvement actions needed — profile is in great shape", "Just now"],
              [IndianRupee, `${r.offers.length} lenders matched for ${productById(p.product).name}`, "Just now"],
              ...(offer ? [[CircleCheck, `You selected ${offer.name} at ${offer.rate}%`, new Date(offer.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })]] : []),
            ].map(([Icon, t, time], i) => {
              const I = Icon as React.ElementType
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-subtle text-trust-blue"><I className="size-4" /></span>
                  <span className="flex-1 text-navy">{t as string}</span>
                  <span className="text-xs text-muted-foreground">{time as string}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <Card className="py-4">
      <CardContent>
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase"><Icon className="size-3.5 text-trust-blue" /> {label}</div>
        <div className="ff-num mt-1 font-heading text-xl font-bold text-navy sm:text-2xl">{value}</div>
        {sub && <div className="truncate text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  )
}
