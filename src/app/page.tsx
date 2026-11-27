import Link from "next/link"
import {
  ArrowRight, BadgeCheck, Briefcase, CircleCheck, FileCheck, Gauge, Lock, Mic, ShieldCheck, Sparkles, Star, User, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScoreGauge } from "@/components/score-gauge"
import { ProductsSection } from "@/components/home/products-section"
import { AssessShowcase } from "@/components/home/assess-showcase"
import { QuickEligibility } from "@/components/home/quick-eligibility"
import { FAQS, FEATURES, SERVE, STEPS, TESTIMONIALS, initials } from "@/lib/data"

export default function HomePage() {
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="ff-hero-bg overflow-hidden">
        <div className="ff-container grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <span className="ff-eyebrow"><Sparkles className="size-3.5 text-gold-deep" /> AI-powered loan advisory · Business & Individual</span>
            <h1 className="mt-5 text-4xl leading-[1.1] font-bold md:text-5xl lg:text-[3.4rem]">
              A Clearer Path To{" "}
              <span className="relative isolate text-trust-blue">
                Capital.
                <span className="absolute inset-x-0 bottom-1.5 -z-10 h-3 rounded bg-gold/45" />
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Check eligibility, get your <b className="text-navy">FundenFlo Score</b> and compare offers from <b className="text-navy">50+ banks & NBFCs</b> — for MSMEs, businesses and individuals. Your ambition. Our direction.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-xl bg-gold px-6 text-base font-bold text-navy shadow-[0_8px_20px_rgb(253_185_1/0.35)] hover:bg-[#ffc727]">
                <Link href="/apply"><Gauge className="size-5" /> Check eligibility — 2 min</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-xl border-input bg-white px-6 text-base font-semibold text-navy">
                <Link href="/assess"><Mic className="size-5" /> Speak your requirement</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-success" /> No impact on CIBIL</span>
              <span className="inline-flex items-center gap-1.5"><Lock className="size-4 text-success" /> 256-bit encrypted</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="size-4 text-success" /> Zero hidden fees</span>
            </div>
          </div>

          <div className="relative mx-auto grid w-full max-w-[480px] gap-3 sm:block sm:h-[540px]">
            <div className="rounded-3xl border bg-white p-6 shadow-[0_24px_60px_rgb(10_25_47/0.16)] sm:absolute sm:inset-x-4 sm:top-0">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-navy">Your loan readiness</span>
                <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success">Live AI score</span>
              </div>
              <ScoreGauge score={782} compact />
              <div className="mt-4 grid gap-2.5">
                {[["Credit history", 94], ["Repayment capacity", 81], ["Business stability", 100]].map(([k, v]) => (
                  <div key={k as string}>
                    <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">{k}</span><b className="ff-num text-navy">{v}/100</b></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-track"><div className="h-full rounded-full bg-chart-1" style={{ width: `${v}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-4 shadow-xl sm:absolute sm:right-0 sm:bottom-0 sm:w-64 sm:animate-float">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-lg bg-trust-blue text-xs font-extrabold text-white">PB</span>
                <div>
                  <div className="text-sm font-semibold text-navy">Best offer matched</div>
                  <div className="text-xs text-muted-foreground">Private Bank A</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div><div className="ff-num font-heading font-bold text-navy">10.75%</div><div className="text-[10px] text-muted-foreground">Rate</div></div>
                <div><div className="ff-num font-heading font-bold text-navy">₹45 L</div><div className="text-[10px] text-muted-foreground">Amount</div></div>
                <div><div className="ff-num font-heading font-bold text-success">92%</div><div className="text-[10px] text-muted-foreground">Chance</div></div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border bg-white px-4 py-3 shadow-xl sm:absolute sm:bottom-8 sm:-left-2 sm:animate-float-slow">
              <span className="grid size-8 place-items-center rounded-full bg-success-soft text-success"><FileCheck className="size-4" /></span>
              <div>
                <div className="text-sm font-semibold text-navy">5 documents verified</div>
                <div className="text-xs text-muted-foreground">AI check · 12 sec</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="bg-navy text-white">
        <div className="ff-container grid grid-cols-2 lg:grid-cols-4">
          {[["50+", "Lending partners across banks & NBFCs"], ["₹100Cr+", "Loans facilitated"], ["5,000+", "Families & businesses funded"], ["48 hrs", "To know your loan eligibility"]].map(([n, l], i) => (
            <div key={n} className={`px-5 py-7 ${i % 2 === 0 ? "border-r border-white/10" : ""} lg:border-r lg:last:border-r-0`}>
              <div className="font-heading text-3xl font-bold text-gold">{n}</div>
              <div className="text-sm text-[#c9d4e3]">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- LENDER NETWORK STRIP ---------------- */}
      <section className="border-b bg-white py-6">
        <div className="ff-container flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-semibold text-muted-foreground">
          <span className="text-xs font-bold tracking-wider text-navy uppercase">Our lender network</span>
          {["Private sector banks", "Public sector banks", "Small finance banks", "MSME-focused NBFCs", "Digital lenders"].map((x) => (
            <span key={x} className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-gold-deep" />{x}</span>
          ))}
        </div>
      </section>

      <AssessShowcase />

      {/* ---------------- SEGMENTS ---------------- */}
      <section className="py-20">
        <div className="ff-container">
          <SectionHead eyebrow="Who is it for?" title="One platform. Two kinds of borrowers." sub="Pick your path — the journey, documents and lenders adapt to you." />
          <div className="grid gap-6 md:grid-cols-2">
            <SegmentCard
              href="/apply?type=business"
              icon={Briefcase}
              title="Business / MSME"
              sub="Proprietors, partnerships, LLPs, companies & startups"
              tags={["Business Loan", "LAP", "OD / CC", "Machinery", "Bill Discounting", "LC"]}
              className="bg-[linear-gradient(140deg,#0a192f,#1d4e9e)]"
            />
            <SegmentCard
              href="/apply?type=individual"
              icon={User}
              title="Individuals"
              sub="Salaried, self-employed & professionals"
              tags={["Home Loan", "Personal Loan", "Auto", "Education", "Professional"]}
              className="bg-[linear-gradient(140deg,#0d2040,#3f5f90)]"
            />
          </div>
        </div>
      </section>

      {/* ---------------- AI FEATURES ---------------- */}
      <section className="bg-white py-20">
        <div className="ff-container">
          <SectionHead eyebrow="AI inside" title="Smarter than a loan form" sub="FundenFlo's AI reads your profile, explains your score and finds lenders most likely to say yes." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={f.t} className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl">
                <span className={`mb-4 grid size-12 place-items-center rounded-xl ${i % 2 ? "bg-gold-soft text-gold-ink" : "bg-info-soft/60 text-navy-pressed"}`}><f.icon className="size-6" /></span>
                <h3 className="text-lg font-semibold">{f.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-6 rounded-3xl border border-[#f3d98a] bg-gold-soft/60 p-7 md:flex-row">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold text-navy"><Gauge className="size-6" /></span>
              <div>
                <h3 className="text-xl font-semibold">See your score change as you fill the form</h3>
                <p className="mt-1 text-sm text-[#5a4200]">Answer a few questions about your income, EMIs and credit. Your FundenFlo Score, eligibility and the exact reasons behind it update live.</p>
              </div>
            </div>
            <Button asChild className="h-11 shrink-0 rounded-xl px-5"><Link href="/apply">Check my score <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>

      {/* ---------------- PRODUCTS ---------------- */}
      <section className="py-20" id="products">
        <div className="ff-container">
          <SectionHead eyebrow="Our products" title="Loans for every stage" sub="Business finance for MSMEs and retail loans for individuals — matched across our lender network." />
          <ProductsSection />
          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="h-11 rounded-xl border-input bg-white px-5 font-semibold text-navy"><Link href="/loans">View & compare all loans <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS + QUICK CHECK ---------------- */}
      <section className="bg-white py-20">
        <div className="ff-container grid items-start gap-12 lg:grid-cols-2">
          <div>
            <span className="ff-eyebrow">How FundenFlo works</span>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">From need to disbursal in 4 steps</h2>
            <p className="mt-3 text-muted-foreground">No running between banks. One application, one set of documents, many lenders.</p>
            <ol className="mt-8 grid gap-5">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold font-heading font-bold text-navy">{i + 1}</span>
                  <div>
                    <h3 className="text-base font-semibold">{s.t}</h3>
                    <p className="text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {SERVE.map((s) => (
                <div key={s.t} className="flex flex-col items-center gap-2 rounded-xl border bg-background p-3 text-center text-xs font-semibold text-navy">
                  <s.icon className="size-5 text-trust-blue" /> {s.t}
                </div>
              ))}
            </div>
          </div>
          <QuickEligibility />
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="py-20">
        <div className="ff-container">
          <SectionHead eyebrow="Stories" title="Borrowers who found a clearer path" />
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.n} className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex gap-0.5 text-gold-deep">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
                <blockquote className="mt-3 text-[15px] leading-relaxed text-foreground">“{t.q}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-info-soft/70 text-sm font-bold text-navy-pressed">{initials(t.n)}</span>
                  <div><div className="text-sm font-semibold text-navy">{t.n}</div><div className="text-xs text-muted-foreground">{t.r}</div></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ + CTA ---------------- */}
      <section className="bg-white py-20">
        <div className="ff-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="ff-eyebrow">FAQ</span>
            <h2 className="mt-4 text-3xl font-bold">Questions, answered</h2>
            <p className="mt-3 text-muted-foreground">Still unsure? Ask <b className="text-navy">Flo</b>, our AI assistant — bottom-right corner, in English or Hinglish.</p>
            <ul className="mt-6 grid gap-2 text-sm">
              {["Free eligibility & score check", "Soft assessment — no CIBIL impact", "Business & personal products", "Dedicated MSME support"].map((x) => (
                <li key={x} className="flex items-center gap-2"><CircleCheck className="size-4 text-success" /> {x}</li>
              ))}
            </ul>
          </div>
          <Accordion type="single" collapsible defaultValue="q0" className="rounded-2xl border bg-background px-5">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger className="text-[15px] font-semibold text-navy">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="ff-container mt-16">
          <div className="ff-navy-grad flex flex-col items-start justify-between gap-6 rounded-3xl p-10 text-white md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">Looking to strengthen your finances?</h2>
              <p className="mt-2 text-[#c9d4e3]">Get your FundenFlo Score and matched offers in under 2 minutes.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-xl bg-gold px-6 font-bold text-navy hover:bg-[#ffc727]"><Link href="/apply"><Zap /> Start now</Link></Button>
              <Button asChild variant="outline" className="h-12 rounded-xl border-white/30 bg-transparent px-6 font-semibold text-white hover:bg-white/10 hover:text-white"><Link href="/tools">EMI calculator</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <span className="ff-eyebrow">{eyebrow}</span>
      <h2 className="mt-4 text-3xl font-bold md:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-lg text-muted-foreground">{sub}</p>}
    </div>
  )
}

function SegmentCard({ href, icon: Icon, title, sub, tags, className }: { href: string; icon: React.ElementType; title: string; sub: string; tags: string[]; className: string }) {
  return (
    <Link href={href} className={`group relative flex min-h-[290px] flex-col overflow-hidden rounded-3xl p-8 text-white shadow-lg transition-transform hover:-translate-y-1 ${className}`}>
      <Icon className="absolute -right-6 -bottom-6 size-44 opacity-[0.08]" />
      <span className="mb-5 grid size-12 place-items-center rounded-xl bg-white/15"><Icon className="size-6 text-gold" /></span>
      <h3 className="text-2xl font-bold text-white">{title}</h3>
      <p className="mt-1 text-[#d3ddf0]">{sub}</p>
      <div className="mt-4 mb-6 flex flex-wrap gap-2">
        {tags.map((t) => <span key={t} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">{t}</span>)}
      </div>
      <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-navy">
        Check eligibility <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
