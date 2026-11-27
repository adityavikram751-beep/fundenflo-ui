/* Rich content for the /loans/[id] product pages (illustrative demo terms). */
import type { ApplicantType } from "./data"

export interface ProductContent { tagline: string; highlights: string[]; idealFor: string[]; collateral: string; processing: string; faqs: { q: string; a: string }[] }

export const PRODUCT_CONTENT: Record<string, ProductContent> = {
  business: {
    tagline: "Collateral-free funds to grow, stock up or bridge working capital gaps.",
    highlights: ["No collateral up to ₹75 L", "Disbursal in as little as 72 hours", "Flexible tenure of 12–60 months", "Part-prepayment allowed after 6 EMIs"],
    idealFor: ["Expanding to a new location", "Buying inventory before peak season", "Hiring and marketing pushes", "Clearing supplier dues"],
    collateral: "Not required for most amounts; larger tickets may need a guarantor", processing: "1%–2% + GST",
    faqs: [{ q: "What is the minimum business vintage?", a: "Most lenders want 2 years of operations with filed ITRs. Some NBFCs fund 1-year-old businesses at higher rates." }, { q: "Can I get a business loan without GST?", a: "Yes, a few lenders consider non-GST businesses on bank statements, but limits are lower. GST registration widens your options." }],
  },
  lap: {
    tagline: "Unlock up to 70% of your property's value at home-loan-like rates.",
    highlights: ["Rates from 9.25% p.a.", "Tenure up to 15 years", "Residential, commercial & industrial property accepted", "Use funds for any business or personal need"],
    idealFor: ["Large expansion or capex", "Consolidating costly unsecured loans", "Funding a new unit", "Long-term working capital"],
    collateral: "Residential / commercial property with clear title", processing: "0.5%–1% + GST",
    faqs: [{ q: "How much can I get against my property?", a: "Typically 50–70% of the market value, depending on property type and your repayment capacity." }, { q: "Can I keep living in the property?", a: "Yes. You keep using the property; the lender only holds a mortgage until the loan is repaid." }],
  },
  od: {
    tagline: "A revolving limit — pay interest only on what you actually use.",
    highlights: ["Interest only on the amount drawn", "Withdraw and repay any number of times", "Renewed every 12 months", "Secured and unsecured options"],
    idealFor: ["Seasonal cash-flow gaps", "Paying suppliers before customer receipts", "Emergency buffer for operations", "Traders with fast inventory cycles"],
    collateral: "Unsecured up to ₹50 L; property / FD backed above that", processing: "0.5%–1% of the limit",
    faqs: [{ q: "OD vs term loan — which is better?", a: "OD suits fluctuating needs since you pay interest only on usage. A term loan suits one-time spends like machinery." }, { q: "What decides my OD limit?", a: "Mainly your banking turnover, GST returns and existing obligations — typically 20–25% of annual turnover." }],
  },
  machinery: {
    tagline: "Finance new or used machinery — the machine itself secures the loan.",
    highlights: ["Up to 90% of machine cost funded", "Machine acts as the security", "Tenure up to 7 years", "Covers medical & hospital equipment"],
    idealFor: ["Manufacturers adding capacity", "Upgrading to CNC / automated lines", "Hospitals & clinics buying equipment", "Print, packaging & textile units"],
    collateral: "Hypothecation of the machinery purchased", processing: "1%–1.5% + GST",
    faqs: [{ q: "Do I need a quotation?", a: "Yes — a proforma invoice from the supplier is needed to sanction and disburse directly to the vendor." }, { q: "Is used machinery financed?", a: "Some lenders fund used machinery after a valuation, usually at a lower loan-to-value." }],
  },
  commercial: {
    tagline: "Buy or build the shop, office or warehouse your business deserves.",
    highlights: ["Up to 75% of property value", "Tenure up to 10 years", "Rates from 10.25% p.a.", "Rental income can count towards eligibility"],
    idealFor: ["Moving from rented to owned premises", "Opening a showroom", "Buying a warehouse", "Professionals buying a clinic or office"],
    collateral: "The commercial property being purchased", processing: "0.5%–1% + GST",
    faqs: [{ q: "Is the down payment higher than a home loan?", a: "Usually yes — expect to fund 25–35% yourself for commercial property." }],
  },
  bill: {
    tagline: "Turn unpaid invoices into cash today instead of waiting 90 days.",
    highlights: ["Funding against approved invoices", "Up to 90% of invoice value", "Tenure 30–180 days", "No property collateral"],
    idealFor: ["Suppliers to large corporates", "Businesses with long credit cycles", "Exporters awaiting payment", "Fast-growing B2B firms"],
    collateral: "The invoice / receivable itself", processing: "Discount rate + small fee per invoice",
    faqs: [{ q: "Does my buyer need to agree?", a: "For most bill discounting your buyer acknowledges the invoice; TReDS platforms make this digital." }],
  },
  lc: {
    tagline: "Assure your suppliers of payment and negotiate better terms.",
    highlights: ["Import and inland LCs", "Usance and sight LCs", "Backed by margin money or limits", "Faster supplier onboarding"],
    idealFor: ["Importers of raw material", "Traders buying from new suppliers", "Manufacturers with large orders"],
    collateral: "Margin money / existing working-capital limits", processing: "Commission based on LC value & tenor",
    faqs: [{ q: "Is an LC a loan?", a: "It's a bank guarantee of payment to your supplier. It becomes a loan only if you don't pay on the due date." }],
  },
  professional: {
    tagline: "For doctors, CAs and architects — set up or grow your practice.",
    highlights: ["Up to ₹75 L without collateral", "Eligibility based on degree & practice years", "Tenure up to 6 years", "Quick approval for registered professionals"],
    idealFor: ["Opening a clinic or office", "Buying equipment", "Renovating your practice", "Working capital for a firm"],
    collateral: "Not required", processing: "1%–2% + GST",
    faqs: [{ q: "Who qualifies?", a: "Doctors, dentists, CAs, CS and architects with a valid registration and usually 2+ years of practice." }],
  },
  personal: {
    tagline: "Instant funds for life's plans — no collateral, minimal paperwork.",
    highlights: ["Up to ₹40 L", "Disbursal in 24–48 hours", "Tenure 12–72 months", "Fixed EMIs, no hidden charges"],
    idealFor: ["Weddings", "Medical emergencies", "Travel", "Home renovation"],
    collateral: "Not required", processing: "0.5%–2.5% + GST",
    faqs: [{ q: "What salary do I need?", a: "Most lenders need ₹25,000+ monthly in-hand income and 1+ year in the current job." }],
  },
  home: {
    tagline: "Own your home with low rates and tenures up to 30 years.",
    highlights: ["Rates from 8.4% p.a.", "Up to 90% of property value", "Tax benefits under Sec 80C & 24(b)", "Balance transfer & top-up options"],
    idealFor: ["Buying a ready or under-construction home", "Building on your own plot", "Renovation & extension", "Moving your loan to a lower rate"],
    collateral: "The property being purchased", processing: "Up to 0.5% + GST",
    faqs: [{ q: "How much home loan can I get?", a: "Typically EMIs up to 50–60% of take-home income, and up to 75–90% of the property value." }],
  },
  auto: {
    tagline: "Drive home your new or used car with up to 100% on-road funding.",
    highlights: ["Up to 100% of on-road price on select models", "Tenure up to 7 years", "Used cars up to 10 years old", "Quick approval at the dealer"],
    idealFor: ["First car purchase", "Upgrading your car", "Commercial vehicles for business"],
    collateral: "Hypothecation of the vehicle", processing: "Flat fee ₹3,000–₹10,000",
    faqs: [{ q: "Can self-employed people get car loans?", a: "Yes — with 2 years of ITR and bank statements." }],
  },
  education: {
    tagline: "Study in India or abroad — tuition, living and travel covered.",
    highlights: ["Up to ₹1.5 Cr for abroad studies", "Moratorium during the course", "Tax benefit under Sec 80E", "Collateral-free up to ₹50 L at select lenders"],
    idealFor: ["Master's abroad", "Medical & engineering courses", "Executive MBA"],
    collateral: "Required above unsecured limits", processing: "0%–1% + GST",
    faqs: [{ q: "Who repays during the course?", a: "Repayment starts after the course + a grace period; interest may be serviced by the co-applicant during studies." }],
  },
  security: {
    tagline: "Pledge shares, mutual funds or bonds — keep your investments working.",
    highlights: ["Up to 50–80% of the security's value", "Interest only on amount used", "No need to sell investments", "Fully digital pledge"],
    idealFor: ["Short-term liquidity needs", "Avoiding capital-gains tax from selling", "Bridge finance"],
    collateral: "Pledged shares / mutual funds / bonds", processing: "Flat fee from ₹999",
    faqs: [{ q: "What if markets fall?", a: "If the value drops below the margin, you'll be asked to add securities or repay part of the loan." }],
  },
}

export const SEGMENT_ELIGIBILITY: Record<ApplicantType, string[]> = {
  business: ["Business running for 2+ years (1 year with select NBFCs)", "Annual turnover of ₹20 L or more", "ITR filed for the last 2 years", "Promoter CIBIL score of 650+", "GST registration preferred"],
  individual: ["Age 21–60 years (65 for self-employed)", "Net monthly income of ₹25,000+", "1+ year in current job / 2+ years in business", "CIBIL score of 700+ for best rates", "Indian resident with valid KYC"],
}
