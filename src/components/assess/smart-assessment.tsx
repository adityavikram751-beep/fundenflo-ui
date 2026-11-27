"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowRight, Check, CircleCheck, CircleDashed, CirclePlus, CircleX, FileCheck, FileText, FileUp, LoaderCircle, Lock, MessageSquareText,
  PencilLine, RotateCcw, ShieldCheck, Sparkles, TrendingDown, TrendingUp, TriangleExclamationPoint, Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AnalyzingOverlay } from "@/components/apply/apply-wizard"
import { ScoreReport } from "@/components/report/score-report"
import { VoiceComposer } from "@/components/assess/voice-composer"
import { toast } from "@/components/toaster"
import { useAuth, withLogin } from "@/lib/auth"
import { inr } from "@/lib/data"
import { parseNarrative, understoodFacts, type Fact } from "@/lib/intake"
import { computeScore, type Profile, type ScoreResult } from "@/lib/scoring"
import { KEYS, load, save, useStored, type SavedResult } from "@/lib/store"
import { READING_FIELDS, docSlots, readDocuments, verify, type Check as VCheck, type Metric, type Reading, type Scenario } from "@/lib/verification"
import { cn } from "@/lib/utils"

type Stage = "tell" | "assessed" | "verified"
interface SavedAssessment { text: string; stage: Stage; uploaded: Record<string, string>; scenario: Scenario | null; reading: Reading | null; at: string }
const EMPTY: SavedAssessment = { text: "", stage: "tell", uploaded: {}, scenario: null, reading: null, at: "" }

const PRELIM_STEPS = ["Understanding What You Said", "Structuring Your Financial Details", "Checking Lender Eligibility Rules", "Scoring 6 Credit Factors", "Preparing Your Assessment"]
const STARTERS: Record<string, string> = {
  loanAmount: "I need a loan of ", product: "The loan is for ", vintageYears: "My business is  years old. ", annualTurnover: "Our yearly turnover is ",
  netProfit: "Our net profit is about ", gst: "We are GST registered. ", itrYears: "We have filed ITR for  years. ", monthlyIncome: "My monthly in-hand salary is ",
  experienceYears: "I have  years of work experience. ", existingEmi: "I pay EMI of  per month. ", creditScore: "My CIBIL score is ", tenureMonths: "I want to repay in  years. ",
}

export function SmartAssessment() {
  const [, , ready] = useStored<SavedAssessment>(KEYS.assessment)
  // parsing & document dates read the clock / browser storage — render client-side only
  if (!ready) return <Card className="h-[560px] animate-pulse" />
  return <SmartAssessmentBody />
}

function SmartAssessmentBody() {
  const [saved] = useStored<SavedAssessment>(KEYS.assessment)
  const a = saved ?? EMPTY
  const { user } = useAuth()
  const textRef = useRef<HTMLTextAreaElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const [anim, setAnim] = useState<{ steps: string[]; step: number; title: string; done: () => void } | null>(null)
  const [reading, setReading] = useState<Record<string, boolean>>({})

  const update = useCallback((fn: (s: SavedAssessment) => SavedAssessment) => save(KEYS.assessment, fn(load<SavedAssessment>(KEYS.assessment) ?? EMPTY)), [])
  const setText = useCallback((t: string | ((prev: string) => string)) => update((s) => ({ ...s, text: typeof t === "function" ? t(s.text) : t })), [update])

  const parsed = useMemo(() => parseNarrative(a.text), [a.text])
  const declared: Profile = parsed.profile
  const facts = useMemo(() => understoodFacts(parsed, (n) => inr(n, { short: true })), [parsed])
  const prelim = useMemo(() => (a.stage !== "tell" ? computeScore(declared) : null), [declared, a.stage])
  const verification = useMemo(() => (a.stage === "verified" && a.reading ? verify(declared, a.reading) : null), [a.stage, a.reading, declared])
  const verified = useMemo(() => (verification ? computeScore(verification.verifiedProfile) : null), [verification])
  const slots = useMemo(() => docSlots(declared.type ?? "individual"), [declared.type])
  const potential = useMemo(() => {
    if (a.stage !== "assessed") return 0
    const all = Object.fromEntries(slots.map((s) => [s.id, "sample.pdf"]))
    return verify(declared, readDocuments(declared, all, "match")).bonus
  }, [a.stage, declared, slots])

  // keep score report / dashboard / chatbot in sync with the latest assessment
  useEffect(() => {
    const r = verified ?? prelim
    if (!r) return
    const raw = verification?.verifiedProfile ?? declared
    const res: SavedResult = {
      source: "assessment", raw, at: new Date().toISOString(),
      summary: { score: r.score, grade: r.grade.label, topIssues: r.issues.filter((i) => i.sev !== "good").slice(0, 3).map((i) => i.title), name: raw.name },
    }
    save(KEYS.result, res)
  }, [verified, prelim, verification, declared])

  // step-by-step "AI is working" overlay
  useEffect(() => {
    if (!anim) return
    const t = setTimeout(() => {
      if (anim.step + 1 < anim.steps.length) setAnim({ ...anim, step: anim.step + 1 })
      else { anim.done(); setAnim(null); topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }) }
    }, 620)
    return () => clearTimeout(t)
  }, [anim])

  const isBiz = declared.type === "business"
  const important = facts.filter((f) => f.important)
  const haveImportant = important.filter((f) => f.value).length
  const canGenerate = !!declared.loanAmount && !!(declared.annualTurnover || declared.monthlyIncome)

  const generate = () => withLogin(user, () => setAnim({
    steps: PRELIM_STEPS, step: 0, title: "AI Is Building Your Credit Assessment",
    done: () => update((s) => ({ ...s, stage: "assessed", at: new Date().toISOString(), uploaded: {}, reading: null, scenario: null })),
  }), "Verify your mobile number to get your free credit assessment.")

  const addFact = (f: Fact) => {
    const starter = STARTERS[f.key] ?? ""
    setText((prev) => `${prev}${prev && !/\s$/.test(prev) ? " " : ""}${starter}`)
    setTimeout(() => { const el = textRef.current; if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length) } }, 30)
  }

  const uploadFile = (slotId: string, name: string, scenario: Scenario = "upload") => {
    update((s) => ({ ...s, uploaded: { ...s.uploaded, [slotId]: name }, scenario }))
    setReading((r) => ({ ...r, [slotId]: true }))
    setTimeout(() => setReading((r) => ({ ...r, [slotId]: false })), 900 + Math.random() * 500)
  }
  const loadSamples = (scenario: Scenario) => {
    update((s) => ({ ...s, uploaded: {}, scenario }))
    slots.forEach((sl, i) => setTimeout(() => uploadFile(sl.id, `${sl.id === "bank" ? "bank_statement_12m" : sl.id}_${scenario === "match" ? "sample" : "sample_b"}.pdf`, scenario), i * 250))
  }
  const requiredUploaded = slots.filter((s) => s.req).every((s) => a.uploaded[s.id]) && !Object.values(reading).some(Boolean)

  const runVerification = () => setAnim({
    steps: isBiz
      ? ["Reading Balance Sheets", "Extracting P&L Figures For 2 Years", "Scanning 12 Months Of Bank Transactions", "Detecting EMIs, Bounces & Cash Flow", "Cross-Checking With What You Told Us"]
      : ["Reading Salary Slips", "Scanning Bank Transactions", "Detecting EMIs & Bounces", "Cross-Checking With What You Told Us"],
    step: 0, title: "AI Is Verifying Your Documents",
    done: () => update((s) => ({ ...s, stage: "verified", reading: readDocuments(declared, s.uploaded, s.scenario ?? "upload") })),
  })

  const stepIdx = a.stage === "tell" ? 0 : a.stage === "verified" ? 3 : Object.keys(a.uploaded).length ? 2 : 1

  return (
    <div ref={topRef} className="relative grid min-w-0 scroll-mt-24 gap-6 [&>*]:min-w-0">
      <Stepper idx={stepIdx} />

      {/* ================= STAGE 1: TELL ================= */}
      {a.stage === "tell" && (
        <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold text-navy">Tell Us About Your {isBiz ? "Business" : "Loan Need"}</CardTitle>
              <CardDescription>No forms. Just speak or write it the way you&apos;d explain it to your CA.</CardDescription>
            </CardHeader>
            <CardContent><VoiceComposer text={a.text} onText={setText} textRef={textRef} /></CardContent>
          </Card>

          <div className="grid gap-4 lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold text-navy"><Sparkles className="size-4 text-gold-deep" /> What We Understood</CardTitle>
                <CardDescription>Updates live as you speak or type</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs font-semibold"><span className="text-muted-foreground">Assessment Readiness</span><span className="ff-num text-navy">{haveImportant}/{important.length} Key Facts</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-track"><div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${(haveImportant / important.length) * 100}%` }} /></div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-subtle px-2.5 py-1 font-semibold text-navy">{isBiz ? "Business / MSME" : "Individual"}</span>
                  {declared.name && <span className="truncate text-muted-foreground">{declared.name}{declared.city ? ` · ${declared.city}` : ""}</span>}
                </div>
                <ul className="grid gap-1.5">
                  {facts.map((f) => (
                    <li key={f.key} className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors", f.value ? "bg-success-soft/50" : "bg-background")}>
                      {f.value ? <CircleCheck className="size-4 shrink-0 text-success" /> : <CircleDashed className={cn("size-4 shrink-0", f.important ? "text-gold-deep" : "text-slate-400")} />}
                      <span className="text-muted-foreground">{f.label}</span>
                      {f.value ? (
                        <b className="ff-num ml-auto truncate text-right text-navy">{f.value}</b>
                      ) : (
                        <button onClick={() => addFact(f)} className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-trust-blue hover:underline"><CirclePlus className="size-3.5" /> Add</button>
                      )}
                    </li>
                  ))}
                </ul>
                {!canGenerate && a.text.trim().length > 0 && (
                  <p className="rounded-lg bg-gold-soft/70 p-2.5 text-xs text-[#5a4200]">Tell us at least <b>how much loan you need</b> and your <b>{isBiz ? "turnover" : "income"}</b> to generate an assessment.</p>
                )}
                <Button disabled={!canGenerate} onClick={generate} className="h-12 rounded-xl bg-gold text-base font-bold text-navy hover:bg-[#ffc727]">
                  {user ? <Sparkles className="size-5" /> : <Lock className="size-5" />} Generate Credit Assessment
                </Button>
                {!user && <p className="-mt-2 text-center text-xs text-muted-foreground">Free · Quick Mobile OTP Login</p>}
              </CardContent>
            </Card>
            <Card className="bg-navy text-white ring-0">
              <CardContent className="grid gap-2 text-sm text-[#c9d4e3]">
                <div className="flex items-center gap-2 font-semibold text-gold"><ShieldCheck className="size-4" /> How It Works</div>
                <p><b className="text-white">1.</b> We turn your words into a preliminary credit assessment.</p>
                <p><b className="text-white">2.</b> Upload balance sheets & bank statements — we verify what you said.</p>
                <p><b className="text-white">3.</b> Verified details add points and unlock better offers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ================= STAGE 2/3: PRELIMINARY + VERIFY ================= */}
      {a.stage === "assessed" && prelim && (
        <>
          <Card className="py-4">
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-bold text-warning"><MessageSquareText className="size-3.5" /> Self-declared · Confidence: {haveImportant >= important.length - 1 ? "Medium" : "Low"}</span>
                <span className="text-muted-foreground">Based on what you told us — not yet verified</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => update((s) => ({ ...s, stage: "tell" }))}><PencilLine /> Edit What I Said</Button>
            </CardContent>
          </Card>

          <VerifyPanel
            slots={slots} uploaded={a.uploaded} reading={reading} potential={potential} isBiz={isBiz} score={prelim.score}
            onFile={uploadFile} onSamples={loadSamples} canVerify={requiredUploaded} onVerify={runVerification}
          />

          <SectionTitle n={2} title="Your Preliminary Credit Assessment" sub="Built only from what you said — upload documents above to verify it" />
          <ScoreReport result={prelim} />
        </>
      )}

      {/* ================= STAGE 4: VERIFIED ================= */}
      {a.stage === "verified" && prelim && verified && verification && a.reading && (
        <>
          <VerifiedHero prelim={prelim} verified={verified} matched={verification.matched} flagged={verification.flagged} onRestart={() => { save(KEYS.assessment, EMPTY); toast("Started a new assessment") }} onReupload={() => update((s) => ({ ...s, stage: "assessed" }))} />
          <div className="grid min-w-0 gap-6 xl:grid-cols-[1.35fr_0.65fr] [&>*]:min-w-0">
            <ChecksTable checks={verification.checks} />
            <ReadingEditor reading={a.reading} isBiz={isBiz} uploaded={a.uploaded} onChange={(k, val) => update((s) => ({ ...s, reading: { ...(s.reading ?? {}), [k]: val } }))} />
          </div>
          {verification.metrics.length > 0 && <MetricsGrid metrics={verification.metrics} />}
          <SectionTitle n={4} title="Your Verified Credit Assessment" sub="Scores, eligibility and offers now use the figures from your documents" />
          <ScoreReport result={verified} />
        </>
      )}

      {anim && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-navy/40 p-4 backdrop-blur-sm">
          <div className="relative h-[420px] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <AnalyzingOverlay step={anim.step} steps={anim.steps} title={anim.title} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- */

function Stepper({ idx }: { idx: number }) {
  const steps = ["Speak Or Write", "Preliminary Assessment", "Upload Documents", "Verified Assessment"]
  return (
    <Card className="py-3.5 sm:py-4">
      <CardContent>
        <ol className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s} className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold sm:size-8", i < idx ? "border-success bg-success text-white" : i === idx ? "border-navy-pressed text-navy-pressed ring-4 ring-info-soft" : "border-border text-muted-foreground")}>
                {i < idx ? <Check className="size-3.5 sm:size-4" /> : i + 1}
              </span>
              <span className={cn("text-xs leading-tight font-semibold sm:text-sm", i <= idx ? "text-navy" : "text-muted-foreground")}>{s}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

function SectionTitle({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold font-heading text-sm font-bold text-navy">{n}</span>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
}

function VerifyPanel({ slots, uploaded, reading, potential, isBiz, score, onFile, onSamples, canVerify, onVerify }: {
  slots: ReturnType<typeof docSlots>; uploaded: Record<string, string>; reading: Record<string, boolean>; potential: number; isBiz: boolean; score: number
  onFile: (id: string, name: string) => void; onSamples: (s: Scenario) => void; canVerify: boolean; onVerify: () => void
}) {
  return (
    <Card className="overflow-hidden border-[#f3d98a] py-0 ring-1 ring-gold/40">
      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
        <div className="ff-navy-grad relative overflow-hidden p-5 text-white sm:p-7">
          <div className="pointer-events-none absolute -right-16 -bottom-16 size-56 rounded-full border border-white/10" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gold"><ShieldCheck className="size-3.5" /> Step 3 · Verify & Boost</span>
          <h3 className="mt-4 text-xl font-bold text-white sm:text-2xl">Prove It With Documents — Add Up To <span className="text-gold">+{Math.max(potential, 10)} Points</span></h3>
          <p className="mt-2 text-sm text-[#c9d4e3]">
            Upload {isBiz ? "your last 2 years' balance sheets and 12 months of bank statements" : "your salary slips and bank statement"}. We check them against what you told us and add new data points lenders trust{isBiz ? " — growth, DSCR, leverage, banking conduct" : ""}.
          </p>
          <div className="mt-5 flex items-end gap-3">
            <div><div className="text-xs text-[#9fb0d0]">Now</div><div className="ff-num font-heading text-3xl font-bold">{score}</div></div>
            <ArrowRight className="mb-2 size-5 text-gold" />
            <div><div className="text-xs text-[#9fb0d0]">If Documents Match</div><div className="ff-num font-heading text-3xl font-bold text-gold">~{Math.min(900, score + Math.max(potential, 10))}</div></div>
          </div>
          <p className="mt-4 text-[11px] text-[#9fb0d0]">Mismatches can also reduce the score — lenders value honesty and consistency.</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid gap-2.5">
            {slots.map((s) => <SlotRow key={s.id} slot={s} file={uploaded[s.id]} reading={!!reading[s.id]} onFile={(n) => onFile(s.id, n)} />)}
          </div>
          <div className="mt-4 rounded-xl border border-dashed bg-background p-3.5">
            <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">No Documents Handy? Try The Demo</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onSamples("match")}><FileCheck /> Sample Docs — Figures Match</Button>
              <Button variant="outline" size="sm" onClick={() => onSamples("mismatch")}><TriangleExclamationPoint /> Sample Docs — With Gaps</Button>
            </div>
          </div>
          <Button disabled={!canVerify} onClick={onVerify} className="mt-5 h-12 w-full rounded-xl bg-gold text-base font-bold text-navy hover:bg-[#ffc727]">
            <ShieldCheck className="size-5" /> Verify Documents & Update Assessment
          </Button>
          {!canVerify && <p className="mt-2 text-center text-xs text-muted-foreground">Upload the required documents (*) to continue</p>}
        </div>
      </div>
    </Card>
  )
}

function SlotRow({ slot, file, reading, onFile }: { slot: { id: string; name: string; note: string; req: boolean }; file?: string; reading: boolean; onFile: (n: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border-[1.5px] border-dashed bg-white p-3", file && !reading && "border-solid border-[#bfe3cf] bg-[#f6fcf8]", reading && "border-solid border-[#f2d58a] bg-gold-soft/40")}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", file && !reading ? "bg-success-soft text-success" : "bg-subtle text-navy")}>
        {file && !reading ? <FileCheck className="size-5" /> : <FileText className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-navy">{slot.name} {slot.req ? <span className="text-destructive">*</span> : <span className="text-xs font-normal text-muted-foreground">(Optional)</span>}</div>
        <div className="truncate text-xs text-muted-foreground">{reading ? "Reading document…" : file ? `${file} · ready to verify` : slot.note}</div>
      </div>
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f.name); e.target.value = "" }} />
      {reading ? <LoaderCircle className="size-5 animate-spin text-gold-deep" /> : (
        <Button size="sm" variant={file ? "ghost" : "outline"} onClick={() => ref.current?.click()}>{file ? "Replace" : <><Upload /> Upload</>}</Button>
      )}
    </div>
  )
}

function VerifiedHero({ prelim, verified, matched, flagged, onRestart, onReupload }: { prelim: ScoreResult; verified: ScoreResult; matched: number; flagged: number; onRestart: () => void; onReupload: () => void }) {
  const delta = verified.score - prelim.score
  const up = delta >= 0
  return (
    <div className="ff-navy-grad relative overflow-hidden rounded-2xl p-5 text-white sm:p-7">
      <div className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full border border-white/10" />
      <div className="relative flex flex-wrap items-center justify-between gap-8">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-bold text-white"><ShieldCheck className="size-3.5" /> Document-verified · Confidence: High</span>
          <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">{up ? "Your Documents Strengthened Your Assessment" : "Your Documents Changed Your Assessment"}</h2>
          <p className="mt-1 text-[#c9d4e3]"><b className="text-white">{matched}</b> details matched · <b className="text-white">{flagged}</b> flagged for review. Lenders see this as a verified file.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={onReupload}><FileUp /> Change Documents</Button>
            <Button variant="outline" size="sm" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={onRestart}><RotateCcw /> New Assessment</Button>
            <Button asChild size="sm" className="bg-gold font-bold text-navy hover:bg-[#ffc727]"><Link href="/dashboard">Go To Dashboard <ArrowRight /></Link></Button>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-4 backdrop-blur sm:w-auto sm:justify-start sm:gap-5 sm:px-6 sm:py-5">
          <div className="text-center"><div className="text-xs text-[#9fb0d0]">Self-declared</div><div className="ff-num font-heading text-3xl font-bold text-[#c9d4e3] sm:text-4xl">{prelim.score}</div></div>
          <div className="flex flex-col items-center">
            {up ? <TrendingUp className="size-5 text-gold sm:size-6" /> : <TrendingDown className="size-5 text-[#ff9b8f] sm:size-6" />}
            <span className={cn("ff-num mt-1 rounded-full px-2 py-0.5 text-xs font-bold sm:text-sm", up ? "bg-gold text-navy" : "bg-[#ff9b8f] text-navy")}>{up ? "+" : ""}{delta}</span>
          </div>
          <div className="text-center"><div className="text-xs text-[#9fb0d0]">Verified</div><div className="ff-num font-heading text-4xl font-bold text-white sm:text-5xl">{verified.score}</div><div className="text-xs font-semibold text-gold">{verified.grade.label}</div></div>
        </div>
      </div>
    </div>
  )
}

const STATUS: Record<VCheck["status"], { label: string; cls: string; Icon: React.ElementType }> = {
  match: { label: "Match", cls: "bg-success-soft text-success", Icon: CircleCheck },
  variance: { label: "Minor gap", cls: "bg-warning-soft text-warning", Icon: TriangleExclamationPoint },
  mismatch: { label: "Mismatch", cls: "bg-error-soft text-destructive", Icon: CircleX },
  new: { label: "New data", cls: "bg-info-soft/70 text-info", Icon: CirclePlus },
}

function ChecksTable({ checks }: { checks: VCheck[] }) {
  const total = checks.reduce((s, c) => s + c.points, 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-navy">What You Said Vs What Your Documents Show</CardTitle>
        <CardDescription>Every point added or removed, and why</CardDescription>
      </CardHeader>
      <CardContent>
        {/* mobile cards */}
        <div className="grid gap-3 md:hidden">
          {checks.map((c) => {
            const s = STATUS[c.status]
            return (
              <div key={c.key} className="rounded-xl border bg-background p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-navy">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.note}</div>
                  </div>
                  <span className={cn("ff-num shrink-0 text-sm font-bold", c.points > 0 ? "text-success" : c.points < 0 ? "text-destructive" : "text-muted-foreground")}>{c.points > 0 ? "+" : ""}{c.points} Pts</span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-lg bg-white p-2.5 text-xs">
                  <div><div className="text-muted-foreground">You Said</div><div className="ff-num mt-0.5 font-medium text-navy">{c.declared}</div></div>
                  <div><div className="text-muted-foreground">Documents Show</div><div className="ff-num mt-0.5 font-semibold text-navy">{c.found}</div><div className="text-[10px] text-muted-foreground">{c.source}</div></div>
                </div>
                <div className="mt-2.5">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap", s.cls)}><s.Icon className="size-3.5" /> {s.label}</span>
                </div>
              </div>
            )
          })}
          <div className="flex items-center justify-between rounded-xl bg-subtle px-3.5 py-3 text-sm">
            <span className="font-semibold text-navy">Net Verification Impact</span>
            <span className={cn("ff-num text-base font-bold", total >= 0 ? "text-success" : "text-destructive")}>{total > 0 ? "+" : ""}{Math.max(-50, Math.min(60, total))} Pts</span>
          </div>
        </div>

        {/* desktop table */}
        <div className="hidden overflow-x-auto rounded-xl border md:block">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-subtle text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              <tr><th className="px-4 py-3">Check</th><th className="px-4 py-3">You Said</th><th className="px-4 py-3">Documents Show</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Points</th></tr>
            </thead>
            <tbody className="divide-y">
              {checks.map((c) => {
                const s = STATUS[c.status]
                return (
                  <tr key={c.key}>
                    <td className="px-4 py-3"><div className="font-semibold text-navy">{c.label}</div><div className="text-xs text-muted-foreground">{c.note}</div></td>
                    <td className="ff-num px-4 py-3 text-muted-foreground">{c.declared}</td>
                    <td className="px-4 py-3"><div className="ff-num font-semibold text-navy">{c.found}</div><div className="text-[11px] text-muted-foreground">{c.source}</div></td>
                    <td className="px-4 py-3"><span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap", s.cls)}><s.Icon className="size-3.5" /> {s.label}</span></td>
                    <td className={cn("ff-num px-4 py-3 text-right font-bold", c.points > 0 ? "text-success" : c.points < 0 ? "text-destructive" : "text-muted-foreground")}>{c.points > 0 ? "+" : ""}{c.points}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-subtle/70">
                <td className="px-4 py-3 font-semibold text-navy" colSpan={4}>Net verification impact <span className="text-xs font-normal text-muted-foreground">(capped between −50 and +60)</span></td>
                <td className={cn("ff-num px-4 py-3 text-right text-base font-bold", total >= 0 ? "text-success" : "text-destructive")}>{total > 0 ? "+" : ""}{Math.max(-50, Math.min(60, total))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function ReadingEditor({ reading, isBiz, uploaded, onChange }: { reading: Reading; isBiz: boolean; uploaded: Record<string, string>; onChange: (k: keyof Reading, v: number) => void }) {
  const fields = READING_FIELDS.filter((f) => (f.type === "both" || f.type === (isBiz ? "business" : "individual")) && f.needs.every((n) => uploaded[n]) && reading[f.k] != null)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-navy">What The AI Read</CardTitle>
        <CardDescription>Spot something wrong? Correct it — the assessment updates instantly.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {fields.map((f) => (
          <div key={f.k} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-navy">{f.l}</div>
              <div className="text-[11px] text-muted-foreground">{f.src}{f.money && reading[f.k] ? ` · ${inr(reading[f.k], { short: true })}` : ""}</div>
            </div>
            <div className="relative w-28 sm:w-36">
              {f.money && <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">₹</span>}
              <Input inputMode="numeric" value={String(reading[f.k] ?? "")} onChange={(e) => onChange(f.k, Number(e.target.value.replace(/[^\d]/g, "")) || 0)} className={cn("ff-num h-9 bg-white text-right text-sm", f.money && "pl-6")} aria-label={f.l} />
            </div>
          </div>
        ))}
        <p className="mt-1 rounded-lg bg-subtle p-2.5 text-[11px] leading-relaxed text-muted-foreground">Demo: document reading is simulated from sample figures. In the live product these come from OCR/AI extraction and Account Aggregator bank data.</p>
      </CardContent>
    </Card>
  )
}

function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  const col = { good: "#1f7a43", warn: "#9a5b00", bad: "#ba1a1a" }
  const Icon = { good: CircleCheck, warn: TriangleExclamationPoint, bad: CircleX }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-navy">New Data Points From Your Documents</CardTitle>
        <CardDescription>Things lenders check that a conversation alone can&apos;t prove</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((m) => {
          const I = Icon[m.status]
          return (
            <div key={m.key} className="rounded-xl border bg-background p-4">
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                {m.label}
                <span className="inline-flex items-center gap-1 normal-case tracking-normal" style={{ color: col[m.status] }}><I className="size-3.5" />{m.status === "good" ? "Strong" : m.status === "warn" ? "Watch" : "Weak"}</span>
              </div>
              <div className="ff-num mt-1 font-heading text-2xl font-bold text-navy">{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.note} · <span className="text-navy">{m.benchmark}</span></div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
