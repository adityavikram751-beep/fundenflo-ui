/* ==========================================================
   FundenFlo demo — static data & helpers (no backend)
   ========================================================== */
import {
  Bot, Zap, Briefcase, Building, Car, Cog, Factory, FileCheck, Gauge, GraduationCap, House, Landmark,
  Layers, Lightbulb, Receipt, Rocket, Stethoscope, Store, Target, TrendingUp, Truck, Wallet,
  type LucideIcon,
} from "lucide-react"

export type ApplicantType = "business" | "individual"

export interface Product {
  id: string
  name: string
  seg: ApplicantType
  icon: LucideIcon
  rate: string
  max: string
  tenure: string
  desc: string
  minRate: number
  maxAmount: number
}

export const PRODUCTS: Product[] = [
  { id: "business", name: "Business Loan", seg: "business", icon: Briefcase, rate: "11.5%", max: "₹2 Cr", tenure: "1–5 yrs", desc: "Unsecured working capital & expansion funds for MSMEs.", minRate: 11.5, maxAmount: 2e7 },
  { id: "lap", name: "Loan Against Property", seg: "business", icon: Building, rate: "9.25%", max: "₹10 Cr", tenure: "up to 15 yrs", desc: "Unlock the value of residential or commercial property.", minRate: 9.25, maxAmount: 1e8 },
  { id: "od", name: "OD / CC Limit", seg: "business", icon: Layers, rate: "10.5%", max: "₹5 Cr", tenure: "Renewable yearly", desc: "Secured or unsecured overdraft — pay interest only on what you use.", minRate: 10.5, maxAmount: 5e7 },
  { id: "machinery", name: "Machinery Loan", seg: "business", icon: Factory, rate: "10.75%", max: "₹3 Cr", tenure: "1–7 yrs", desc: "Finance new plant, machinery and hospital equipment.", minRate: 10.75, maxAmount: 3e7 },
  { id: "commercial", name: "Commercial Loan", seg: "business", icon: Store, rate: "10.25%", max: "₹5 Cr", tenure: "up to 10 yrs", desc: "Buy or build shops, offices and commercial premises.", minRate: 10.25, maxAmount: 5e7 },
  { id: "bill", name: "Bill Discounting", seg: "business", icon: Receipt, rate: "9.75%", max: "₹1 Cr", tenure: "30–180 days", desc: "Get paid today on invoices raised to your buyers.", minRate: 9.75, maxAmount: 1e7 },
  { id: "lc", name: "Letter of Credit", seg: "business", icon: Landmark, rate: "Fee based", max: "As per limit", tenure: "Trade cycle", desc: "Import / domestic LC support for traders and manufacturers.", minRate: 9.5, maxAmount: 5e7 },
  { id: "professional", name: "Professional Loan", seg: "individual", icon: Stethoscope, rate: "10.5%", max: "₹75 L", tenure: "1–6 yrs", desc: "For doctors, CAs, architects — set up or grow your practice.", minRate: 10.5, maxAmount: 7.5e6 },
  { id: "personal", name: "Personal Loan", seg: "individual", icon: Wallet, rate: "10.75%", max: "₹40 L", tenure: "1–6 yrs", desc: "Instant funds for any need — wedding, travel, medical.", minRate: 10.75, maxAmount: 4e6 },
  { id: "home", name: "Home Loan", seg: "individual", icon: House, rate: "8.4%", max: "₹5 Cr", tenure: "up to 30 yrs", desc: "Buy, build or renovate your home at low rates.", minRate: 8.4, maxAmount: 5e7 },
  { id: "auto", name: "Auto Loan", seg: "individual", icon: Car, rate: "8.9%", max: "₹1 Cr", tenure: "1–7 yrs", desc: "New & used car loans with up to 100% on-road funding.", minRate: 8.9, maxAmount: 1e7 },
  { id: "education", name: "Education Loan", seg: "individual", icon: GraduationCap, rate: "9.5%", max: "₹1.5 Cr", tenure: "up to 15 yrs", desc: "Study in India or abroad — tuition, living & travel.", minRate: 9.5, maxAmount: 1.5e7 },
  { id: "security", name: "Loan Against Securities", seg: "individual", icon: TrendingUp, rate: "9.0%", max: "₹5 Cr", tenure: "1–3 yrs", desc: "Pledge shares, MFs or bonds without selling them.", minRate: 9.0, maxAmount: 5e7 },
]

export const productById = (id?: string | null): Product => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0]

/* Demo lenders — generic labels, not real partners */
export interface Lender { code: string; name: string; type: string; color: string; rateAdj: number; fee: string; speed: string; minScore: number }
export const LENDERS: Lender[] = [
  { code: "PB", name: "Private Bank A", type: "Private sector bank", color: "#1d4e9e", rateAdj: 0, fee: "1.0%", speed: "3–5 days", minScore: 700 },
  { code: "PS", name: "PSU Bank B", type: "Public sector bank", color: "#0a192f", rateAdj: -0.6, fee: "0.5%", speed: "7–10 days", minScore: 720 },
  { code: "NM", name: "NBFC C — MSME", type: "MSME-focused NBFC", color: "#866608", rateAdj: 1.75, fee: "1.5%", speed: "48 hrs", minScore: 640 },
  { code: "FT", name: "Fintech NBFC D", type: "Digital lender", color: "#3f5f90", rateAdj: 3.0, fee: "2.0%", speed: "Same day", minScore: 600 },
  { code: "SF", name: "Small Finance Bank E", type: "Small finance bank", color: "#1f7a43", rateAdj: 1.2, fee: "1.25%", speed: "4–6 days", minScore: 650 },
]

export interface DocItem { id: string; name: string; note: string; req: boolean }
export const DOCS: Record<ApplicantType, DocItem[]> = {
  individual: [
    { id: "pan", name: "PAN Card", note: "Identity & tax ID", req: true },
    { id: "aadhaar", name: "Aadhaar Card", note: "Address & e-KYC", req: true },
    { id: "salary", name: "Last 3 Salary Slips", note: "Or ITR for self-employed", req: true },
    { id: "bank", name: "6-Month Bank Statement", note: "Salary / main account", req: true },
    { id: "form16", name: "Form 16 / ITR (2 yrs)", note: "Income proof", req: false },
    { id: "photo", name: "Passport Photo", note: "Recent, clear", req: false },
  ],
  business: [
    { id: "pan", name: "Business PAN", note: "Firm / company PAN", req: true },
    { id: "kyc", name: "Promoter KYC (PAN + Aadhaar)", note: "All partners / directors", req: true },
    { id: "gst", name: "GST Certificate & Returns", note: "Last 12 months GSTR-3B", req: true },
    { id: "bank", name: "12-Month Bank Statement", note: "Current account(s)", req: true },
    { id: "itr", name: "ITR + Financials (2 yrs)", note: "Audited P&L and balance sheet", req: true },
    { id: "udyam", name: "Udyam Registration", note: "MSME certificate", req: false },
    { id: "property", name: "Property Papers", note: "Only for secured loans", req: false },
  ],
}

export const FEATURES: { icon: LucideIcon; t: string; d: string }[] = [
  { icon: Zap, t: "Live Eligibility Check", d: "Your score and eligible amount update live as you fill the 2-minute form." },
  { icon: Target, t: "Smart Lender Match", d: "We compare 50+ banks & NBFCs and rank the offers you are most likely to get." },
  { icon: Gauge, t: "Explainable Score", d: "See exactly which factors pull your score down — and how many points each fix adds." },
  { icon: FileCheck, t: "Document Auto-Check", d: "Instant checks for missing, blurry or mismatched documents before you submit." },
  { icon: Lightbulb, t: "Score Improvement Coach", d: "A step-by-step plan to raise your score and unlock lower interest rates." },
  { icon: Bot, t: "Flo — 24×7 AI Assistant", d: "Ask anything in English or Hindi — EMI, documents, eligibility, status." },
]

export const STEPS = [
  { t: "Tell us your need", d: "Pick business or personal, choose a loan and amount. 2 minutes." },
  { t: "AI assessment", d: "Our engine scores your profile and flags issues instantly." },
  { t: "Compare offers", d: "See matched lenders with rate, fee and approval chance." },
  { t: "Upload & disburse", d: "Upload docs once; our team handles the lender process." },
]

export const SERVE: { icon: LucideIcon; t: string }[] = [
  { icon: Factory, t: "Manufacturing" }, { icon: Store, t: "Retail & D2C" }, { icon: Cog, t: "Service Businesses" },
  { icon: Rocket, t: "Startups" }, { icon: Truck, t: "Traders & Distributors" }, { icon: Stethoscope, t: "Professionals" },
]

export const TESTIMONIALS = [
  { n: "Meera K.", r: "Textile unit owner, Surat", q: "The score report told me exactly why banks were saying no — two cheque bounces and high EMIs. Fixed it in 3 months and got my OD limit." },
  { n: "Arjun S.", r: "Salaried, Pune", q: "Filled the 2-minute form and got a full breakdown of my score. The home-loan offer comparison saved me 0.6% on rate." },
  { n: "Dr. Nisha R.", r: "Dental clinic, Jaipur", q: "Machinery loan for my clinic sorted without running to five banks. The chat assistant answered everything at midnight!" },
]

export const FAQS = [
  { q: "What is the FundenFlo Score?", a: "A 300–900 loan-readiness score built from your credit history, repayment capacity, income stability, financial strength, credit behaviour and documentation. Higher means better approval chances and lower rates." },
  { q: "Does checking my score affect my CIBIL?", a: "No. FundenFlo runs a soft assessment on the information you share. No hard enquiry is made until you choose to apply with a lender." },
  { q: "Who can apply — businesses or individuals?", a: "Both. MSMEs, proprietors, partnerships, companies and startups can apply for business products; salaried, self-employed and professionals can apply for personal products." },
  { q: "What documents do I need?", a: "Individuals: PAN, Aadhaar, salary slips (or ITR) and 6 months of bank statements. Businesses: business PAN, promoter KYC, GST returns, 12 months of bank statements and 2 years of ITR with financials." },
  { q: "Are there any hidden fees?", a: "No. Our advisory is transparent and all lender charges are shown upfront in the offer comparison." },
]

/* ---------- formatting & finance helpers ---------- */
export const trimNum = (x: number) => (Math.round(x * 100) / 100).toString()

export function inr(n: number | null | undefined, opts: { short?: boolean } = {}): string {
  if (n == null || Number.isNaN(n)) return "—"
  const v = Math.round(n)
  if (opts.short) {
    if (Math.abs(v) >= 1e7) return "₹" + trimNum(v / 1e7) + " Cr"
    if (Math.abs(v) >= 1e5) return "₹" + trimNum(v / 1e5) + " L"
    if (Math.abs(v) >= 1e3) return "₹" + trimNum(v / 1e3) + "K"
  }
  return "₹" + v.toLocaleString("en-IN")
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

export function emi(P: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100
  if (!r) return P / months
  return (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

export function principalFromEmi(E: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100
  if (!r) return E * months
  return (E * (Math.pow(1 + r, months) - 1)) / (r * Math.pow(1 + r, months))
}

export const initials = (name?: string | null) =>
  (name || "U").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("")
