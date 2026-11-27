/* ==========================================================
   Narrative intake — turns what a customer SAYS or WRITES
   ("mujhe 50 lakh ka loan chahiye, business 6 saal purana hai,
   turnover 3 crore…") into a structured credit profile.
   Rule-based and offline; handles English, Hinglish and
   spoken number words.
   ========================================================== */
import { productById, type ApplicantType } from "./data"
import type { Profile } from "./scoring"
import { devanagariToHinglish } from "./use-speech"

/* ---------- spoken numbers → digits ---------- */
const EN_UNITS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
}
const EN_TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 }
const HI_NUM: Record<string, number> = {
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4, paanch: 5, panch: 5, chhe: 6, chhah: 6, saat: 7, aath: 8, nau: 9, das: 10,
  gyarah: 11, barah: 12, pandrah: 15, bees: 20, pachees: 25, pachchis: 25, tees: 30, chalees: 40, chalis: 40, pachaas: 50, pachas: 50,
  sattar: 70, assi: 80, nabbe: 90, sau: 100, dedh: 1.5, dhai: 2.5, dhaai: 2.5, adhai: 2.5, sava: 1.25,
}
const UNIT_AFTER = "(?=\\s*(?:crores?|cr|karod|karor|lakhs?|lacs?|lac|thousand|hazaa?r|years?|yrs?|saal|sal|varsh|months?|mahine|mahina|percent|%|emi|rupees|rupaye))"

function wordsToNumber(phrase: string): number | null {
  const t = phrase.toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean)
  const total = 0
  let cur = 0, seen = false, frac = 0
  for (let i = 0; i < t.length; i++) {
    const w = t[i]
    if (w === "and" || w === "a") continue
    if (w === "half") { frac = 0.5; seen = true; continue }
    if (w === "point" && i + 1 < t.length && EN_UNITS[t[i + 1]] != null) { cur += EN_UNITS[t[i + 1]] / 10; i++; seen = true; continue }
    if (EN_UNITS[w] != null) { cur += EN_UNITS[w]; seen = true }
    else if (EN_TENS[w] != null) { cur += EN_TENS[w]; seen = true }
    else if (HI_NUM[w] != null) { cur += HI_NUM[w]; seen = true }
    else if (w === "hundred") { cur = (cur || 1) * 100; seen = true }
    else return null
  }
  return seen ? total + cur + frac : null
}

/** Normalise speech/Hindi: Devanagari + number words → digits, unit synonyms → standard units */
export function normaliseSpoken(input: string): string {
  let s = " " + devanagariToHinglish(input).replace(/\r/g, "") + " "
  const words = [...Object.keys(EN_UNITS), ...Object.keys(EN_TENS), ...Object.keys(HI_NUM), "hundred", "half", "point", "and", "a"]
  const wordRe = new RegExp(`\\b((?:(?:${words.join("|")})[\\s-]+){0,4}(?:${[...Object.keys(EN_UNITS), ...Object.keys(EN_TENS), ...Object.keys(HI_NUM), "hundred", "half"].join("|")}))\\b${UNIT_AFTER}`, "gi")
  s = s.replace(wordRe, (m) => {
    const n = wordsToNumber(m)
    return n == null ? m : String(n)
  })
  // "1 and a half crore" / "2.5" spoken as "2 point 5" are handled above; unit synonyms:
  s = s
    .replace(/\b(karod|karor|crores?)\b/gi, "crore")
    .replace(/\b(hazaa?r)\b/gi, "thousand")
    .replace(/\b(saal|sal|varsh)\b/gi, "years")
    .replace(/\b(mahine|mahina)\b/gi, "months")
    .replace(/\b(rupaye|rupay|rupees|rs\.?|inr)\b/gi, "₹")
    .replace(/(\d)\s*(lacs?|lac)\b/gi, "$1 lakh")
  return s.trim()
}

/* ---------- amounts ---------- */
const UNIT = "(?:crore|cr|lakhs?|l|k|thousand)"
const AMT = `(₹?\\s*\\d[\\d,]*(?:\\.\\d+)?\\s*(?:${UNIT}\\b)?(?:\\s*\\d[\\d,]*(?:\\.\\d+)?\\s*(?:lakhs?|thousand)\\b)?)`

export function parseAmount(s: string | null | undefined): number | null {
  if (!s) return null
  const parts = [...String(s).toLowerCase().replace(/₹/g, "").matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(crore|cr|lakhs?|l|k|thousand)?\b/g)]
  if (!parts.length) return null
  let total = 0
  for (const [, num, unit = ""] of parts) {
    let n = parseFloat(num.replace(/,/g, ""))
    if (/^cr/.test(unit)) n *= 1e7
    else if (/^(lakh|l)/.test(unit)) n *= 1e5
    else if (/^(k|thousand)/.test(unit)) n *= 1e3
    total += n
  }
  return total
}

interface Hit { v: number; raw: string; ctx: string }
const lineCtx = (text: string, start: number, len: number) => {
  const ls = text.lastIndexOf("\n", start) + 1
  let le = text.indexOf("\n", start + len); if (le < 0) le = text.length
  return text.slice(Math.max(ls, start - 25), Math.min(le, start + len + 25))
}
/** label … amount ("turnover is 3 crore") */
function amountAfter(text: string, labels: string[], gap = 40): Hit | null {
  for (const lab of labels) {
    const m = new RegExp(`(?:${lab})[^\\d₹\\n.]{0,${gap}}?${AMT}`, "i").exec(text)
    if (m) { const v = parseAmount(m[1]); if (v != null && v >= 1000) return { v, raw: m[0].trim(), ctx: lineCtx(text, m.index, m[0].length) } }
  }
  return null
}
/** amount … label ("3 crore ka turnover", "50 lakh loan") */
function amountBefore(text: string, labels: string[], gap = 22): Hit | null {
  for (const lab of labels) {
    const m = new RegExp(`${AMT}[^\\d\\n.]{0,${gap}}?(?:${lab})`, "i").exec(text)
    if (m) { const v = parseAmount(m[1]); if (v != null && v >= 1000) return { v, raw: m[0].trim(), ctx: lineCtx(text, m.index, m[0].length) } }
  }
  return null
}
const first = <T,>(...xs: (T | null)[]) => xs.find((x) => x != null) ?? null
const MONTHLY = /month|per\s*m\b|\/\s*m\b|p\.?m\b|monthly|mahin/i
const num = (re: RegExp, t: string) => { const m = t.match(re); return m ? { v: parseFloat(m[1]), raw: m[0].trim() } : null }

export interface Parsed { profile: Profile & { docs: string[]; assumed: Record<string, boolean> }; found: Record<string, string>; text: string }

export function parseNarrative(input: string): Parsed {
  const year = new Date().getFullYear()
  const text = "\n" + normaliseSpoken(input) + "\n"
  const low = text.toLowerCase()
  const p: Parsed["profile"] = { assumed: {}, docs: [] }
  const found: Record<string, string> = {}

  /* applicant type */
  const bizHits = (low.match(/\b(business|turnover|gstin?|udyam|msme|pvt\.?\s*ltd|private limited|proprietor(ship)?|partnership|llp|firm|company|factory|shop|dukaan|dhandha|vyapar|trading|manufactur\w*|distribut\w*|net profit|sales|revenue|clinic)\b/g) || []).length
  const salHits = (low.match(/\b(salary|salaried|naukri|job|employer|in-?hand|ctc|working (at|with|in))\b/g) || []).length
  p.type = bizHits >= 2 || (bizHits >= 1 && salHits === 0 && /turnover|sales|revenue/.test(low)) ? "business" : "individual"
  const isBiz = p.type === "business"

  /* name */
  const nm = text.match(/\b(?:[Mm]y name is|[Mm]era naam|[Nn]ame\s*[:\-–]|I am|[Tt]his is|[Mm]ain)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/)
  if (nm && !/^(Looking|From|Running|Doing|Planning|Interested)$/.test(nm[1].split(" ")[0])) { p.name = nm[1].replace(/\s+(hai|hoon|hun|and|from)$/i, ""); found.name = nm[0] }
  const bn = text.match(/\b(?:business|company|firm|shop)\s*(?:name)?\s*(?:is|called|named|ka naam|[:\-–])\s*([A-Z][\w&.]*(?:\s+[A-Z][\w&.]*){0,4})/)
  if (bn) { p.businessName = bn[1]; found.businessName = bn[0] }
  const city = text.match(/\b(?:based in|located in|from|in the city of|city\s*[:\-–])\s+([A-Z][a-z]{2,})/)
  if (city && !/^(The|My|Our|Last|Next|Bank|India)$/.test(city[1])) { p.city = city[1]; found.city = city[0] }

  /* industry hint */
  const ind = low.match(/\b(manufactur\w*|trading|retail|wholesale|distribut\w*|restaurant|hotel|clinic|hospital|pharma\w*|textile\w*|garment\w*|construction|transport\w*|logistics|software|it services|kirana|dairy|agri\w*|export\w*|import\w*)\b/)
  if (ind) { p.industry = ind[1][0].toUpperCase() + ind[1].slice(1); found.industry = ind[0] }

  /* age (individuals) */
  const age = num(/\b(?:age\s*(?:is)?\s*[:\-–]?\s*|i am\s+|main\s+)(\d{2})\s*(?:years?\s*old|years?\b|ka|ki)?/i, text)
  if (age && age.v >= 18 && age.v <= 75 && !/business|company|firm/i.test(age.raw)) { p.age = age.v; found.age = age.raw }

  /* employment */
  if (!isBiz) {
    if (/\b(doctor|dr\.|chartered accountant|\bca\b|architect|dentist|lawyer|advocate)\b/i.test(text)) p.employment = "professional"
    else if (/\b(salaried|salary|naukri|employee|employer|working (at|with|in)|ctc)\b/i.test(text)) p.employment = "salaried"
    else if (/\b(self[- ]employed|freelanc\w*)\b/i.test(text)) p.employment = "self-employed"
  } else p.employment = "business"

  /* business vintage */
  const vin = first(
    num(/\b(?:business|company|firm|shop|dukaan|factory|unit|we|i)\b[^.\n\d]{0,40}?(\d+(?:\.\d+)?)\s*(?:\+\s*)?years?\s*(?:old|purana|purani|se|now|running|in business)/i, text),
    num(/\b(?:running|operating|in business|doing business|established|started|chal raha|chala rahe)\b[^.\n\d]{0,25}?(?:for|since|from)?\s*(?:last|past)?\s*(\d+(?:\.\d+)?)\s*years?/i, text),
    num(/\b(\d+(?:\.\d+)?)\s*years?\s*(?:old\s*)?(?:business|company|firm|vintage|in business|of business|purana|purani)/i, text),
    num(/\b(?:vintage|business age)\s*(?:is|of)?\s*[:\-–]?\s*(\d+(?:\.\d+)?)/i, text),
  )
  const sinceYear = text.match(/\b(?:since|established in|started in|incorporated in|registered in|from)\s+((?:19|20)\d{2})\b/i)
  if (vin) { p.vintageYears = vin.v; found.vintageYears = vin.raw }
  else if (sinceYear) { p.vintageYears = Math.max(0, year - parseInt(sinceYear[1])); found.vintageYears = sinceYear[0] }

  /* work experience (individuals) */
  if (!isBiz) {
    const ex = first(
      num(/(\d+(?:\.\d+)?)\s*\+?\s*years?\s*(?:of\s+)?(?:total\s+)?(?:work\s+)?(?:experience|exp\b|in (?:my|this|current) job|naukri)/i, text),
      num(/(?:experience|working)\s*(?:of|for|since)?\s*[:\-–]?\s*(\d+(?:\.\d+)?)\s*years?/i, text),
    )
    if (ex) { p.experienceYears = ex.v; found.experienceYears = ex.raw }
    else if (p.vintageYears != null) { p.experienceYears = p.vintageYears; found.experienceYears = found.vintageYears }
  }

  /* turnover */
  const to = first(
    amountAfter(text, ["annual\\s*(?:turnover|revenue|sales)", "yearly\\s*(?:turnover|revenue|sales)", "turnover", "revenue", "sales", "business of"]),
    amountBefore(text, ["turnover", "revenue", "(?:annual|yearly)?\\s*sales", "ka business", "ki sales", "business per year"]),
  )
  if (to) {
    p.annualTurnover = to.v; found.annualTurnover = to.raw
    if (MONTHLY.test(to.ctx)) { p.annualTurnover = to.v * 12; found.annualTurnover += " (×12)" }
  }

  /* profit */
  const np = first(
    amountAfter(text, ["net\\s*profit", "profit\\s*after\\s*tax", "\\bpat\\b", "profit", "munafa", "kamai", "margin of"]),
    amountBefore(text, ["(?:net\\s*)?profit", "munafa", "kamai", "bachat"]),
  )
  if (np) {
    p.netProfit = np.v; found.netProfit = np.raw
    if (MONTHLY.test(np.ctx)) { p.netProfit = np.v * 12; found.netProfit += " (×12)" }
  }
  if (p.netProfit && p.annualTurnover && p.netProfit > p.annualTurnover) { delete p.netProfit; delete found.netProfit }
  const pm = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:net\s*)?(?:profit|margin)/i)
  if (!p.netProfit && pm && p.annualTurnover) { p.netProfit = (p.annualTurnover * parseFloat(pm[1])) / 100; found.netProfit = pm[0] }

  /* income (individuals) */
  if (!isBiz) {
    const inc = first(
      amountAfter(text, ["monthly\\s*(?:net\\s*)?(?:income|salary)", "net\\s*salary", "in[- ]?hand", "take[- ]?home", "salary", "income", "earn(?:ing)?s?"]),
      amountBefore(text, ["(?:per|a|every)\\s*month", "monthly", "salary", "income"]),
    )
    if (inc) {
      // monthly unless it's clearly a yearly figure (don't trip on "5 years experience" nearby)
      const annual = !MONTHLY.test(inc.ctx) && /\b(annual|yearly|per annum|p\.?a\.?|lpa|ctc|package|a year|per year)\b/i.test(inc.ctx)
      p.monthlyIncome = annual ? Math.round((inc.v * (/ctc|package|lpa/i.test(inc.ctx) ? 0.8 : 1)) / 12) : inc.v
      if (!annual && p.monthlyIncome > 1000000) p.monthlyIncome = Math.round(p.monthlyIncome / 12)
      found.monthlyIncome = inc.raw + (annual ? " (÷12)" : "")
    } else if (p.netProfit) { p.monthlyIncome = Math.round(p.netProfit / 12); found.monthlyIncome = found.netProfit + " (÷12)" }
  }

  /* loan requirement */
  const la = first(
    amountAfter(text, ["loan\\s*(?:amount|of|for|required|requirement|needed|need)", "need\\s*(?:a\\s*)?(?:[a-z]+\\s*){0,2}?loan\\s*(?:of)?", "looking\\s*for\\s*(?:a\\s*)?(?:[a-z]+\\s*){0,2}?(?:loan\\s*of)?", "require\\w*\\s*(?:a\\s*)?(?:loan\\s*of)?", "funding\\s*(?:of|required|need)?", "want\\s*(?:a\\s*)?(?:loan\\s*of)?", "apply\\w*\\s*for"], 25),
    amountBefore(text, ["(?:ka|ki|ke)?\\s*(?:[a-z]+\\s*)?loan", "(?:of\\s*)?funding", "chahiye"]),
  )
  if (la) { p.loanAmount = la.v; found.loanAmount = la.raw }

  /* tenure */
  const tn = text.match(/(?:tenure|tenor|repay\w*|duration|for a period of|emi for|over|ke liye)\s*(?:of|in|period|for|is)?\s*[:\-–]?\s*(\d+)\s*(years?|months?)/i)
    ?? text.match(/(\d+)\s*(years?|months?)\s*(?:ke liye|tenure|for repayment|repayment|loan tenure)/i)
  if (tn) { p.tenureMonths = /month/i.test(tn[2]) ? parseInt(tn[1]) : parseInt(tn[1]) * 12; found.tenureMonths = tn[0].trim() }

  /* existing EMIs */
  if (/\b(no\s+(?:existing\s+|running\s+|current\s+|other\s+)?(?:emis?|loans?)|koi\s+(?:emi|loan)\s+nahi|nil\s+emi|debt[- ]free|without any loan|zero emi)\b/i.test(text)) { p.existingEmi = 0; found.existingEmi = "No existing EMIs" }
  else {
    const e = first(
      amountAfter(text, ["(?:existing|current|running|ongoing|total|monthly|other)\\s*emis?", "emis?\\s*(?:of|is|are|paid|paying|outgo|obligation)", "paying\\s*(?:an?\\s*)?emis?\\s*(?:of)?", "emi\\s*[:\\-–]"], 20),
      amountBefore(text, ["(?:ki|ka)?\\s*emis?\\b", "per month (?:emi|installment)", "monthly emi"]),
    )
    if (e) { p.existingEmi = e.v; found.existingEmi = e.raw }
  }

  /* credit score */
  if (/\b(no credit history|new to credit|\bntc\b|never taken (?:a |any )?loan|no cibil)\b/i.test(text)) { p.newToCredit = true; found.creditScore = "New to credit" }
  else {
    const cs = num(/(?:cibil|credit\s*score|crif|experian|equifax|bureau\s*score|score)\D{0,15}?(\d{3})\b/i, text)
    if (cs && cs.v >= 300 && cs.v <= 900) { p.creditScore = cs.v; found.creditScore = cs.raw }
  }

  /* GST / ITR */
  if (/\b(not\s+gst\s+registered|no\s+gst|gst\s*(?:registration)?\s*(?:is\s*)?(?:nahi|not|no)\b|without\s+gst|gst\s+nahi|unregistered)/i.test(text)) { p.gst = false; found.gst = "Not GST registered" }
  else if (/\bgst(?:in)?\b/i.test(text)) { p.gst = true; found.gst = (text.match(/[^\n.]{0,20}gst(?:in)?[^\n.]{0,25}/i) || ["GST"])[0].trim() }
  if (/\b(itr\s*(?:not\s+filed|nahi|[:\-–]\s*(?:no|nil|none))|no\s+itr|not\s+filed\s+(?:any\s+)?itr)/i.test(text)) { p.itrYears = 0; found.itrYears = "ITR not filed" }
  else {
    const itr = first(num(/(\d+)\s*years?\s*(?:of\s+)?(?:itr|income tax returns?)/i, text), num(/itrs?[^\d\n]{0,25}?(\d)\s*years?/i, text))
    if (itr && itr.v < 30) { p.itrYears = itr.v; found.itrYears = itr.raw }
    else if (/\b(itr|income tax return)/i.test(text)) { p.itrYears = 2; found.itrYears = "ITR filed (assumed 2 yrs)" }
  }

  /* behaviour — strip "in the last 6 months" so the 6 isn't read as a count */
  const ctext = text.replace(/(?:in\s+|during\s+|over\s+)?(?:the\s+)?(?:last|past|previous|pichhle)\s+\d+\s*(?:months?|years?|days?)/gi, " ")
  if (/\b(no\s+(?:late|missed|delayed)\s+(?:payments?|emis?)|never\s+(?:missed|delayed)|always\s+(?:paid|pay)\s+on\s+time|on[- ]time payments?|no\s+delays?)\b/i.test(text)) { p.latePayments = 0; found.latePayments = "Pays on time" }
  else {
    const lp = first(num(/(\d+)\s*(?:late|missed|delayed|overdue)\s*(?:emi\s*)?(?:payments?|emis?)/i, ctext), num(/missed\s*(\d+)\s*(?:emis?|payments?)/i, ctext), num(/(?:late|missed|delayed)\s*(?:emi\s*)?(?:payments?|emis?)\D{0,15}(\d+)/i, ctext))
    if (lp && lp.v < 50) { p.latePayments = lp.v; found.latePayments = lp.raw }
    else if (/\b(missed|late|delayed)\s+(?:an?\s+|one\s+)?(?:emi|payment)/i.test(text)) { p.latePayments = 1; found.latePayments = "One delay mentioned" }
  }
  if (/\bno\s+(?:cheque\s+|emi\s+)?bounces?/i.test(text)) { p.chequeBounces = 0; found.chequeBounces = "No bounces" }
  else {
    const cb = first(num(/(\d+)\s*(?:cheques?|checks?|emis?|ecs|nach)?\s*(?:bounces?|bounced|returns?|dishono)/i, ctext), num(/(?:bounces?|bounced\s*cheques?)\D{0,15}(\d+)/i, ctext))
    if (cb && cb.v < 50) { p.chequeBounces = cb.v; found.chequeBounces = cb.raw }
  }
  const enq = first(num(/(?:applied|apply)\s*(?:for\s*(?:a\s*)?loans?\s*)?(?:at|with|in)?\s*(\d+)\s*(?:banks?|lenders?|places|nbfcs?)/i, ctext), num(/(\d+)\s*(?:loan\s*)?(?:enquir(?:y|ies)|inquir(?:y|ies)|applications?)/i, ctext))
  if (enq && enq.v < 50) { p.enquiries = enq.v; found.enquiries = enq.raw }

  const col = first(amountAfter(text, ["property\\s*(?:worth|value|of)", "collateral\\s*(?:of|worth|value)?", "(?:shop|office|factory|house|flat)\\s*(?:worth|value)"]), amountBefore(text, ["(?:ki|ka)?\\s*property"]))
  if (col) { p.collateral = col.v; found.collateral = col.raw }

  /* product */
  const prodMap: [string, RegExp][] = [
    ["machinery", /machin\w*|equipment|cnc|plant/i], ["lap", /loan\s*against\s*property|\blap\b|mortgage|property\s*(?:pe|par|against)/i],
    ["od", /overdraft|\bod\b|cc\s*limit|cash\s*credit|working\s*capital\s*limit/i], ["bill", /bill\s*discount|invoice\s*discount/i],
    ["home", /home\s*loan|housing\s*loan|(?:buy|buying|purchase)\s*(?:a\s*)?(?:flat|house|home|ghar)/i], ["auto", /car\s*loan|auto\s*loan|vehicle|gaadi|truck/i],
    ["education", /education|study|college|abroad|padhai/i], ["commercial", /commercial\s*(?:loan|property)|(?:buy|purchase)\s*(?:a\s*)?(?:shop|office)/i],
    ["professional", /professional\s*loan|clinic|practice/i], ["personal", /personal\s*loan|wedding|shaadi|marriage|medical|travel/i],
    ["business", /business\s*loan|working\s*capital|expan\w*|inventory|stock|raw material|new branch|new outlet/i],
  ]
  // look at "requirement" clauses first, skipping clauses about loans they already pay EMIs on
  const reqText = text.split(/[\n.,;]/).filter((l) => /(need|looking for|require|want|apply|chahiye|loan|funding|purpose|for)/i.test(l) && !/existing|running|current|paying|\bemis?\b/i.test(l)).join("\n")
  for (const src of [reqText, text]) {
    for (const [id, re] of prodMap) { if (re.test(src)) { p.product = id; break } }
    if (p.product) break
  }
  if (p.product && productById(p.product).seg !== p.type) p.product = p.type === "business" ? "business" : "personal"
  if (p.product) found.product = productById(p.product).name

  /* docs mentioned */
  const docMap: [string, RegExp][] = isBiz
    ? [["pan", /\bpan\b/i], ["kyc", /aadhaar|aadhar|kyc/i], ["gst", /gst\s*(?:returns?|filed|gstr)|gstr/i], ["bank", /bank\s*statements?/i], ["itr", /\bitr\b|audited|balance\s*sheet|financials/i], ["udyam", /udyam|msme\s*(?:cert|registration)/i]]
    : [["pan", /\bpan\b/i], ["aadhaar", /aadhaar|aadhar/i], ["salary", /salary\s*slips?|pay\s*slips?/i], ["bank", /bank\s*statements?/i], ["form16", /form\s*16|\bitr\b/i]]
  docMap.forEach(([id, re]) => { if (re.test(text)) p.docs.push(id) })

  return { profile: p, found, text: text.trim() }
}

/* ---------- "what we understood" checklist ---------- */
export interface Fact { key: string; label: string; value: string | null; ask: string; important: boolean }

export function understoodFacts(parsed: Parsed, fmt: (n: number) => string): Fact[] {
  const p = parsed.profile
  const isBiz = (p.type as ApplicantType) === "business"
  const yrs = (n?: number | null) => (n == null ? null : `${n} year${n === 1 ? "" : "s"}`)
  const facts: Fact[] = [
    { key: "loanAmount", label: "Loan Needed", value: p.loanAmount ? fmt(p.loanAmount) : null, ask: "How much loan do you need?", important: true },
    { key: "product", label: "Loan Type", value: p.product ? productById(p.product).name : null, ask: "What is the loan for? (machinery, working capital, home…)", important: false },
  ]
  if (isBiz) {
    facts.push(
      { key: "vintageYears", label: "Business Age", value: yrs(p.vintageYears), ask: "How many years old is your business?", important: true },
      { key: "annualTurnover", label: "Yearly Turnover", value: p.annualTurnover ? fmt(p.annualTurnover) : null, ask: "What is your yearly turnover?", important: true },
      { key: "netProfit", label: "Net Profit", value: p.netProfit ? fmt(p.netProfit) : null, ask: "Roughly how much profit do you make in a year?", important: true },
      { key: "gst", label: "GST", value: p.gst == null ? null : p.gst ? "Registered" : "Not Registered", ask: "Is your business GST registered?", important: false },
      { key: "itrYears", label: "ITR Filed", value: p.itrYears == null ? null : `${p.itrYears} Years`, ask: "For how many years have you filed ITR?", important: false },
    )
  } else {
    facts.push(
      { key: "monthlyIncome", label: "Monthly Income", value: p.monthlyIncome ? fmt(p.monthlyIncome) : null, ask: "What is your monthly in-hand income?", important: true },
      { key: "experienceYears", label: "Work Experience", value: yrs(p.experienceYears), ask: "How many years have you been working?", important: true },
    )
  }
  facts.push(
    { key: "existingEmi", label: "Existing EMIs", value: p.existingEmi == null ? null : p.existingEmi === 0 ? "None" : `${fmt(p.existingEmi)}/month`, ask: "Do you pay any EMIs right now? How much per month?", important: true },
    { key: "creditScore", label: "Credit Score", value: p.newToCredit ? "New To Credit" : p.creditScore ? String(p.creditScore) : null, ask: "Do you know your CIBIL score?", important: false },
    { key: "tenureMonths", label: "Tenure", value: p.tenureMonths ? `${p.tenureMonths} Months` : null, ask: "In how many years do you want to repay?", important: false },
  )
  return facts
}
