"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, ArrowRight, Briefcase, Check, CircleCheck, FileCheck, FileText, LoaderCircle, Lock, RefreshCw, ScanText,
  ShieldCheck, Sparkles, Upload, User, WandSparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/toaster"
import { DOCS, PRODUCTS, inr, productById, type ApplicantType } from "@/lib/data"
import { computeScore, gradeFor, type Profile } from "@/lib/scoring"
import { KEYS, save, type SavedResult } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useAuth, withLogin } from "@/lib/auth"

type Form = Record<string, string>
interface DocState { name: string; status: "verifying" | "done" }
interface W {
  step: number
  type: ApplicantType | null
  product: string | null
  loanAmount: number
  tenureMonths: number
  purpose: string
  f: Form
  docs: Record<string, DocState>
  consent: boolean
}

interface FieldDef { k: string; l: string; kind?: "text" | "number" | "money" | "select" | "tel" | "email"; opts?: [string, string][]; hint?: string; ph?: string; optional?: boolean; action?: "gstin" | "pan" }
const range = (n: number, label = "") => Array.from({ length: n + 1 }, (_, i) => [String(i), `${i}${label}`] as [string, string])

const GROUPS: Record<ApplicantType, { title: string; fields: FieldDef[] }[]> = {
  individual: [
    { title: "Personal Details", fields: [
      { k: "name", l: "Full Name (As Per PAN)", ph: "E.g. Priya Nair" },
      { k: "mobile", l: "Mobile Number", kind: "tel", ph: "10-digit mobile" },
      { k: "email", l: "Email", kind: "email", ph: "you@example.com", optional: true },
      { k: "city", l: "City", ph: "E.g. Bengaluru" },
      { k: "age", l: "Age", kind: "number", ph: "E.g. 31" },
      { k: "pan", l: "PAN", ph: "ABCDE1234F", action: "pan", optional: true },
    ] },
    { title: "Work & Income", fields: [
      { k: "employment", l: "Employment Type", kind: "select", opts: [["salaried", "Salaried"], ["self-employed", "Self-Employed"], ["professional", "Professional (Doctor / CA / Architect)"]] },
      { k: "employer", l: "Employer / Practice Name", ph: "Company Name", optional: true },
      { k: "monthlyIncome", l: "Net Monthly Income (In-Hand)", kind: "money", ph: "E.g. 95000" },
      { k: "experienceYears", l: "Total Work Experience (Years)", kind: "number", ph: "E.g. 5" },
    ] },
    { title: "Credit Profile", fields: [
      { k: "creditScore", l: "CIBIL / Credit Score", kind: "number", ph: "300–900", hint: "Don't know? Leave blank — we'll estimate it.", optional: true },
      { k: "existingEmi", l: "Existing EMIs Per Month", kind: "money", ph: "0 If None" },
      { k: "latePayments", l: "Late / Missed EMIs (Last 12 Months)", kind: "select", opts: range(5) },
      { k: "enquiries", l: "Loan Applications (Last 6 Months)", kind: "select", opts: range(10) },
    ] },
  ],
  business: [
    { title: "Promoter & Contact", fields: [
      { k: "name", l: "Promoter / Director Name", ph: "E.g. Rajesh Sharma" },
      { k: "mobile", l: "Mobile Number", kind: "tel", ph: "10-digit mobile" },
      { k: "email", l: "Business Email", kind: "email", ph: "you@company.com", optional: true },
      { k: "city", l: "City", ph: "E.g. Pune" },
    ] },
    { title: "Business Details", fields: [
      { k: "gstin", l: "GSTIN", ph: "15-Character GSTIN", action: "gstin", optional: true, hint: "Fetch auto-fills business details (demo)" },
      { k: "businessName", l: "Business Name", ph: "Registered Name" },
      { k: "constitution", l: "Constitution", kind: "select", opts: [["Proprietorship", "Proprietorship"], ["Partnership", "Partnership"], ["LLP", "LLP"], ["Private Limited", "Private Limited"], ["Public Limited", "Public Limited"]] },
      { k: "industry", l: "Industry", kind: "select", opts: [["Manufacturing", "Manufacturing"], ["Trading / Distribution", "Trading / Distribution"], ["Retail & D2C", "Retail & D2C"], ["Services", "Services"], ["Healthcare", "Healthcare"], ["Construction", "Construction"], ["Startup / Tech", "Startup / Tech"]] },
      { k: "vintageYears", l: "Years In Business", kind: "number", ph: "E.g. 5" },
    ] },
    { title: "Financials", fields: [
      { k: "annualTurnover", l: "Annual Turnover (Last FY)", kind: "money", ph: "E.g. 42000000" },
      { k: "netProfit", l: "Net Profit (Last FY)", kind: "money", ph: "E.g. 3800000" },
      { k: "itrYears", l: "Years Of ITR Filed", kind: "select", opts: range(5, " Yrs") },
      { k: "existingEmi", l: "Existing EMIs Per Month", kind: "money", ph: "0 If None" },
      { k: "collateral", l: "Property / Collateral Value", kind: "money", ph: "Optional", optional: true },
    ] },
    { title: "Credit Profile", fields: [
      { k: "creditScore", l: "Promoter CIBIL Score", kind: "number", ph: "300–900", hint: "Don't know? Leave blank — we'll estimate it.", optional: true },
      { k: "chequeBounces", l: "Cheque / EMI Bounces (12 Months)", kind: "select", opts: range(5) },
      { k: "latePayments", l: "Late / Missed EMIs (12 Months)", kind: "select", opts: range(5) },
      { k: "enquiries", l: "Loan Applications (Last 6 Months)", kind: "select", opts: range(10) },
    ] },
  ],
}

const DEMO: Record<ApplicantType, Form> = {
  individual: { name: "Priya Nair", mobile: "9876543210", email: "priya.nair@example.com", city: "Bengaluru", age: "31", pan: "ABCPN1234K", employment: "salaried", employer: "Tech services company", monthlyIncome: "95000", experienceYears: "7", creditScore: "748", existingEmi: "12000", latePayments: "0", enquiries: "2" },
  business: { name: "Rajesh Sharma", mobile: "9822012345", email: "rajesh@sharmaprecision.example", city: "Pune", gstin: "27AABCS1234F1Z5", businessName: "Sharma Precision Components Pvt Ltd", constitution: "Private Limited", industry: "Manufacturing", vintageYears: "9", annualTurnover: "42000000", netProfit: "3800000", itrYears: "3", existingEmi: "60000", collateral: "", creditScore: "781", chequeBounces: "0", latePayments: "0", enquiries: "1" },
}
const DEFAULTS: Form = { latePayments: "0", enquiries: "0", chequeBounces: "0", itrYears: "2", employment: "salaried", constitution: "Proprietorship", industry: "Manufacturing" }
const REQUIRED: Record<ApplicantType, string[]> = { individual: ["name", "mobile", "monthlyIncome"], business: ["name", "mobile", "businessName", "annualTurnover"] }

const STEP_LABELS = [
  { t: "Applicant Type", s: "Business Or Individual" },
  { t: "Loan Need", s: "Product & Amount" },
  { t: "Your Details", s: "Income & Credit" },
  { t: "Documents", s: "AI Auto-Check" },
  { t: "Review & Submit", s: "Get Your Score" },
]
const maxTenure = (id: string) => ({ home: 360, lap: 180, commercial: 120, education: 180, od: 12, bill: 6, lc: 12, security: 36, auto: 84, machinery: 84, professional: 72, personal: 72 } as Record<string, number>)[id] ?? 60

const num = (v?: string) => (v == null || v.trim() === "" ? null : Number(v.replace(/[,\s₹]/g, "")))

function buildProfile(w: W): Profile {
  const f = w.f
  return {
    type: w.type ?? "individual",
    product: w.product,
    loanAmount: w.loanAmount,
    tenureMonths: w.tenureMonths,
    name: f.name || null,
    businessName: f.businessName || null,
    city: f.city || null,
    industry: f.industry || null,
    constitution: f.constitution || null,
    employer: f.employer || null,
    age: num(f.age),
    employment: w.type === "business" ? "business" : f.employment || "salaried",
    monthlyIncome: num(f.monthlyIncome),
    experienceYears: num(f.experienceYears),
    existingEmi: num(f.existingEmi),
    creditScore: num(f.creditScore),
    vintageYears: num(f.vintageYears),
    annualTurnover: num(f.annualTurnover),
    netProfit: num(f.netProfit),
    itrYears: num(f.itrYears),
    gst: w.type === "business" ? !!f.gstin?.trim() : null,
    collateral: num(f.collateral),
    latePayments: num(f.latePayments) ?? 0,
    enquiries: num(f.enquiries) ?? 0,
    chequeBounces: num(f.chequeBounces) ?? 0,
    docs: Object.entries(w.docs).filter(([, d]) => d.status === "done").map(([k]) => k),
  }
}

export function ApplyWizard({ initialType, initialProduct }: { initialType?: ApplicantType; initialProduct?: string }) {
  const router = useRouter()
  const prodInit = initialProduct && PRODUCTS.some((p) => p.id === initialProduct) ? initialProduct : null
  const [w, setW] = useState<W>(() => ({
    step: initialType ? 1 : 0,
    type: initialType ?? (prodInit ? productById(prodInit).seg : null),
    product: prodInit,
    loanAmount: initialType === "business" ? 2500000 : 1000000,
    tenureMonths: 60,
    purpose: "",
    f: { ...DEFAULTS },
    docs: {},
    consent: true,
  }))
  const [errors, setErrors] = useState<string[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(-1)
  const topRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const set = (patch: Partial<W>) => setW((s) => ({ ...s, ...patch }))
  const setF = (k: string, v: string) => setW((s) => ({ ...s, f: { ...s.f, [k]: v } }))
  const go = (step: number) => { set({ step }); setErrors([]); topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }) }

  const preview = useMemo(() => (w.type && w.step >= 2 ? computeScore(buildProfile(w), { noSim: true }) : null), [w])
  const product = w.product ? productById(w.product) : null

  const next = () => {
    if (w.step === 0 && !w.type) return setErrors(["Choose business or individual to continue."])
    if (w.step === 1 && !w.product) return setErrors(["Pick a loan product."])
    if (w.step === 2 && w.type) {
      const miss = REQUIRED[w.type].filter((k) => !w.f[k]?.trim())
      if (miss.length) {
        const labels = GROUPS[w.type].flatMap((g) => g.fields).filter((f) => miss.includes(f.k)).map((f) => f.l)
        return setErrors([`Please fill: ${labels.join(", ")}`])
      }
    }
    // logged-in users: prefill contact details from their account
    if (w.step === 1 && user) setW((s) => ({ ...s, f: { ...s.f, mobile: s.f.mobile || user.phone, name: s.f.name || user.name, email: s.f.email || user.email || "" } }))
    go(w.step + 1)
  }

  const fillDemo = () => {
    if (!w.type) return
    set({ f: { ...DEFAULTS, ...DEMO[w.type] } })
    setErrors([])
    toast("Demo data filled — check the live score on the left")
  }

  const fetchGstin = () => {
    setBusy("gstin")
    setTimeout(() => {
      setW((s) => ({ ...s, f: { ...s.f, gstin: s.f.gstin || "27AABCS1234F1Z5", businessName: s.f.businessName || "Sharma Precision Components Pvt Ltd", constitution: "Private Limited", vintageYears: s.f.vintageYears || "9", city: s.f.city || "Pune" } }))
      setBusy(null)
      toast("Business details fetched from GSTIN (demo)")
    }, 1100)
  }
  const verifyPan = () => {
    setBusy("pan")
    setTimeout(() => {
      setW((s) => ({ ...s, f: { ...s.f, pan: s.f.pan || "ABCPN1234K", name: s.f.name || "Priya Nair" } }))
      setBusy(null)
      toast("PAN verified · name matched (demo)")
    }, 900)
  }

  const uploadDoc = (id: string, name: string) => {
    setW((s) => ({ ...s, docs: { ...s.docs, [id]: { name, status: "verifying" } } }))
    setTimeout(() => setW((s) => ({ ...s, docs: { ...s.docs, [id]: { name, status: "done" } } })), 1200 + Math.random() * 600)
  }
  const uploadAllDemo = () => {
    if (!w.type) return
    DOCS[w.type].forEach((d, i) => setTimeout(() => uploadDoc(d.id, `${d.id}_${(w.f.name || "demo").split(" ")[0].toLowerCase()}.pdf`), i * 280))
  }

  const submit = () => {
    if (!w.consent) return setErrors(["Please accept the consent to continue."])
    setAnalyzing(0)
  }
  useEffect(() => {
    if (analyzing < 0) return
    if (analyzing < ANALYSIS_STEPS.length) {
      const t = setTimeout(() => setAnalyzing((a) => a + 1), 650)
      return () => clearTimeout(t)
    }
    const raw = buildProfile(w)
    const r = computeScore(raw)
    const saved: SavedResult = {
      source: "wizard",
      raw,
      at: new Date().toISOString(),
      summary: { score: r.score, grade: r.grade.label, topIssues: r.issues.filter((i) => i.sev !== "good").slice(0, 3).map((i) => i.title), name: raw.name },
    }
    save(KEYS.result, saved)
    router.push("/result")
  }, [analyzing, w, router])

  return (
    <div ref={topRef} className="grid min-w-0 scroll-mt-24 items-start gap-6 lg:grid-cols-[280px_1fr] [&>*]:min-w-0">
      {/* ---------- side ---------- */}
      <aside className="hidden gap-4 lg:sticky lg:top-24 lg:grid">
        <Card className="py-5">
          <CardContent>
            <ol className="relative grid gap-1">
              {STEP_LABELS.map((s, i) => {
                const done = i < w.step, active = i === w.step
                return (
                  <li key={s.t} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < STEP_LABELS.length - 1 && <span className={cn("absolute top-9 bottom-0 left-[15px] w-0.5", done ? "bg-success" : "bg-border")} />}
                    <button
                      disabled={i > w.step}
                      onClick={() => go(i)}
                      className={cn("z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 bg-white text-xs font-bold text-muted-foreground",
                        done && "border-success bg-success text-white", active && "border-navy-pressed text-navy-pressed ring-4 ring-info-soft")}
                      aria-label={`Step ${i + 1}: ${s.t}`}
                    >
                      {done ? <Check className="size-4" /> : i + 1}
                    </button>
                    <div className={cn("pt-0.5 text-sm font-semibold", active ? "text-navy" : "text-muted-foreground")}>
                      {s.t}
                      <div className="text-xs font-normal text-muted-foreground">{s.s}</div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>

        {preview ? (
          <Card className="py-5">
            <CardContent>
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase"><Sparkles className="size-3.5 text-gold-deep" /> Live AI Score Preview</div>
              <div className="mt-2 flex items-end gap-2">
                <span className="ff-num font-heading text-4xl font-bold text-navy">{preview.score}</span>
                <span className="mb-1.5 text-sm font-semibold" style={{ color: { good: "#1f7a43", warn: "#9a5b00", bad: "#ba1a1a" }[gradeFor(preview.score).cls] }}>{preview.grade.label}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-track"><div className="h-full rounded-full bg-chart-1 transition-all" style={{ width: `${((preview.score - 300) / 600) * 100}%` }} /></div>
              <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Eligible Up To</span><b className="ff-num text-navy">{inr(preview.eligible, { short: true })}</b></div>
                <div className="flex justify-between"><span>Est. Rate</span><b className="ff-num text-navy">{preview.rate}%</b></div>
              </div>
              {preview.issues[0] && preview.issues[0].sev !== "good" && (
                <p className="mt-3 rounded-lg bg-gold-soft/70 p-2.5 text-xs text-[#5a4200]"><b>Tip:</b> {preview.issues[0].title}</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="py-5">
            <CardContent className="grid gap-2.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-success" /> Soft check — no CIBIL impact</div>
              <div className="flex items-center gap-2"><Lock className="size-4 text-success" /> Data stays in your browser (demo)</div>
              <div className="flex items-center gap-2"><Sparkles className="size-4 text-gold-deep" /> Live AI score from step 3</div>
            </CardContent>
          </Card>
        )}
      </aside>

      {/* ---------- main ---------- */}
      <Card className="relative py-0">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 lg:hidden">
            <div className="mb-2 flex justify-between text-xs font-semibold text-muted-foreground"><span>Step {w.step + 1} of 5 · {STEP_LABELS[w.step].t}</span><span>{Math.round(((w.step + 1) / 5) * 100)}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-track"><div className="h-full rounded-full bg-navy-pressed transition-all" style={{ width: `${((w.step + 1) / 5) * 100}%` }} /></div>
          </div>

          {/* STEP 0 */}
          {w.step === 0 && (
            <div className="animate-in fade-in">
              <h2 className="text-2xl font-bold">Who Is This Loan For?</h2>
              <p className="mt-1 text-muted-foreground">We&apos;ll tailor the questions, documents and lenders.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {([
                  ["business", Briefcase, "Business / MSME", "Proprietorship, partnership, LLP, company or startup", ["Business Loan", "OD / CC", "LAP", "Machinery"]],
                  ["individual", User, "Individual", "Salaried, self-employed or professional", ["Home", "Personal", "Auto", "Education"]],
                ] as const).map(([id, Icon, t, s, tags]) => (
                  <button
                    key={id}
                    onClick={() => set({ type: id, product: w.product && productById(w.product).seg === id ? w.product : null, loanAmount: id === "business" ? 2500000 : 1000000 })}
                    className={cn("flex gap-4 rounded-2xl border-2 bg-white p-5 text-left transition-all hover:border-trust-blue/60",
                      w.type === id ? "border-trust-blue bg-info-soft/25 ring-4 ring-info-soft/60" : "border-border")}
                  >
                    <span className={cn("grid size-12 shrink-0 place-items-center rounded-xl", w.type === id ? "bg-navy text-gold" : "bg-subtle text-navy")}><Icon className="size-6" /></span>
                    <div>
                      <div className="flex items-center gap-2 font-heading text-lg font-semibold text-navy">{t} {w.type === id && <CircleCheck className="size-5 text-trust-blue" />}</div>
                      <div className="text-sm text-muted-foreground">{s}</div>
                      <div className="mt-3 flex flex-wrap gap-1.5">{tags.map((x) => <span key={x} className="rounded-full bg-subtle px-2 py-0.5 text-xs font-medium text-navy">{x}</span>)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 */}
          {w.step === 1 && w.type && (
            <div className="animate-in fade-in">
              <h2 className="text-2xl font-bold">What Do You Need?</h2>
              <p className="mt-1 text-muted-foreground">Choose a product, then set the loan amount.</p>
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {PRODUCTS.filter((p) => p.seg === w.type).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => set({ product: p.id, tenureMonths: Math.min(w.tenureMonths, maxTenure(p.id)) === w.tenureMonths ? w.tenureMonths : maxTenure(p.id) })}
                    className={cn("flex flex-col gap-1.5 rounded-xl border-2 bg-white p-3.5 text-left transition-all hover:border-trust-blue/60",
                      w.product === p.id ? "border-trust-blue bg-info-soft/25" : "border-border")}
                  >
                    <p.icon className="size-5 text-trust-blue" />
                    <span className="text-sm font-semibold text-navy">{p.name}</span>
                    <span className="text-xs text-muted-foreground">From {p.rate}</span>
                  </button>
                ))}
              </div>

              {product && (
                <div className="mt-8 grid gap-6 rounded-2xl border bg-background p-5">
                  <div>
                    <div className="mb-2 flex items-baseline justify-between">
                      <Label className="text-sm font-semibold text-navy">Loan Amount</Label>
                      <span className="ff-num font-heading text-2xl font-bold text-navy">{inr(w.loanAmount, { short: true })}</span>
                    </div>
                    <Slider value={[w.loanAmount]} min={50000} max={Math.min(product.maxAmount, w.type === "business" ? 5e7 : 2e7)} step={w.type === "business" ? 100000 : 50000} onValueChange={(v) => set({ loanAmount: v[0] })} aria-label="Loan amount" />
                    <div className="mt-1.5 flex justify-between text-xs text-muted-foreground"><span>₹50K</span><span>Max {product.max}</span></div>
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-navy">Purpose <span className="font-normal text-muted-foreground">(Optional)</span></Label>
                    <Input className="h-11 bg-white" placeholder={w.type === "business" ? "E.g. New CNC machine" : "E.g. Home renovation"} value={w.purpose} onChange={(e) => set({ purpose: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {w.step === 2 && w.type && (
            <div className="animate-in fade-in">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">Tell Us About {w.type === "business" ? "Your Business" : "Yourself"}</h2>
                  <p className="mt-1 text-muted-foreground">Rough numbers are fine — the score updates live as you type.</p>
                </div>
                <Button variant="outline" className="h-10 rounded-xl border-gold bg-gold-soft px-4 font-semibold text-gold-ink hover:bg-gold-soft/70" onClick={fillDemo}>
                  <WandSparkles /> Fill Demo Data
                </Button>
              </div>
              <div className="mt-6 grid gap-7">
                {GROUPS[w.type].map((g) => (
                  <fieldset key={g.title}>
                    <legend className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">{g.title}</legend>
                    <div className="grid gap-4 md:grid-cols-2">
                      {g.fields.map((fd) => (
                        <Field key={fd.k} fd={fd} value={w.f[fd.k] ?? ""} onChange={(v) => setF(fd.k, v)} busy={busy === fd.action} onAction={fd.action === "gstin" ? fetchGstin : fd.action === "pan" ? verifyPan : undefined} />
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {w.step === 3 && w.type && (
            <div className="animate-in fade-in">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">Upload Documents</h2>
                  <p className="mt-1 text-muted-foreground">Our AI checks each file for clarity, name match and validity. Optional for the score.</p>
                </div>
                <Button variant="outline" className="h-10 rounded-xl border-gold bg-gold-soft px-4 font-semibold text-gold-ink hover:bg-gold-soft/70" onClick={uploadAllDemo}>
                  <Upload /> Upload Demo Documents
                </Button>
              </div>
              <DocProgress w={w} />
              <div className="mt-5 grid gap-2.5">
                {DOCS[w.type].map((d) => <DocRow key={d.id} d={d} st={w.docs[d.id]} onFile={(n) => uploadDoc(d.id, n)} />)}
              </div>
              <div className="mt-5 flex gap-3 rounded-xl border border-[#c9dbf7] bg-info-soft/40 p-4 text-sm text-navy">
                <ScanText className="mt-0.5 size-5 shrink-0 text-trust-blue" />
                <div><b>AI document check:</b> verifies PAN/Aadhaar name match, statement period, GST filing continuity and flags blurry scans — so lenders don&apos;t send your file back.</div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {w.step === 4 && w.type && (
            <div className="animate-in fade-in">
              <h2 className="text-2xl font-bold">Review & Get Your Score</h2>
              <p className="mt-1 text-muted-foreground">Check your details. You can edit any section.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ReviewBlock title="Loan" onEdit={() => go(1)} rows={[["Product", product?.name ?? "—"], ["Amount", inr(w.loanAmount)], ["Purpose", w.purpose || "—"]]} />
                {GROUPS[w.type].map((g) => (
                  <ReviewBlock key={g.title} title={g.title} onEdit={() => go(2)} rows={g.fields.map((fd) => [fd.l, display(fd, w.f[fd.k])])} />
                ))}
                <ReviewBlock title="Documents" onEdit={() => go(3)} rows={DOCS[w.type].map((d) => [d.name, w.docs[d.id]?.status === "done" ? "✓ Verified" : "Not Uploaded"])} />
              </div>
              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-4 text-sm">
                <Checkbox checked={w.consent} onCheckedChange={(v) => set({ consent: v === true })} className="mt-0.5" />
                <span className="text-muted-foreground">I agree to a <b className="text-navy">soft assessment</b> of my profile and to be contacted by FundenFlo about matched offers. This does not affect my credit score.</span>
              </label>
            </div>
          )}

          {errors.length > 0 && <p role="alert" className="mt-5 rounded-lg bg-error-soft px-3.5 py-2.5 text-sm font-medium text-destructive">{errors[0]}</p>}

          <div className="mt-8 flex flex-wrap justify-between gap-3 border-t pt-5">
            <Button variant="outline" className="h-11 rounded-xl px-5" disabled={w.step === 0} onClick={() => go(w.step - 1)}><ArrowLeft /> Back</Button>
            {w.step < 4 ? (
              <Button className="h-11 rounded-xl px-6" onClick={next}>Continue <ArrowRight /></Button>
            ) : (
              <Button className="h-11 rounded-xl bg-gold px-6 font-bold text-navy hover:bg-[#ffc727]" onClick={() => withLogin(user, submit, "Verify your mobile number to see your FundenFlo Score and matched offers.")}>{user ? <Sparkles /> : <Lock />} Run AI Assessment</Button>
            )}
          </div>
        </CardContent>

        {analyzing >= 0 && <AnalyzingOverlay step={analyzing} />}
      </Card>
    </div>
  )
}

const ANALYSIS_STEPS = ["Reading Your Profile", "Checking Credit Signals", "Calculating Repayment Capacity (FOIR)", "Matching 50+ Lenders", "Preparing Your Report"]

export function AnalyzingOverlay({ step, steps = ANALYSIS_STEPS, title = "AI Is Assessing Your Profile" }: { step: number; steps?: string[]; title?: string }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center rounded-xl bg-white/95 p-6 backdrop-blur-sm">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 size-24 animate-spin rounded-full border-[6px] border-track border-t-gold border-r-trust-blue" />
        <h3 className="text-xl font-semibold">{title}</h3>
        <ul className="mt-5 grid gap-2.5 text-left">
          {steps.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-2.5 text-sm font-medium transition-colors", i < step ? "text-success" : i === step ? "text-navy" : "text-slate-400")}>
              {i < step ? <CircleCheck className="size-4" /> : i === step ? <LoaderCircle className="size-4 animate-spin" /> : <span className="size-4 rounded-full border-2 border-slate-300" />}
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function display(fd: FieldDef, v?: string) {
  if (!v) return "—"
  if (fd.kind === "money") return inr(Number(v))
  if (fd.kind === "select") return fd.opts?.find((o) => o[0] === v)?.[1] ?? v
  return v
}

function Field({ fd, value, onChange, busy, onAction }: { fd: FieldDef; value: string; onChange: (v: string) => void; busy?: boolean; onAction?: () => void }) {
  const id = `f-${fd.k}`
  const money = fd.kind === "money" && value ? inr(Number(value.replace(/[,\s]/g, "")), { short: true }) : null
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">
        {fd.l} {fd.optional && <span className="font-normal text-muted-foreground">(Optional)</span>}
      </Label>
      {fd.kind === "select" ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus:border-trust-blue focus:ring-3 focus:ring-trust-blue/15">
          {fd.opts?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : (
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            {fd.kind === "money" && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted-foreground">₹</span>}
            <Input
              id={id}
              value={value}
              onChange={(e) => onChange(fd.kind === "money" || fd.kind === "number" || fd.kind === "tel" ? e.target.value.replace(/[^\d.]/g, "") : e.target.value)}
              inputMode={fd.kind === "money" || fd.kind === "number" || fd.kind === "tel" ? "numeric" : undefined}
              type={fd.kind === "email" ? "email" : "text"}
              placeholder={fd.ph}
              className={cn("h-11 bg-white", fd.kind === "money" && "pl-7")}
            />
          </div>
          {onAction && (
            <Button type="button" variant="outline" className="h-11 rounded-lg px-3" onClick={onAction} disabled={busy}>
              {busy ? <LoaderCircle className="animate-spin" /> : <RefreshCw />} {fd.action === "gstin" ? "Fetch" : "Verify"}
            </Button>
          )}
        </div>
      )}
      {(money || fd.hint) && <p className="mt-1 text-xs text-muted-foreground">{money ? `= ${money}` : fd.hint}</p>}
    </div>
  )
}

function DocProgress({ w }: { w: W }) {
  if (!w.type) return null
  const req = DOCS[w.type].filter((d) => d.req)
  const done = req.filter((d) => w.docs[d.id]?.status === "done").length
  return (
    <div className="mt-5 rounded-xl border bg-background p-4">
      <div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-navy">Key Documents Verified</span><b className="ff-num text-navy">{done}/{req.length}</b></div>
      <div className="h-2 overflow-hidden rounded-full bg-track"><div className="h-full rounded-full bg-success transition-all" style={{ width: `${(done / req.length) * 100}%` }} /></div>
    </div>
  )
}

function DocRow({ d, st, onFile }: { d: (typeof DOCS)["business"][number]; st?: DocState; onFile: (name: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className={cn("flex items-center gap-3.5 rounded-xl border-[1.5px] border-dashed bg-white p-3.5 transition-colors",
      st?.status === "done" && "border-solid border-[#bfe3cf] bg-[#f6fcf8]", st?.status === "verifying" && "border-solid border-[#f2d58a] bg-gold-soft/40")}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", st?.status === "done" ? "bg-success-soft text-success" : "bg-subtle text-navy")}>
        {st?.status === "done" ? <FileCheck className="size-5" /> : <FileText className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-navy">{d.name} {d.req ? <span className="text-destructive">*</span> : <span className="text-xs font-normal text-muted-foreground">(Optional)</span>}</div>
        <div className="truncate text-xs text-muted-foreground">
          {st?.status === "verifying" ? "AI checking clarity & name match…" : st?.status === "done" ? `${st.name} · AI verified: clear scan, details match` : d.note}
        </div>
      </div>
      <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f.name) }} />
      {st?.status === "verifying" ? (
        <LoaderCircle className="size-5 animate-spin text-gold-deep" />
      ) : st?.status === "done" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success"><CircleCheck className="size-3.5" /> Verified</span>
      ) : (
        <Button size="sm" variant="outline" onClick={() => ref.current?.click()}><Upload /> Upload</Button>
      )}
    </div>
  )
}

function ReviewBlock({ title, rows, onEdit }: { title: string; rows: [string, string][]; onEdit: () => void }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{title}</span>
        <button onClick={onEdit} className="text-xs font-semibold text-trust-blue hover:underline">Edit</button>
      </div>
      <dl className="grid gap-1 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3"><dt className="shrink-0 text-muted-foreground">{k}</dt><dd className="min-w-0 break-words text-right font-medium text-navy">{v}</dd></div>
        ))}
      </dl>
    </div>
  )
}
