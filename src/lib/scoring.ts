/* ==========================================================
   FundenFlo demo — "AI" scoring engine
   Runs fully in the browser. Rule-based and explainable.
   FundenFlo Score range: 300–900
   ========================================================== */
import { DOCS, LENDERS, clamp, emi, inr, principalFromEmi, productById, trimNum, type ApplicantType, type Lender } from "./data"

export interface Profile {
  type?: ApplicantType
  name?: string | null
  businessName?: string | null
  city?: string | null
  industry?: string | null
  employer?: string | null
  constitution?: string | null
  age?: number | null
  employment?: string | null
  monthlyIncome?: number | null
  existingEmi?: number | null
  creditScore?: number | null
  newToCredit?: boolean
  experienceYears?: number | null
  vintageYears?: number | null
  annualTurnover?: number | null
  netProfit?: number | null
  gst?: boolean | null
  itrYears?: number | null
  avgBankBalance?: number | null
  collateral?: number | null
  latePayments?: number | null
  chequeBounces?: number | null
  enquiries?: number | null
  loanAmount?: number | null
  tenureMonths?: number | null
  product?: string | null
  docs?: string[]
  assumed?: Record<string, boolean>
  /** set once documents have been checked against the declaration (see verification.ts) */
  verification?: { bonus: number; level: "documents" }
}

/** Profile after defaults are applied — every scored field is present */
export interface FullProfile extends Profile {
  type: ApplicantType
  product: string
  creditScore: number | null
  existingEmi: number
  tenureMonths: number
  latePayments: number
  enquiries: number
  chequeBounces: number
  loanAmount: number
  docs: string[]
  assumed: Record<string, boolean>
}

export type Severity = "good" | "warn" | "bad"
export interface Factor { key: string; name: string; weight: number; value: number; note: string; lost: number; status: Severity }
export interface Issue { sev: Severity; title: string; why: string; fix: string; impact: number | null }
export interface Offer extends Lender { rate: number; chance: number; amount: number; emi: number }
export interface Improvement { id: string; t: string; d: string; gain: number }
export interface ScoreResult {
  profile: FullProfile
  score: number
  grade: { label: string; cls: Severity }
  rate: number
  eligible: number
  emi: number
  newEmi: number
  foir: number
  approval: number
  factors: Factor[]
  issues: Issue[]
  offers: Offer[]
  monthlyIncome: number
  improvements: Improvement[]
  /** points added/removed by document verification (0 if self-declared) */
  verificationBonus: number
}

const DEFAULT_TENURE: Record<string, number> = { home: 240, lap: 120, commercial: 120, education: 84, auto: 60, personal: 48, professional: 60, business: 48, machinery: 60, od: 12, bill: 6, lc: 12, security: 24 }

function interp(x: number, pts: [number, number][]) {
  if (x <= pts[0][0]) return pts[0][1]
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
    }
  }
  return pts[pts.length - 1][1]
}

export function normaliseProfile(p: Profile): FullProfile {
  const q = { ...p, assumed: { ...(p.assumed || {}) } } as FullProfile
  q.type = q.type === "business" ? "business" : "individual"
  if (!q.product) q.product = q.type === "business" ? "business" : "personal"
  if (q.creditScore == null && !q.newToCredit) { q.creditScore = 650; q.assumed.creditScore = true }
  if (q.existingEmi == null) { q.existingEmi = 0; q.assumed.existingEmi = true }
  if (q.tenureMonths == null) { q.tenureMonths = DEFAULT_TENURE[q.product] || 48; q.assumed.tenureMonths = true }
  if (q.latePayments == null) q.latePayments = 0
  if (q.enquiries == null) q.enquiries = 0
  if (q.chequeBounces == null) q.chequeBounces = 0
  if (q.type === "business") {
    if (q.annualTurnover == null) { q.annualTurnover = 3000000; q.assumed.annualTurnover = true }
    if (q.netProfit == null) { q.netProfit = q.annualTurnover * 0.08; q.assumed.netProfit = true }
    if (q.vintageYears == null) { q.vintageYears = 2; q.assumed.vintageYears = true }
    if (q.itrYears == null) { q.itrYears = 0; q.assumed.itrYears = true }
    if (q.gst == null) { q.gst = false; q.assumed.gst = true }
    if (q.loanAmount == null) { q.loanAmount = Math.round((q.annualTurnover * 0.15) / 100000) * 100000 || 500000; q.assumed.loanAmount = true }
  } else {
    if (q.monthlyIncome == null) { q.monthlyIncome = 30000; q.assumed.monthlyIncome = true }
    if (q.experienceYears == null) { q.experienceYears = 2; q.assumed.experienceYears = true }
    if (q.loanAmount == null) { q.loanAmount = q.monthlyIncome * 15; q.assumed.loanAmount = true }
  }
  if (!q.docs) q.docs = []
  return q
}

export function rateFor(score: number, productId: string) {
  const base = productById(productId).minRate
  const add = score >= 780 ? 0 : score >= 730 ? 0.75 : score >= 680 ? 1.6 : score >= 620 ? 2.9 : 4.8
  return Math.round((base + add) * 100) / 100
}

export function gradeFor(score: number): { label: string; cls: Severity } {
  if (score >= 780) return { label: "Excellent", cls: "good" }
  if (score >= 700) return { label: "Good", cls: "good" }
  if (score >= 620) return { label: "Fair", cls: "warn" }
  return { label: "Needs work", cls: "bad" }
}

interface ScoreOpts { noSim?: boolean; skipAssumed?: boolean }

export function computeScore(rawProfile: Profile, opts: ScoreOpts = {}): ScoreResult {
  const p = normaliseProfile(rawProfile)
  const isBiz = p.type === "business"
  const factors: Factor[] = []
  const issues: Issue[] = []

  // Business: lenders look at cash profit (net profit + depreciation + interest) ≈ 1.6 × net profit
  const monthlyIncome = isBiz ? ((p.netProfit ?? 0) * 1.6) / 12 + (p.monthlyIncome || 0) : (p.monthlyIncome ?? 0)
  const prelimRate = productById(p.product).minRate + 2
  const newEmi = emi(p.loanAmount, prelimRate, p.tenureMonths)
  const foir = monthlyIncome > 0 ? (p.existingEmi + newEmi) / monthlyIncome : 2
  const existingFoir = monthlyIncome > 0 ? p.existingEmi / monthlyIncome : 1
  const pushF = (f: Omit<Factor, "lost" | "status">) => factors.push({ ...f, lost: 0, status: "good" })

  /* 1. Credit history (30%) */
  const cs = p.creditScore ?? 650
  const ch = p.newToCredit ? 50 : clamp(interp(cs, [[300, 0], [550, 12], [650, 45], [700, 65], [750, 85], [800, 100]]), 0, 100)
  pushF({ key: "credit", name: "Credit history", weight: 30, value: ch, note: p.newToCredit ? "New to credit — no bureau history yet" : `Bureau score ${cs}${p.assumed.creditScore ? " (assumed)" : ""}` })

  /* 2. Repayment capacity — FOIR (25%) */
  const rc = clamp(interp(foir, [[0, 100], [0.35, 100], [0.5, 72], [0.65, 38], [0.8, 10], [1, 0]]), 0, 100)
  pushF({ key: "capacity", name: "Repayment capacity", weight: 25, value: rc, note: `EMIs would take ${Math.round(foir * 100)}% of ${isBiz ? "monthly cash profit" : "monthly income"} (ideal under 50%)` })

  /* 3. Stability (15%) */
  let st: number, stNote: string
  if (isBiz) {
    const v = p.vintageYears ?? 0
    st = interp(v, [[0, 10], [1, 35], [2, 60], [3, 80], [5, 100]])
    stNote = `${trimNum(v)} yrs business vintage${p.assumed.vintageYears ? " (assumed)" : ""}`
  } else {
    const e = p.experienceYears ?? 0
    st = interp(e, [[0, 20], [1, 50], [2, 68], [3, 82], [5, 100]])
    if (p.age && (p.age < 23 || p.age > 58)) st -= 15
    stNote = `${trimNum(e)} yrs work experience${p.age ? `, age ${p.age}` : ""}`
  }
  pushF({ key: "stability", name: isBiz ? "Business stability" : "Income stability", weight: 15, value: clamp(st, 0, 100), note: stNote })

  /* 4. Financial strength (15%) */
  let fs: number, fsNote: string
  let margin: number | null = null, loanToTurnover: number | null = null
  if (isBiz) {
    const to = p.annualTurnover ?? 0, np = p.netProfit ?? 0
    fs = interp(to, [[0, 10], [1e6, 30], [2e6, 48], [5e6, 68], [1e7, 82], [5e7, 100]])
    margin = to > 0 ? np / to : 0
    if (margin < 0.03) fs -= 18; else if (margin >= 0.1) fs += 6
    if (!p.gst) fs -= 12
    if ((p.itrYears ?? 0) < 2) fs -= 12
    loanToTurnover = p.loanAmount / Math.max(to, 1)
    if (loanToTurnover > 0.5) fs -= 15
    fsNote = `Turnover ${inr(to, { short: true })}, margin ${Math.round(margin * 100)}%, GST ${p.gst ? "yes" : "no"}, ITR ${p.itrYears ?? 0} yrs`
  } else {
    fs = interp(p.monthlyIncome ?? 0, [[0, 5], [15000, 22], [25000, 45], [40000, 65], [75000, 85], [150000, 100]])
    if (p.employment === "self-employed" && !((p.itrYears ?? 0) >= 2)) fs -= 10
    fsNote = `Income ${inr(p.monthlyIncome)}/month${p.employment ? ` · ${p.employment}` : ""}`
  }
  pushF({ key: "strength", name: "Financial strength", weight: 15, value: clamp(fs, 0, 100), note: fsNote })

  /* 5. Credit behaviour (10%) */
  let cb = 100
  cb -= Math.min(p.latePayments * 18, 70)
  cb -= Math.max(0, p.enquiries - 3) * 10
  cb -= Math.min(p.chequeBounces * 15, 60)
  pushF({ key: "behaviour", name: "Credit behaviour", weight: 10, value: clamp(cb, 0, 100), note: `${p.latePayments} late payments · ${p.enquiries} recent enquiries${isBiz || p.chequeBounces ? ` · ${p.chequeBounces} bounces` : ""}` })

  /* 6. Documentation (5%) */
  const required = DOCS[p.type].filter((d) => d.req).map((d) => d.id)
  const have = required.filter((id) => p.docs.includes(id))
  pushF({ key: "docs", name: "Documentation", weight: 5, value: required.length ? (have.length / required.length) * 100 : 100, note: `${have.length} of ${required.length} key documents ready` })

  const weighted = factors.reduce((s, f) => s + f.value * f.weight, 0) / 100
  const baseScore = Math.round(300 + weighted * 6)
  const verificationBonus = p.verification?.bonus ?? 0
  const score = clamp(baseScore + verificationBonus, 300, 900)
  factors.forEach((f) => {
    f.lost = Math.round(((100 - f.value) * f.weight) / 100 * 6)
    f.status = f.value >= 75 ? "good" : f.value >= 50 ? "warn" : "bad"
  })

  const grade = gradeFor(score)
  const rate = rateFor(score, p.product)

  /* Eligibility */
  let eligible: number
  if (isBiz) {
    const maxEmi = Math.max(0, monthlyIncome * 0.6 - p.existingEmi)
    eligible = principalFromEmi(maxEmi, rate, p.tenureMonths)
    eligible = Math.min(eligible, (p.annualTurnover ?? 0) * 0.35 + (p.collateral || 0) * 0.6)
  } else {
    const maxEmi = Math.max(0, monthlyIncome * 0.55 - p.existingEmi)
    eligible = principalFromEmi(maxEmi, rate, p.tenureMonths)
    if (p.product === "personal" || p.product === "professional") eligible = Math.min(eligible, monthlyIncome * 30)
  }
  if (score < 560) eligible *= 0.5
  eligible = Math.max(0, Math.floor(eligible / 10000) * 10000)
  const finalEmi = emi(p.loanAmount, rate, p.tenureMonths)

  /* Approval probability */
  let approval = 1 / (1 + Math.exp(-(score - 660) / 38))
  if (p.loanAmount > eligible) approval *= eligible > 0 ? clamp(eligible / p.loanAmount, 0.35, 0.9) : 0.2
  approval = clamp(approval, 0.04, 0.97)

  /* ---------- Issues: "why is my score low?" ---------- */
  const add = (sev: Severity, title: string, why: string, fix: string, impact: number | null) => issues.push({ sev, title, why, fix, impact })
  const F = (k: string) => factors.find((f) => f.key === k)!.lost

  const assumedLabels: Record<string, [string, string, string]> = {
    creditScore: ["Credit score not mentioned", "We assumed a CIBIL of 650. Your real score may be higher (or lower).", "Add your CIBIL / Experian score — you can get it free once a year from the bureau websites."],
    monthlyIncome: ["Monthly income missing", "Income is the base of every eligibility calculation — we assumed ₹30,000.", "Mention your net monthly salary (in-hand) or average monthly income."],
    annualTurnover: ["Annual turnover missing", "We assumed ₹30 L turnover to estimate your capacity.", "Add last year's turnover as per ITR / GST returns."],
    netProfit: ["Net profit not mentioned", "We estimated profit at 8% of turnover.", "Add net profit (PAT) from your latest audited P&L."],
    vintageYears: ["Business vintage not mentioned", "Lenders usually need 2–3 years of operations. We assumed 2 years.", "Add the year your business started / was registered."],
    experienceYears: ["Work experience not mentioned", "We assumed 2 years of total experience.", "Add total experience and years in current job."],
    existingEmi: ["Existing EMIs not mentioned", "We assumed you have no running EMIs.", 'List all running EMIs and credit card dues (or write "No existing EMI").'],
  }
  if (!opts.skipAssumed) {
    Object.keys(assumedLabels).forEach((k) => {
      if (p.assumed[k]) { const [t, w, f] = assumedLabels[k]; add("warn", t, w, f, null) }
    })
  }

  if (p.newToCredit) add("warn", "No credit history yet", "Without a bureau track record, lenders cannot see how you repay.", "Start with a secured credit card or small consumer loan and repay on time for 6 months.", F("credit"))
  else if (cs < 650) add("bad", `Low credit score (${cs})`, "Most banks need 700+; NBFCs go to ~650 at higher rates.", "Pay all dues on time, keep credit-card usage below 30% of limit, and settle any overdue/written-off accounts.", F("credit"))
  else if (cs < 730) add("warn", `Credit score could be stronger (${cs})`, "730+ unlocks better rates from private and PSU banks.", "Lower card utilisation under 30% and avoid new loan applications for a few months.", F("credit"))
  else add("good", `Strong credit score (${cs})`, "Your bureau score qualifies for prime-rate lenders.", "Keep paying on time — no action needed.", 0)

  if (foir > 0.65) add("bad", `EMIs too high vs income (${Math.round(foir * 100)}%)`, `Existing EMIs ${inr(p.existingEmi)} + new EMI ~${inr(newEmi)} exceed what lenders allow (usually 50–60%).`, "Close or pre-pay small loans, add an earning co-applicant, choose a longer tenure, or reduce the loan amount.", F("capacity"))
  else if (foir > 0.5) add("warn", `High EMI burden (${Math.round(foir * 100)}%)`, "You are close to the lender limit for EMI-to-income ratio.", "A longer tenure or a slightly smaller amount brings this under 50%.", F("capacity"))
  else add("good", `Healthy repayment capacity (${Math.round(foir * 100)}%)`, "Your income comfortably covers the new EMI.", "No action needed.", 0)
  if (existingFoir > 0.35) add("warn", "Many running loans", `Existing EMIs already use ${Math.round(existingFoir * 100)}% of income.`, "Consolidate small loans or clear the costliest ones first.", null)

  if (isBiz) {
    const v = p.vintageYears ?? 0
    if (v < 2) add("bad", `Business is young (${trimNum(v)} yrs)`, "Most lenders want 2–3 years of operating history.", "Apply with an NBFC / startup lender, offer collateral, or wait until you cross 2 years with filed ITRs.", F("stability"))
    else if (v < 3) add("warn", `Vintage just above minimum (${trimNum(v)} yrs)`, "Banks prefer 3+ years.", "Show consistent growth in GST returns and bank credits.", F("stability"))
  } else {
    const e = p.experienceYears ?? 0
    if (e < 1) add("bad", "Less than 1 year of work experience", "Lenders see short job history as unstable income.", "Apply after completing 1 year, or add a co-applicant.", F("stability"))
    else if (e < 2) add("warn", `Short job history (${trimNum(e)} yrs)`, "Many banks prefer 2+ years total experience.", "Highlight total experience and stable employer category.", F("stability"))
    if (p.age && p.age > 58) add("warn", `Age ${p.age} limits tenure`, "Loans usually must close by 60–65 years.", "Choose a shorter tenure or add a younger co-applicant.", null)
  }

  if (isBiz) {
    if (!p.gst) add("bad", "GST registration not found", "Lenders use GST returns to verify turnover. Without it, only limited products are available.", "Register for GST (if eligible) and file returns regularly for 6+ months.", 8)
    if ((p.itrYears ?? 0) < 2) add("bad", `Only ${p.itrYears ?? 0} year(s) of ITR`, "Banks need at least 2 years of ITR with financials.", "File pending ITRs with a CA — this alone can add 20–40 points.", 8)
    if (margin !== null && margin < 0.03) add("warn", `Thin profit margin (${(margin * 100).toFixed(1)}%)`, "Low declared profit reduces eligible loan amount.", "Review expenses with your CA; declared profit drives eligibility.", null)
    if (loanToTurnover !== null && loanToTurnover > 0.5) add("bad", "Loan too large vs turnover", `You asked for ${Math.round(loanToTurnover * 100)}% of annual turnover; unsecured limits are usually 20–35%.`, "Reduce the amount, or apply for a secured loan (LAP / OD against property).", null)
  } else if ((p.monthlyIncome ?? 0) < 25000) {
    add("warn", "Income below most lenders' minimum", "Many lenders need ₹25,000+ monthly income for personal loans.", "Add a co-applicant or apply for a smaller, secured loan.", F("strength"))
  }

  if (p.latePayments > 0) add("bad", `${p.latePayments} late / missed EMI payment(s)`, "Payment delays are the #1 reason for rejection.", "Set up auto-debit for every EMI and card. Recent clean months gradually outweigh old delays.", Math.round(Math.min(p.latePayments * 18, 70) * 0.1 * 6))
  if (p.enquiries > 3) add("warn", `Too many loan enquiries (${p.enquiries})`, "Many applications in a short time look like credit hunger.", "Pause new applications for 3–6 months. Use FundenFlo to compare without hard enquiries.", Math.round((p.enquiries - 3) * 10 * 0.1 * 6))
  if (p.chequeBounces > 0) add("bad", `${p.chequeBounces} cheque / EMI bounce(s)`, "Bounces in bank statements are a red flag for lenders.", "Keep a buffer balance before EMI dates for the next 6 months.", Math.round(Math.min(p.chequeBounces * 15, 60) * 0.1 * 6))
  if (p.latePayments === 0 && p.chequeBounces === 0 && p.enquiries <= 3) add("good", "Clean repayment behaviour", "No delays, bounces or excess enquiries found.", "Keep it up.", 0)

  const missingDocs = DOCS[p.type].filter((d) => d.req && !p.docs.includes(d.id))
  if (missingDocs.length) add("warn", `${missingDocs.length} key document(s) not ready`, missingDocs.map((d) => d.name).join(", "), "Keep these ready — complete files get faster approval.", F("docs"))

  if (verificationBonus > 0) add("good", `Documents verified (+${verificationBonus} pts)`, "Your balance sheets and bank statement back up what you told us.", "No action needed.", 0)
  else if (verificationBonus < 0) add("bad", `Documents don't match your declaration (${verificationBonus} pts)`, "Some figures in your documents differ from what you told us.", "Correct the figures, or explain the gap to your FundenFlo advisor.", -verificationBonus)

  if (p.loanAmount > eligible && eligible > 0) add("warn", "Requested amount above eligibility", `You asked for ${inr(p.loanAmount, { short: true })}, current eligibility is about ${inr(eligible, { short: true })}.`, "Reduce the amount, extend tenure, or add a co-applicant / collateral.", null)

  const order: Record<Severity, number> = { bad: 0, warn: 1, good: 2 }
  issues.sort((a, b) => order[a.sev] - order[b.sev] || (b.impact || 0) - (a.impact || 0))

  /* Lender offers */
  const offers: Offer[] = LENDERS.map((l) => {
    const r = Math.round((rate + l.rateAdj) * 100) / 100
    let chance = approval * 100 + (score - l.minScore) / 2.5
    if (score < l.minScore - 40) chance = Math.min(chance, 8)
    chance = clamp(Math.round(chance), 3, 97)
    const amt = Math.min(p.loanAmount, eligible > 0 ? eligible : p.loanAmount)
    return { ...l, rate: r, chance, amount: amt, emi: emi(amt, r, p.tenureMonths) }
  }).sort((a, b) => b.chance - a.chance || a.rate - b.rate)

  return {
    profile: p, score, grade, rate, eligible, emi: finalEmi, newEmi, foir, approval, factors, issues, offers, monthlyIncome, verificationBonus,
    improvements: opts.noSim ? [] : buildImprovements(rawProfile, score),
  }
}

/* ---------- Improvement simulator ---------- */
interface Candidate { id: string; t: string; d: string; when: (p: FullProfile) => boolean; apply: (q: Profile, p: FullProfile) => Profile }
const CANDIDATES: Candidate[] = [
  { id: "credit", t: "Raise credit score to 760+", d: "On-time payments + card usage under 30% for 6 months", when: (p) => !p.newToCredit && (p.creditScore ?? 0) < 760, apply: (q) => ({ ...q, creditScore: 760 }) },
  { id: "emi", t: "Close / pre-pay smaller running loans", d: "Cut existing EMIs by half", when: (p) => p.existingEmi > 0, apply: (q) => ({ ...q, existingEmi: (q.existingEmi ?? 0) / 2 }) },
  { id: "coapp", t: "Add an earning co-applicant", d: "Adds ~40% to combined income", when: (p) => p.type !== "business", apply: (q) => ({ ...q, monthlyIncome: (q.monthlyIncome || 30000) * 1.4 }) },
  { id: "tenure", t: "Choose a longer tenure", d: "+24 months lowers the EMI", when: (p) => p.tenureMonths < 240, apply: (q, p) => ({ ...q, tenureMonths: p.tenureMonths + 24 }) },
  { id: "amount", t: "Reduce loan amount by 20%", d: "Smaller ask, higher approval", when: () => true, apply: (q, p) => ({ ...q, loanAmount: p.loanAmount * 0.8 }) },
  { id: "late", t: "Clean repayment track for 12 months", d: "Old delays lose weight over time", when: (p) => p.latePayments > 0 || p.chequeBounces > 0, apply: (q) => ({ ...q, latePayments: 0, chequeBounces: 0 }) },
  { id: "enq", t: "Pause new loan applications", d: "Let enquiries fall below 3", when: (p) => p.enquiries > 3, apply: (q) => ({ ...q, enquiries: 2 }) },
  { id: "gst", t: "Register for GST & file returns", d: "Verifiable turnover for lenders", when: (p) => p.type === "business" && !p.gst, apply: (q) => ({ ...q, gst: true }) },
  { id: "itr", t: "File pending ITRs (2+ years)", d: "With CA-certified financials", when: (p) => p.type === "business" && (p.itrYears ?? 0) < 2, apply: (q) => ({ ...q, itrYears: 2 }) },
  { id: "docs", t: "Keep all key documents ready", d: "Complete file = faster approval", when: (p) => DOCS[p.type].some((d) => d.req && !p.docs.includes(d.id)), apply: (q, p) => ({ ...q, docs: DOCS[p.type].map((d) => d.id) }) },
]

function pickDefined(p: object): Profile {
  const o: Record<string, unknown> = {}
  Object.entries(p).forEach(([k, v]) => { if (v != null) o[k] = v })
  return o as Profile
}

function buildImprovements(raw: Profile, baseScore: number): Improvement[] {
  const p = normaliseProfile(raw)
  const base = pickDefined(p)
  return CANDIDATES.filter((c) => c.when(p))
    .map((c) => ({ id: c.id, t: c.t, d: c.d, gain: computeScore(c.apply(base, p), { noSim: true }).score - baseScore }))
    .filter((c) => c.gain > 0)
    .sort((a, b) => b.gain - a.gain)
}

/** Score with a set of improvements applied (for the simulator & dashboard tasks) */
export function simulateScore(raw: Profile, ids: string[]): ScoreResult {
  const p = normaliseProfile(raw)
  let q = pickDefined(p)
  CANDIDATES.filter((c) => ids.includes(c.id) && c.when(p)).forEach((c) => { q = c.apply(q, p) })
  return computeScore(q, { noSim: true, skipAssumed: true })
}
