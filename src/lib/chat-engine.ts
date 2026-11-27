/* ==========================================================
   Flo — FundenFlo AI assistant engine (demo, rule-based, offline)
   Understands English & Hindi. Returns HTML built
   only from our own strings; user text is always escaped.
   ========================================================== */
import { DOCS, PRODUCTS, emi, inr, principalFromEmi } from "./data"
import type { SavedOffer, SavedResult } from "./store"
import { devanagariToHinglish } from "./use-speech"

export interface BotReply { html: string; chips?: string[] }
export interface ChatContext { result: SavedResult | null; offer: SavedOffer | null }

export const DEFAULT_CHIPS = ["Check my eligibility", "EMI for 10 lakh, 5 years", "Documents for business loan", "How to improve CIBIL?", "Interest rates", "Talk to an advisor"]

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

const isHindi = (raw: string, t: string) =>
  /[\u0900-\u097F]/.test(raw) ||
  /\b(hai|kya|kaise|kitna|kitni|kitne|chahiye|mujhe|mera|meri|nahi|karna|kar|batao|bataiye|kyu|kyon|kab|ho\s*sakta|milega|mil\s*sakta|saal|mahina|wala|yaar|bhai|ji|namaste|namaskar|shukriya|dhanyawad)\b/i.test(t)

function amountIn(t: string) {
  const m = t.match(/(\d[\d,]*(?:\.\d+)?)\s*(crores?|cr|lakhs?|lacs?|lac|l|k|thousand|hazar|hazaar)?\b/i)
  if (!m) return null
  let n = parseFloat(m[1].replace(/,/g, ""))
  const u = (m[2] || "").toLowerCase()
  if (/^cr/.test(u)) n *= 1e7
  else if (/^(lakh|lac|l)/.test(u)) n *= 1e5
  else if (/^(k|thousand|hazar)/.test(u)) n *= 1e3
  return n
}
function monthsIn(t: string) {
  const m = t.match(/(\d+)\s*(years?|yrs?|saal|sal|months?|mahine|mahina)/i)
  if (!m) return null
  return /month|mahin/i.test(m[2]) ? parseInt(m[1]) : parseInt(m[1]) * 12
}
const rateIn = (t: string) => { const m = t.match(/(\d+(?:\.\d+)?)\s*(%|percent|pc)/i); return m ? parseFloat(m[1]) : null }

const card = (inner: string) => `<div class="mt-2 rounded-lg bg-subtle p-2.5 text-[13px] leading-relaxed">${inner}</div>`
const btn = (label: string, href: string) =>
  `<div class="mt-2.5"><button data-nav="${href}" class="inline-flex h-8 items-center gap-1.5 rounded-lg bg-navy px-3 text-xs font-semibold text-white hover:bg-navy-pressed">${label} →</button></div>`
const note = (s: string) => `<div class="mt-1.5 text-xs text-muted-foreground">${s}</div>`
const list = (items: string[]) => `<ul class="mt-1.5 list-disc space-y-0.5 pl-5">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`

export function greeting(ctx: ChatContext): BotReply {
  let extra = ""
  if (ctx.result?.summary) extra = card(`Your last FundenFlo Score: <b>${ctx.result.summary.score}</b> (${esc(ctx.result.summary.grade)}). Ask me <i>"why is my score low?"</i>`)
  return { html: `Hi! I'm <b>Flo</b>, your FundenFlo loan assistant 👋<br/>I can check eligibility, calculate EMI, list documents and explain your score — in English or Hindi.${extra}` }
}

export function reply(raw: string, ctx: ChatContext): BotReply {
  const t = devanagariToHinglish(raw).toLowerCase()
  const hi = isHindi(raw, t)
  const has = (re: RegExp) => re.test(t)

  if (has(/^(hi+|hello|hey|namaste|namaskar|hola|good (morning|evening|afternoon))\b/))
    return {
      html: hi
        ? "नमस्ते! 🙏 बताइए, आपको <b>बिज़नेस लोन</b> चाहिए या <b>पर्सनल लोन</b>? मैं पात्रता (eligibility), ईएमआई और ज़रूरी दस्तावेज़ सब बता सकता हूँ।"
        : "Hello! 👋 Are you looking for a <b>business / MSME</b> loan or a <b>personal</b> loan? I can help with eligibility, EMI and documents.",
      chips: ["Business loan", "Personal loan", "Home loan", "Check my eligibility"],
    }
  if (has(/thank|shukriya|dhanyawad|thx|great|awesome|nice/)) return { html: hi ? "आपका स्वागत है! 😊 कुछ और पूछना हो तो बताइए।" : "Happy to help! 😊 Anything else?" }

  /* my score / why low */
  if (has(/(my|mera|meri)\s*(score|result|report)|score\s*(kam|low|kyu|kyon|why)|why.*(score|low|reject)|reject/)) {
    const s = ctx.result?.summary
    if (s) {
      const top = s.topIssues?.length ? `<br/>${hi ? "स्कोर कम होने के मुख्य कारण:" : "Main reasons pulling it down:"}${list(s.topIssues.map(esc))}` : ""
      return { html: `Your FundenFlo Score is <b>${s.score}</b> (${esc(s.grade)}).${top}${btn("Open full report", "/result")}` }
    }
    return {
      html: (hi
        ? "अभी आपका कोई स्कोर नहीं है। 2 मिनट का फॉर्म भरें — AI आपका स्कोर और उसके कम होने के कारण दोनों बताएगा।"
        : "I don't have your score yet. Fill the 2-minute form and the AI will show your score and exactly why it's low.") + btn("Check my score", "/apply"),
    }
  }

  /* EMI */
  if (has(/\bemi\b|installment|instalment|kist|monthly payment/)) {
    const P = amountIn(t), n = monthsIn(t), r = rateIn(t)
    if (P && P >= 10000) {
      const months = n || 60, rate = r || 11
      const e = emi(P, rate, months), total = e * months
      return {
        html: `${hi ? "आपकी मासिक ईएमआई लगभग" : "Your EMI would be"} <b>${inr(e)}/month</b>.${card(`Loan ${inr(P, { short: true })} · ${rate}% p.a. · ${months} months<br/>Total interest: <b>${inr(total - P, { short: true })}</b> · Total payable: <b>${inr(total, { short: true })}</b>`)}${!r ? note('Assumed 11% rate — add a rate like "at 9.5%" to change it.') : ""}${btn("Open EMI calculator", "/tools")}`,
        chips: ["EMI for 25 lakh, 10 years at 9%", "Check my eligibility", "Interest rates"],
      }
    }
    return { html: hi ? 'ईएमआई जानने के लिए राशि और समय बताएं, जैसे: <i>"20 लाख का ईएमआई 5 साल के लिए"</i>।' : 'Tell me the amount and tenure, e.g. <i>"EMI for 20 lakh for 5 years at 10%"</i>.', chips: ["EMI for 5 lakh, 3 years", "EMI for 50 lakh, 15 years at 9%"] }
  }

  /* Eligibility */
  if (has(/eligib|kitna loan|how much loan|mil sakta|milega|qualify|can i get/)) {
    const inc = amountIn(t)
    if (inc && inc >= 5000 && has(/salary|income|kamata|kamati|earn|profit|month|mahina/)) {
      const maxEmi = inc * 0.5, p5 = principalFromEmi(maxEmi, 11, 60), p20 = principalFromEmi(maxEmi, 8.75, 240)
      return { html: `With ${inr(inc)}/month income (and no other EMIs):${card(`Personal / business loan (5 yrs @ 11%): up to <b>${inr(Math.min(p5, inc * 30), { short: true })}</b><br/>Home loan (20 yrs @ 8.75%): up to <b>${inr(p20, { short: true })}</b>`)}${note("Indicative. Credit score and existing EMIs change this.")}${btn("Get exact score in 2 min", "/apply")}` }
    }
    return {
      html: (hi ? "लोन पात्रता जाँचने के 2 आसान तरीके हैं:" : "Two quick ways to check eligibility:") +
        list([`<b>${hi ? "छोटा फॉर्म भरें" : "Fill a short form"}</b> — ${hi ? "2 मिनट में लाइव स्कोर देखें" : "2 min, score updates live"}`, `<b>${hi ? "मुझसे पूछें" : "Ask me"}</b> — ${hi ? "अपनी आय बताएं, मैं तुरंत अनुमान दूंगा" : "tell me your income for a quick estimate"}`]) +
        (hi ? 'या मुझे लिखें, जैसे: <i>"मेरी सैलरी 60,000 है, कितना लोन मिल सकता है?"</i>' : 'Or tell me, e.g. <i>"my salary is 60,000, how much loan can I get?"</i>') + btn("Start eligibility check", "/apply"),
      chips: ["My salary is 60,000 — how much loan?", "EMI for 10 lakh, 5 years", "Documents needed"],
    }
  }

  /* Smart (voice / text) assessment */
  if (has(/speak|voice|bol\s*kar|bolkar|likh\s*kar|in my own words|assessment|balance\s*sheet|verify|verification/))
    return {
      html: (hi
        ? "फॉर्म भरने की ज़रूरत नहीं! बस बोलकर या लिखकर बताएं — आपको कितना लोन चाहिए, बिज़नेस कितना पुराना है, और टर्नओवर कितना है। AI तुरंत आपका क्रेडिट मूल्यांकन तैयार करेगा और दस्तावेज़ अपलोड करने पर पॉइंट्स भी बढ़ाएगा।"
        : "No forms needed! Just speak or write — how much you need, how old your business is, your turnover. The AI builds a credit assessment instantly, then verifies it against your balance sheets and bank statements to add points.") + btn("Try Smart Assessment", "/assess"),
      chips: ["Documents for business loan", "How to improve CIBIL?", "Interest rates"],
    }

  /* Documents */
  if (has(/document|docs?\b|kagaz|kaagaz|papers?|kyc/)) {
    const biz = has(/business|msme|company|firm|gst|udyam/), ind = has(/personal|salaried|individual|home|car|job/)
    if (biz || !ind)
      return { html: `<b>${hi ? "बिज़नेस / MSME लोन के लिए ज़रूरी दस्तावेज़:" : "Documents for a Business / MSME loan:"}</b>${list(DOCS.business.map((d) => d.name + (d.req ? "" : ' <span class="text-muted-foreground">(if applicable)</span>')))}`, chips: ["Documents for personal loan", "Check my eligibility", "Apply now"] }
    return { html: `<b>${hi ? "पर्सनल / सैलरीड लोन के लिए ज़रूरी दस्तावेज़:" : "Documents for a personal / salaried loan:"}</b>${list(DOCS.individual.map((d) => d.name + (d.req ? "" : ' <span class="text-muted-foreground">(optional)</span>')))}`, chips: ["Documents for business loan", "Check my eligibility", "Apply now"] }
  }

  /* Credit score tips */
  if (has(/cibil|credit score|score|experian|crif|improve|badha|increase/))
    return {
      html: `<b>${hi ? "सिबिल स्कोर बढ़ाने के 6 तरीके:" : "6 ways to improve your credit score:"}</b>${list([
        "Pay every EMI & card bill on time — set auto-debit",
        "Keep credit-card usage below 30% of the limit",
        "Don't apply at many banks at once (each is a hard enquiry)",
        "Close or settle overdue accounts properly (get NOC)",
        "Keep old cards open — longer history helps",
        "Check your report for errors and raise disputes",
      ])}<div class="mt-1.5">${hi ? "अपना FundenFlo स्कोर जांचें — AI बताएगा कि कहाँ पॉइंट्स कम हो रहे हैं।" : "Check your FundenFlo Score — the AI shows exactly where you lose points."}</div>${btn("Find what's lowering my score", "/apply")}`,
    }

  if (has(/interest|rate|byaj|roi|sasta|cheapest|lowest/))
    return { html: `${hi ? "अनुमानित शुरुआती ब्याज दरें (वार्षिक):" : "Indicative starting rates (p.a.):"}${list(PRODUCTS.filter((p) => p.id !== "lc").map((p) => `${p.name}: <b>from ${p.rate}</b>`))}${note("Final rate depends on your score. 780+ gets the best rates.")}` }

  /* Specific products */
  const prodMatch = ([
    ["home", /home|house|flat|ghar|housing/], ["lap", /against property|\blap\b|mortgage/], ["od", /\bod\b|overdraft|cash credit|cc limit/],
    ["machinery", /machine/], ["bill", /bill|invoice/], ["auto", /\bcar\b|auto|vehicle|gaadi|gadi/], ["education", /education|study|college|abroad|padhai/],
    ["professional", /doctor|professional|clinic|\bca\b|architect/], ["commercial", /commercial|shop|dukaan|office/], ["security", /shares|mutual fund|securit/],
    ["lc", /letter of credit|\blc\b/], ["personal", /personal|wedding|shaadi|marriage|medical|travel/], ["business", /business|msme|working capital|vyapar|dhandha|startup|mudra/],
  ] as [string, RegExp][]).find(([, re]) => re.test(t))
  if (prodMatch) {
    const p = PRODUCTS.find((x) => x.id === prodMatch[0])!
    const who = p.seg === "business"
      ? hi ? "MSME, प्रोप्राइटर, पार्टनरशिप और कंपनियाँ आवेदन कर सकती हैं।" : "Open to proprietors, partnerships, LLPs and companies."
      : hi ? "सैलरीड और सेल्फ-एम्प्लॉयड दोनों आवेदन कर सकते हैं।" : "Salaried and self-employed can both apply."
    return {
      html: `<b>${p.name}</b> — ${p.desc}${card(`Rate from <b>${p.rate}</b> · Up to <b>${p.max}</b> · Tenure <b>${p.tenure}</b>`)}<div class="mt-1.5">${who}</div>${btn("Check eligibility", `/apply?type=${p.seg}&product=${p.id}`)}`,
      chips: [`Documents for ${p.seg === "business" ? "business" : "personal"} loan`, `EMI for ${p.seg === "business" ? "25 lakh, 5 years" : "10 lakh, 5 years"}`, "Interest rates"],
    }
  }

  if (has(/types?|kaunse|which loan|products?|services|options|kya kya/))
    return { html: "<b>Business / MSME:</b> Business Loan, LAP, OD/CC, Machinery, Commercial, Bill Discounting, LC<br/><b>Individual:</b> Home, Personal, Auto, Education, Professional, Loan against Securities", chips: ["Business loan", "Home loan", "Personal loan", "OD limit"] }

  if (has(/status|track|application|kab tak|update/)) {
    if (ctx.offer) return { html: `Your application with <b>${esc(ctx.offer.name)}</b> is <b>under lender review</b>. Expected decision: ${esc(ctx.offer.speed)}.${btn("Open dashboard", "/dashboard")}` }
    return { html: (hi ? "अभी कोई आवेदन सबमिट नहीं हुआ है।" : "You don't have a submitted application yet.") + btn("Start application", "/apply") }
  }

  if (has(/how long|kitne din|time|days|fast|jaldi|tat/))
    return { html: hi ? "पात्रता जांच 2 मिनट में, लोन ऑफ़र 48 घंटे में, और दस्तावेज़ पूरे होने पर 3–10 कार्यदिवसों में राशि जारी हो जाती है।" : "Eligibility in 2 minutes, matched offers within 48 hours, and disbursal typically in 3–10 working days once documents are complete." }
  if (has(/fee|charge|cost|paisa lagega|free/))
    return { html: hi ? "FundenFlo पर पात्रता और स्कोर जांच <b>पूरी तरह निःशुल्क</b> है। लेंडर की प्रोसेसिंग फीस (0.5%–2%) हर ऑफ़र में पहले से दिखाई जाती है — कोई छिपा हुआ शुल्क नहीं है।" : "Checking eligibility and your score on FundenFlo is <b>free</b>. Lender processing fees (0.5%–2%) are shown upfront in every offer — zero hidden fees." }

  if (has(/callback/)) return { html: "✅ Callback requested (demo). An advisor will reach out within 2 working hours." }
  if (has(/human|advisor|adviser|agent|call|talk|contact|baat|phone|whatsapp|email/))
    return {
      html: `${hi ? "हमारे लोन सलाहकार आपको कॉल करेंगे।" : "A FundenFlo loan advisor can call you back."}${card('📧 <span class="normal-case">grow@fundenflo.com</span><br/>🕘 Mon–Sat, 9:30 AM – 7 PM')}`,
      chips: ["Request a callback", "Check my eligibility", "Documents needed"],
    }
  if (has(/apply|start|shuru|begin/)) return { html: (hi ? "आइए शुरू करते हैं — केवल 4 आसान चरण।" : "Let's start — just 4 quick steps.") + btn("Start application", "/apply") }

  return { html: hi ? "माफ़ कीजिए, मैं समझ नहीं पाया। 🙂 आप इनमें से कुछ पूछ सकते हैं:" : "Sorry, I didn't quite get that. 🙂 You can ask me things like:", chips: DEFAULT_CHIPS }
}
