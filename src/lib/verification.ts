/* ==========================================================
   Document verification — compares what the customer SAID
   with what their balance sheets / bank statements SHOW,
   adds or removes points, and derives new credit metrics.

   Demo note: document "reading" is simulated (see readDocuments).
   In production this is OCR/AI extraction + Account Aggregator
   bank data; the comparison & scoring logic below stays the same.
   ========================================================== */
import { clamp, emi, inr, productById, type ApplicantType } from "./data"
import { normaliseProfile, type Profile } from "./scoring"

/* ---------- document slots ---------- */
export interface DocSlot { id: string; name: string; note: string; req: boolean }

export function fyLabels(now = new Date()) {
  // Indian FY ends 31 March. Latest completed FY is the one that ended before today.
  const endYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  const fy = (end: number) => `FY ${end - 1}-${String(end).slice(2)}`
  return { cur: fy(endYear), prev: fy(endYear - 1) }
}

export function docSlots(type: ApplicantType): DocSlot[] {
  const fy = fyLabels()
  return type === "business"
    ? [
        { id: "bs_cur", name: `Balance sheet & P&L — ${fy.cur}`, note: "Audited / CA-certified, PDF", req: true },
        { id: "bs_prev", name: `Balance sheet & P&L — ${fy.prev}`, note: "Previous year, for growth trend", req: true },
        { id: "bank", name: "Bank statement — last 12 months", note: "Main current account, PDF", req: true },
        { id: "gst", name: "GST returns (GSTR-3B)", note: "Optional — cross-checks turnover", req: false },
      ]
    : [
        { id: "salary", name: "Salary slips — last 3 months", note: "PDF or photo", req: true },
        { id: "bank", name: "Bank statement — last 6 months", note: "Salary account, PDF", req: true },
        { id: "itr", name: "ITR / Form 16 — last 2 years", note: "Optional — confirms income", req: false },
      ]
}

/* ---------- what the "AI" read from the documents (editable in the UI) ---------- */
export interface Reading {
  revenueCur?: number; revenuePrev?: number; profitCur?: number; profitPrev?: number
  totalDebt?: number; netWorth?: number; gstTurnover?: number
  salaryCredit?: number
  avgMonthlyCredits?: number; avgBalance?: number; emiDebits?: number; bounces?: number
}

export const READING_FIELDS: { k: keyof Reading; l: string; src: string; money: boolean; type: ApplicantType | "both"; needs: string[] }[] = [
  { k: "revenueCur", l: "Revenue (latest FY)", src: "Balance sheet", money: true, type: "business", needs: ["bs_cur"] },
  { k: "revenuePrev", l: "Revenue (previous FY)", src: "Balance sheet", money: true, type: "business", needs: ["bs_prev"] },
  { k: "profitCur", l: "Net profit (latest FY)", src: "P&L", money: true, type: "business", needs: ["bs_cur"] },
  { k: "profitPrev", l: "Net profit (previous FY)", src: "P&L", money: true, type: "business", needs: ["bs_prev"] },
  { k: "totalDebt", l: "Total borrowings", src: "Balance sheet", money: true, type: "business", needs: ["bs_cur"] },
  { k: "netWorth", l: "Net worth", src: "Balance sheet", money: true, type: "business", needs: ["bs_cur"] },
  { k: "gstTurnover", l: "GST turnover (12 months)", src: "GST returns", money: true, type: "business", needs: ["gst"] },
  { k: "salaryCredit", l: "Net salary credited / month", src: "Salary slips", money: true, type: "individual", needs: ["salary"] },
  { k: "avgMonthlyCredits", l: "Avg monthly credits", src: "Bank statement", money: true, type: "both", needs: ["bank"] },
  { k: "avgBalance", l: "Avg monthly balance", src: "Bank statement", money: true, type: "both", needs: ["bank"] },
  { k: "emiDebits", l: "EMI debits found / month", src: "Bank statement", money: true, type: "both", needs: ["bank"] },
  { k: "bounces", l: "Cheque / EMI bounces", src: "Bank statement", money: false, type: "both", needs: ["bank"] },
]

export type Scenario = "match" | "mismatch" | "upload"

/** Simple deterministic PRNG so the same files give the same "reading" */
function rng(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296 }
}
const r2 = (n: number, step = 1000) => Math.round(n / step) * step

/**
 * DEMO: simulates reading the uploaded documents.
 * "match" = documents agree with the declaration, "mismatch" = they reveal gaps,
 * "upload" = user's own files → values close to what they declared (seeded by file names).
 */
export function readDocuments(raw: Profile, uploaded: Record<string, string>, scenario: Scenario): Reading {
  const p = normaliseProfile(raw)
  const has = (id: string) => !!uploaded[id]
  const rand = rng(Object.values(uploaded).join("|") + scenario)
  const out: Reading = {}

  if (p.type === "business") {
    const to = p.annualTurnover ?? 3e6, np = p.netProfit ?? to * 0.08, emiNow = p.existingEmi
    const f = scenario === "match" ? { to: 0.97, np: 0.95, growth: 1.16, pg: 1.12, bounces: 0, extraEmi: 0 }
      : scenario === "mismatch" ? { to: 0.78, np: 0.68, growth: 0.96, pg: 0.9, bounces: 2, extraEmi: Math.max(18000, emiNow * 0.5) }
      : { to: 0.9 + rand() * 0.12, np: 0.84 + rand() * 0.16, growth: 1.02 + rand() * 0.2, pg: 0.98 + rand() * 0.2, bounces: rand() < 0.75 ? 0 : 1, extraEmi: 0 }
    const revCur = to * f.to, profCur = np * f.np
    if (has("bs_cur")) {
      out.revenueCur = r2(revCur, 10000); out.profitCur = r2(profCur, 10000)
      out.totalDebt = r2(Math.max(emiNow, 1) * 12 * 3.2 + (scenario === "mismatch" ? to * 0.25 : 0), 10000)
      out.netWorth = r2(to * (scenario === "mismatch" ? 0.12 : 0.24), 10000)
    }
    if (has("bs_prev")) { out.revenuePrev = r2(revCur / f.growth, 10000); out.profitPrev = r2(profCur / f.pg, 10000) }
    if (has("gst")) out.gstTurnover = r2(revCur * (scenario === "mismatch" ? 0.95 : 0.99), 10000)
    if (has("bank")) {
      out.avgMonthlyCredits = r2((revCur * (scenario === "mismatch" ? 0.55 : 0.9)) / 12)
      out.avgBalance = r2(revCur * (scenario === "mismatch" ? 0.008 : 0.025))
      out.emiDebits = r2(emiNow + f.extraEmi, 500)
      out.bounces = f.bounces
    }
  } else {
    const inc = p.monthlyIncome ?? 30000, emiNow = p.existingEmi
    const f = scenario === "match" ? { inc: 0.99, bounces: 0, extraEmi: 0 } : scenario === "mismatch" ? { inc: 0.8, bounces: 2, extraEmi: Math.max(6000, emiNow * 0.5) } : { inc: 0.93 + rand() * 0.08, bounces: rand() < 0.8 ? 0 : 1, extraEmi: 0 }
    if (has("salary")) out.salaryCredit = r2(inc * f.inc, 500)
    if (has("bank")) {
      out.avgMonthlyCredits = r2(inc * f.inc * 1.05, 500)
      out.avgBalance = r2(inc * (scenario === "mismatch" ? 0.15 : 0.6), 500)
      out.emiDebits = r2(emiNow + f.extraEmi, 500)
      out.bounces = f.bounces
    }
  }
  return out
}

/* ---------- comparison ---------- */
export type CheckStatus = "match" | "variance" | "mismatch" | "new"
export interface Check { key: string; label: string; declared: string; found: string; source: string; status: CheckStatus; points: number; note: string }
export interface Metric { key: string; label: string; value: string; benchmark: string; status: "good" | "warn" | "bad"; note: string }
export interface Verification { checks: Check[]; metrics: Metric[]; bonus: number; verifiedProfile: Profile; matched: number; flagged: number }

const pctDiff = (declared: number, found: number) => (declared ? (declared - found) / declared : 0)
const fmtPct = (x: number) => `${x > 0 ? "+" : ""}${Math.round(x * 100)}%`

export function verify(raw: Profile, reading: Reading): Verification {
  const p = normaliseProfile(raw)
  const isBiz = p.type === "business"
  const checks: Check[] = []
  const metrics: Metric[] = []
  const v: Profile = { ...raw, docs: [...new Set([...(raw.docs ?? [])])] }

  const compare = (key: string, label: string, declared: number | null | undefined, found: number | undefined, source: string, pts: [number, number, number], declaredWasGiven: boolean) => {
    if (found == null) return
    if (!declaredWasGiven || declared == null) {
      checks.push({ key, label, declared: "Not mentioned", found: inr(found, { short: true }), source, status: "new", points: Math.round(pts[0] / 2), note: "Filled in from your documents" })
      return
    }
    const d = pctDiff(declared, found) // > 0 means the customer over-stated
    const ad = Math.abs(d)
    const gap = `${Math.round(ad * 100)}%`
    let status: CheckStatus, points: number, note: string
    if (ad <= 0.1) { status = "match"; points = pts[0]; note = "Matches what you told us" }
    else if (d < 0) {
      // documents show MORE than declared — conservative, not penalised
      status = "variance"; points = ad <= 0.25 ? pts[0] : pts[1]; note = `Documents show ${gap} more than you declared`
    } else if (ad <= 0.25) { status = "variance"; points = 0; note = `You declared ${gap} more than your documents show` }
    else { status = "mismatch"; points = pts[2]; note = `You declared ${gap} more than your documents show` }
    checks.push({ key, label, declared: inr(declared, { short: true }), found: inr(found, { short: true }), source, status, points, note })
  }

  if (isBiz) {
    compare("turnover", "Annual turnover", raw.annualTurnover, reading.revenueCur, "Balance sheet", [12, 4, -10], raw.annualTurnover != null)
    compare("profit", "Net profit", raw.netProfit, reading.profitCur, "P&L statement", [10, 3, -8], raw.netProfit != null)
    if (reading.revenueCur != null) v.annualTurnover = reading.revenueCur
    if (reading.profitCur != null) v.netProfit = reading.profitCur
    if (reading.revenueCur != null && reading.revenuePrev != null) {
      v.itrYears = Math.max(raw.itrYears ?? 0, 2)
      v.vintageYears = Math.max(raw.vintageYears ?? 0, 2)
      const declaredV = raw.vintageYears
      checks.push({ key: "vintage", label: "Business age", declared: declaredV != null ? `${declaredV} years` : "Not mentioned", found: "2+ years of financials", source: "Balance sheets", status: declaredV == null ? "new" : declaredV >= 2 ? "match" : "variance", points: declaredV == null || declaredV >= 2 ? 4 : 0, note: "Two years of audited financials confirm operating history" })
      v.docs = [...new Set([...(v.docs ?? []), "itr"])]
    }
    if (reading.gstTurnover != null) {
      v.gst = true
      v.docs = [...new Set([...(v.docs ?? []), "gst"])]
      const ref = reading.revenueCur ?? raw.annualTurnover
      if (ref) {
        const ad = Math.abs(pctDiff(ref, reading.gstTurnover))
        checks.push({ key: "gst", label: "GST turnover vs books", declared: inr(ref, { short: true }), found: inr(reading.gstTurnover, { short: true }), source: "GST returns", status: ad <= 0.1 ? "match" : "variance", points: ad <= 0.1 ? 5 : 0, note: ad <= 0.1 ? "GST filings agree with your books" : "GST filings differ from your books" })
      }
    }
  } else {
    compare("income", "Monthly income", raw.monthlyIncome, reading.salaryCredit, "Salary slips", [12, 4, -10], raw.monthlyIncome != null)
    if (reading.salaryCredit != null) { v.monthlyIncome = reading.salaryCredit; v.docs = [...new Set([...(v.docs ?? []), "salary"])] }
  }

  if (reading.emiDebits != null) {
    v.docs = [...new Set([...(v.docs ?? []), "bank"])]
    const declared = raw.existingEmi
    const found = reading.emiDebits
    if (declared == null) {
      checks.push({ key: "emi", label: "Existing EMIs", declared: "Not mentioned", found: `${inr(found)}/mo`, source: "Bank statement", status: "new", points: 2, note: "EMIs picked up from your bank debits" })
    } else if (found > declared * 1.15 + 2000) {
      checks.push({ key: "emi", label: "Existing EMIs", declared: `${inr(declared)}/mo`, found: `${inr(found)}/mo`, source: "Bank statement", status: "mismatch", points: -8, note: `EMIs of ${inr(found - declared)}/month were not disclosed` })
    } else {
      checks.push({ key: "emi", label: "Existing EMIs", declared: `${inr(declared)}/mo`, found: `${inr(found)}/mo`, source: "Bank statement", status: "match", points: 6, note: "All running EMIs were disclosed" })
    }
    v.existingEmi = Math.max(declared ?? 0, found)
  }
  if (reading.bounces != null) {
    const b = reading.bounces
    checks.push({ key: "bounces", label: "Banking conduct", declared: raw.chequeBounces != null ? `${raw.chequeBounces} bounces` : "Not mentioned", found: `${b} bounce${b === 1 ? "" : "s"} in statement`, source: "Bank statement", status: b === 0 ? "match" : b <= 2 ? "variance" : "mismatch", points: b === 0 ? 8 : b <= 2 ? -3 : -10, note: b === 0 ? "Clean account — no cheque or EMI returns" : "Bounces lower lender confidence" })
    v.chequeBounces = Math.max(raw.chequeBounces ?? 0, b)
  }

  /* ---------- new data points the documents unlock ---------- */
  const product = productById(p.product)
  const newEmi = emi(p.loanAmount, product.minRate + 2, p.tenureMonths)
  if (isBiz) {
    if (reading.revenueCur != null && reading.revenuePrev) {
      const g = reading.revenueCur / reading.revenuePrev - 1
      metrics.push({ key: "growth", label: "Revenue growth (YoY)", value: fmtPct(g), benchmark: "10%+ is strong", status: g >= 0.1 ? "good" : g >= 0 ? "warn" : "bad", note: `${inr(reading.revenuePrev, { short: true })} → ${inr(reading.revenueCur, { short: true })}` })
      checks.push({ key: "growth", label: "Revenue trend", declared: "—", found: fmtPct(g), source: "2 balance sheets", status: "new", points: g >= 0.1 ? 6 : g >= 0 ? 2 : -6, note: g >= 0 ? "Business is growing" : "Revenue fell year on year" })
    }
    if (reading.profitCur != null && reading.revenueCur) {
      const m = reading.profitCur / reading.revenueCur
      metrics.push({ key: "margin", label: "Net profit margin", value: `${(m * 100).toFixed(1)}%`, benchmark: "5%+ healthy", status: m >= 0.05 ? "good" : m >= 0.02 ? "warn" : "bad", note: "Net profit ÷ revenue" })
    }
    if (reading.profitCur != null) {
      const debtService = ((reading.emiDebits ?? p.existingEmi) + newEmi) * 12
      const dscr = (reading.profitCur * 1.6) / Math.max(debtService, 1)
      metrics.push({ key: "dscr", label: "DSCR (with new loan)", value: dscr.toFixed(2) + "×", benchmark: "1.25×+ required", status: dscr >= 1.5 ? "good" : dscr >= 1.2 ? "warn" : "bad", note: "Cash profit ÷ yearly EMIs incl. this loan" })
      checks.push({ key: "dscr", label: "Debt service cover", declared: "—", found: dscr.toFixed(2) + "×", source: "P&L + bank", status: "new", points: dscr >= 1.5 ? 6 : dscr >= 1.2 ? 2 : -6, note: dscr >= 1.25 ? "Profits comfortably cover all EMIs" : "Profits are tight against EMIs" })
    }
    if (reading.totalDebt != null && reading.netWorth) {
      const de = reading.totalDebt / reading.netWorth
      metrics.push({ key: "leverage", label: "Debt / net worth", value: de.toFixed(2) + "×", benchmark: "Below 2× preferred", status: de <= 1.5 ? "good" : de <= 3 ? "warn" : "bad", note: `${inr(reading.totalDebt, { short: true })} debt on ${inr(reading.netWorth, { short: true })} net worth` })
      checks.push({ key: "leverage", label: "Leverage", declared: "—", found: de.toFixed(2) + "×", source: "Balance sheet", status: "new", points: de <= 1.5 ? 4 : de <= 3 ? 0 : -6, note: de <= 1.5 ? "Comfortable borrowing level" : "High borrowing vs net worth" })
    }
    if (reading.avgMonthlyCredits != null && (reading.revenueCur ?? raw.annualTurnover)) {
      const cov = (reading.avgMonthlyCredits * 12) / (reading.revenueCur ?? raw.annualTurnover!)
      metrics.push({ key: "credits", label: "Sales routed via bank", value: `${Math.round(cov * 100)}%`, benchmark: "80%+ preferred", status: cov >= 0.8 ? "good" : cov >= 0.6 ? "warn" : "bad", note: "Bank credits ÷ reported revenue" })
      checks.push({ key: "credits", label: "Bank credits vs turnover", declared: "—", found: `${Math.round(cov * 100)}%`, source: "Bank statement", status: "new", points: cov >= 0.8 ? 4 : cov >= 0.6 ? 0 : -6, note: cov >= 0.8 ? "Sales are banked — easy for lenders to verify" : "Much of the turnover isn't visible in the bank" })
    }
  } else if (reading.avgBalance != null) {
    const ratio = reading.avgBalance / Math.max(newEmi, 1)
    metrics.push({ key: "buffer", label: "Avg balance vs new EMI", value: ratio.toFixed(1) + "×", benchmark: "1×+ comfortable", status: ratio >= 1 ? "good" : ratio >= 0.5 ? "warn" : "bad", note: `${inr(reading.avgBalance)} avg balance` })
    checks.push({ key: "buffer", label: "Account balance buffer", declared: "—", found: ratio.toFixed(1) + "×", source: "Bank statement", status: "new", points: ratio >= 1 ? 5 : ratio >= 0.5 ? 0 : -4, note: ratio >= 1 ? "Healthy balance kept in the account" : "Low balance relative to the new EMI" })
  }
  if (reading.bounces != null) metrics.push({ key: "conduct", label: "Bounces (statement period)", value: String(reading.bounces), benchmark: "0 expected", status: reading.bounces === 0 ? "good" : reading.bounces <= 2 ? "warn" : "bad", note: "Cheque, ECS & NACH returns" })

  const bonus = clamp(checks.reduce((s, c) => s + c.points, 0), -50, 60)
  v.verification = { bonus, level: "documents" }
  return {
    checks, metrics, bonus, verifiedProfile: v,
    matched: checks.filter((c) => c.status === "match").length,
    flagged: checks.filter((c) => c.status === "mismatch" || c.status === "variance").length,
  }
}
