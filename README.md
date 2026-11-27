# FundenFlo — Loan Advisory Web App (Demo)

Frontend-only demo of the FundenFlo loan platform for **Business / MSME** and **Individual** borrowers.
No backend: scoring, login and the chatbot run in the browser, and data is kept in `localStorage`.

**Stack (same as development.fundenflo.com):** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · shadcn/ui (Radix) · lucide-react · next/font (Inter + Poppins)

## Run it

```bash
cd fundenflo-web
npm install
npm run dev        # http://localhost:3000
```

Production build: `npm run build && npm start`

## Pages

Header nav: **Home · Loans (mega-menu) · Smart Assessment · EMI Tools · About · Contact**, plus **Login** and **Check my score**. Apply and Dashboard open from buttons and the profile menu.

| Route | What it does |
|---|---|
| `/` | Landing page: hero, Business vs Individual paths, AI features, 13 loan products, quick eligibility, FAQ |
| `/assess` | **Smart Credit Assessment (new).** The customer **speaks** (browser mic, English/Hindi/Hinglish) or **writes** their profile in plain words. The AI pulls out the facts live, builds a **preliminary assessment**, then verifies it against **2 years of balance sheets + bank statements**. Matches add points, gaps remove them, and new data points appear (growth, DSCR, leverage, banking conduct) |
| `/loans` | All 13 products with search, filters, sorting and **side-by-side comparison** (up to 3) |
| `/loans/[id]` | Product detail page: features, ideal for, eligibility, fees, documents, EMI estimate, FAQs, related loans |
| `/about`, `/contact` | Company story, values and who we serve · callback form, email and social links |
| `/apply` | 5-step application wizard with a **live AI score preview**, demo autofill, simulated GSTIN/PAN fetch and AI document check. Opened from **Check my score**, the home-page buttons and the profile menu |
| `/result` | 🔒 Login required. Full score report: 300–900 gauge, 6-factor breakdown, "why your score is X", improvement simulator, matched lender offers |
| `/login` | **Mobile number + OTP login.** New users add a name and consent; returning numbers log straight in. Demo: the OTP shows up as an on-screen SMS |
| `/dashboard` | 🔒 Login required. Opened from the profile menu. Application tracker, score trend, improvement-plan tasks, documents and offers |
| `/tools` | EMI calculator (with yearly schedule) + eligibility calculator |
| Chat (every page) | **Flo**, the AI assistant: EMI, eligibility, documents, CIBIL tips, product info. Understands English and Hinglish |

## Login (demo)

The score features need a login, like a real lending site:
- **Login** button in the header → `/login`.
- Clicking **Run AI assessment** while logged out opens a login popup, and the assessment continues automatically after login.
- Opening `/result` or `/dashboard` while logged out shows a blurred preview with the login form on top.
- Any valid Indian mobile number works (10 digits, starting 6–9). The OTP appears in a fake SMS card (use **Auto-fill from SMS**). A wrong OTP allows 3 attempts, and there's a 30-second resend timer.
- Sessions are stored in `localStorage`. For real SMS, replace `sendOtp` / `verify` in [`src/components/auth/login-form.tsx`](src/components/auth/login-form.tsx) with your OTP API.

## Smart Credit Assessment (demo notes)

- **Voice:** uses the browser's built-in speech recognition (Chrome / Edge, desktop and Android). No API key is needed. Other browsers fall back to typing.
- **Understanding:** [`src/lib/intake.ts`](src/lib/intake.ts) handles English, Hinglish and spoken numbers ("dedh crore", "do saal", "one and a half crore"). Hindi speech in Devanagari is converted first.
- **Verification:** [`src/lib/verification.ts`](src/lib/verification.ts) compares declared and document values (within 10% = match), checks for undisclosed EMIs and bounces, and adds new metrics. Net impact is capped at −50 to +60 points.
- **Document reading is simulated in this demo.** Use "Sample docs — figures match" or "with gaps". Every value the AI "read" can be edited, and the assessment updates instantly. In production, swap `readDocuments` for OCR/AI extraction + Account Aggregator data.

## Demo script (2 minutes)

1. **Smart Assessment** → click **"Dukaan / trader · Hinglish"** (or speak) → *Generate* → log in → **Sample docs — figures match** → *Verify*. Score goes 702 → 780. Repeat with **"with gaps"** to see mismatches flagged (702 → 617).
1. **Check my score** → Individual → Personal Loan → **Fill demo data** (the score updates live on the left) → *Continue* → *Run AI assessment* → log in with any mobile number.
2. Try **Business / MSME** → Machinery Loan → **Fill demo data** → **Upload demo documents** → *Run AI assessment*.
3. On the report, tick fixes in the **simulator** to watch the score rise, then **Select** an offer and open **My dashboard** from the profile menu to see the tracker move.
4. Open **Ask Flo AI** and try: `20 lakh ka emi 5 saal 9.5%`, `meri salary 60000 hai kitna loan milega`, `why is my score low`.

## Where the logic lives

- [`src/lib/scoring.ts`](src/lib/scoring.ts): scoring engine (6 weighted factors → 300–900, plus document-verification adjustment), issue/fix generation, improvement simulator
- [`src/lib/intake.ts`](src/lib/intake.ts) / [`src/lib/verification.ts`](src/lib/verification.ts) / [`src/lib/use-speech.ts`](src/lib/use-speech.ts): Smart Assessment, covering speech, narrative parsing and document checks
- [`src/lib/chat-engine.ts`](src/lib/chat-engine.ts): rule-based chatbot intents (English and Hinglish)
- [`src/lib/auth.ts`](src/lib/auth.ts): demo phone + OTP session
- [`src/lib/data.ts`](src/lib/data.ts): products, demo lenders, document checklists, content

> The "AI" is a deterministic, explainable rule engine, built so the demo works offline. To connect a real LLM or credit bureau later, replace `computeScore` / `reply` with API calls. The UI doesn't need to change.

Lenders shown ("Private Bank A", "NBFC C" …) are generic demo labels, not real partners. All scores and offers are illustrative.
