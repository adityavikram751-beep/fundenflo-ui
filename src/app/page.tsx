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
      <section className="ff-hero-bg relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-35 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_30%,#000_40%,transparent_100%)]" />
        <div className="ff-container relative grid items-center gap-8 py-10 sm:gap-12 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-trust-blue/15 bg-white/85 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-navy-pressed uppercase shadow-xs backdrop-blur">
              <Sparkles className="size-3.5 text-gold-deep" /> AI-Powered Loan Advisory · Business & Individual
            </span>
            <h1 className="mt-4 text-3xl leading-[1.12] font-bold sm:mt-5 sm:text-4xl md:text-5xl lg:text-[3.4rem]">
              A Clearer Path To{" "}
              <span className="relative isolate text-trust-blue">
                Capital.
                <span className="absolute inset-x-0 bottom-1.5 -z-10 h-3 rounded bg-gold/45" />
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              Check eligibility, get your <b className="text-navy">FundenFlo Score</b> and compare offers from <b className="text-navy">50+ banks & NBFCs</b> — for MSMEs, businesses and individuals. Your ambition. Our direction.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
              <Button asChild className="h-12 w-full rounded-xl bg-gold px-6 text-base font-bold text-navy shadow-[0_10px_24px_rgb(253_185_1/0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#ffc727] sm:w-auto">
                <Link href="/apply"><Gauge className="size-5" /> Check Eligibility — 2 Min</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 w-full rounded-xl border-input bg-white/90 px-6 text-base font-semibold text-navy shadow-xs transition-all hover:-translate-y-0.5 hover:bg-white sm:w-auto">
                <Link href="/assess"><Mic className="size-5 text-trust-blue" /> Speak Your Requirement</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 text-sm font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-success-soft text-success"><ShieldCheck className="size-3.5" /></span> No Impact On CIBIL</span>
              <span className="inline-flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-success-soft text-success"><Lock className="size-3.5" /></span> 256-Bit Encrypted</span>
              <span className="inline-flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-success-soft text-success"><BadgeCheck className="size-3.5" /></span> Zero Hidden Fees</span>
            </div>
          </div>

          <div className="relative mx-auto grid w-full max-w-[480px] gap-3 sm:block sm:h-[540px]">
            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_64px_-12px_rgb(10_25_47/0.18)] backdrop-blur sm:absolute sm:inset-x-4 sm:top-0">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-navy">Your Loan Readiness</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success"><span className="size-1.5 animate-pulse rounded-full bg-success" /> Live AI Score</span>
              </div>
              <ScoreGauge score={782} compact />
              <div className="mt-4 grid gap-2.5">
                {[["Credit History", 94], ["Repayment Capacity", 81], ["Business Stability", 100]].map(([k, v]) => (
                  <div key={k as string}>
                    <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">{k}</span><b className="ff-num text-navy">{v}/100</b></div>
                    <div className="h-2 overflow-hidden rounded-full bg-track"><div className="h-full rounded-full bg-[linear-gradient(90deg,#1d4e9e,#3f5f90)]" style={{ width: `${v}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_16px_40px_-10px_rgb(10_25_47/0.16)] backdrop-blur sm:absolute sm:right-0 sm:bottom-0 sm:w-64 sm:animate-float">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-lg bg-trust-blue text-xs font-extrabold text-white shadow-xs">PB</span>
                <div>
                  <div className="text-sm font-semibold text-navy">Best Offer Matched</div>
                  <div className="text-xs text-muted-foreground">Private Bank A</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-subtle/70 p-2 text-center">
                <div><div className="ff-num font-heading font-bold text-navy">10.75%</div><div className="text-[10px] text-muted-foreground">Rate</div></div>
                <div><div className="ff-num font-heading font-bold text-navy">₹45 L</div><div className="text-[10px] text-muted-foreground">Amount</div></div>
                <div><div className="ff-num font-heading font-bold text-success">92%</div><div className="text-[10px] text-muted-foreground">Chance</div></div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_16px_40px_-10px_rgb(10_25_47/0.16)] backdrop-blur sm:absolute sm:bottom-8 sm:-left-2 sm:animate-float-slow">
              <span className="grid size-8 place-items-center rounded-full bg-success-soft text-success"><FileCheck className="size-4" /></span>
              <div>
                <div className="text-sm font-semibold text-navy">5 Documents Verified</div>
                <div className="text-xs text-muted-foreground">AI Check · 12 Sec</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="ff-navy-grad relative overflow-hidden border-y border-white/10 text-white">
        <div className="ff-container relative grid grid-cols-2 lg:grid-cols-4">
          {[["50+", "Lending partners across banks & NBFCs"], ["₹100Cr+", "Loans facilitated"], ["5,000+", "Families & businesses funded"], ["48 hrs", "To know your loan eligibility"]].map(([n, l], i) => (
            <div key={n} className={`px-3 py-5 transition-colors hover:bg-white/[0.03] sm:px-5 sm:py-7 ${i % 2 === 0 ? "border-r border-white/10" : ""} ${i < 2 ? "border-b border-white/10 lg:border-b-0" : ""} lg:border-r lg:last:border-r-0`}>
              <div className="font-heading text-2xl font-bold text-gold sm:text-3xl">{n}</div>
              <div className="mt-0.5 text-xs text-[#c9d4e3] sm:text-sm">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- LENDER NETWORK STRIP ---------------- */}
      <section className="border-b bg-white py-5 sm:py-6">
        <div className="ff-container flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <span className="mr-1 text-xs font-bold tracking-wider text-navy uppercase">Our Lender Network</span>
          {["Private Sector Banks", "Public Sector Banks", "Small Finance Banks", "MSME-Focused NBFCs", "Digital Lenders"].map((x) => (
            <span key={x} className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-background px-3.5 py-1 text-xs font-semibold text-navy/85 shadow-2xs sm:text-sm">
              <span className="size-1.5 rounded-full bg-gold-deep" />{x}
            </span>
          ))}
        </div>
      </section>

      <AssessShowcase />

      {/* ---------------- SEGMENTS ---------------- */}
      <section className="py-14 sm:py-20">
        <div className="ff-container">
          <SectionHead eyebrow="Who Is It For?" title="One Platform. Two Kinds Of Borrowers." sub="Pick your path — the journey, documents and lenders adapt to you." />
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
      <section className="bg-white py-14 sm:py-20">
        <div className="ff-container">
          <SectionHead eyebrow="AI Inside" title="Smarter Than A Loan Form" sub="FundenFlo's AI reads your profile, explains your score and finds lenders most likely to say yes." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={f.t} className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-trust-blue/35 hover:shadow-[0_18px_40px_-14px_rgb(10_25_47/0.14)]">
                <span className={`mb-4 grid size-12 place-items-center rounded-xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105 ${i % 2 ? "bg-gold-soft text-gold-ink ring-gold/30" : "bg-info-soft/60 text-navy-pressed ring-trust-blue/15"}`}><f.icon className="size-6" /></span>
                <h3 className="text-lg font-semibold">{f.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-3xl border border-[#f3d98a] bg-[linear-gradient(120deg,#fff9e6_0%,#fff2cc_100%)] p-6 shadow-sm sm:p-7 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold text-navy shadow-xs"><Gauge className="size-6" /></span>
              <div>
                <h3 className="text-xl font-semibold">See Your Score Change As You Fill The Form</h3>
                <p className="mt-1 text-sm text-[#5a4200]">Answer a few questions about your income, EMIs and credit. Your FundenFlo Score, eligibility and the exact reasons behind it update live.</p>
              </div>
            </div>
            <Button asChild className="h-11 w-full shrink-0 rounded-xl px-5 shadow-xs sm:w-auto"><Link href="/apply">Check My Score <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>

      {/* ---------------- PRODUCTS ---------------- */}
      <section className="py-14 sm:py-20" id="products">
        <div className="ff-container">
          <SectionHead eyebrow="Our Products" title="Loans For Every Stage" sub="Business finance for MSMEs and retail loans for individuals — matched across our lender network." />
          <ProductsSection />
          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="h-11 rounded-xl border-input bg-white px-5 font-semibold text-navy"><Link href="/loans">View & Compare All Loans <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS + QUICK CHECK ---------------- */}
      <section className="bg-white py-14 sm:py-20">
        <div className="ff-container grid items-start gap-12 lg:grid-cols-2">
          <div>
            <span className="ff-eyebrow">How FundenFlo Works</span>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">From Need To Disbursal In 4 Steps</h2>
            <p className="mt-3 text-muted-foreground">No running between banks. One application, one set of documents, many lenders.</p>
            <ol className="relative mt-8 grid gap-5">
              {STEPS.map((s, i) => (
                <li key={s.t} className="relative flex gap-4">
                  {i < STEPS.length - 1 && <span className="absolute top-11 bottom-[-20px] left-[19px] w-0.5 bg-gradient-to-b from-gold to-border" aria-hidden />}
                  <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-gold font-heading font-bold text-navy ring-4 ring-white">{i + 1}</span>
                  <div className="pt-0.5">
                    <h3 className="text-base font-semibold">{s.t}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SERVE.map((s) => (
                <div key={s.t} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200/80 bg-background p-3.5 text-center text-xs font-semibold text-navy transition-colors hover:border-trust-blue/35 hover:bg-white">
                  <span className="grid size-9 place-items-center rounded-lg bg-info-soft/60 text-trust-blue"><s.icon className="size-4.5" /></span> {s.t}
                </div>
              ))}
            </div>
          </div>
          <QuickEligibility />
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="py-14 sm:py-20">
        <div className="ff-container">
          <SectionHead eyebrow="Stories" title="Borrowers Who Found A Clearer Path" />
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.n} className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-12px_rgb(10_25_47/0.12)]">
                <div className="flex gap-0.5 text-gold-deep">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-foreground">“{t.q}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-dashed pt-4">
                  <span className="grid size-10 place-items-center rounded-full bg-info-soft/70 text-sm font-bold text-navy-pressed ring-2 ring-info-soft">{initials(t.n)}</span>
                  <div><div className="text-sm font-semibold text-navy">{t.n}</div><div className="text-xs text-muted-foreground">{t.r}</div></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ + CTA ---------------- */}
      <section className="bg-white py-14 sm:py-20">
        <div className="ff-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="ff-eyebrow">FAQ</span>
            <h2 className="mt-4 text-3xl font-bold">Questions, Answered</h2>
            <p className="mt-3 text-muted-foreground">Still unsure? Ask <b className="text-navy">Flo</b>, our AI assistant — bottom-right corner, in English or Hindi.</p>
            <ul className="mt-6 grid gap-2 text-sm">
              {["Free Eligibility & Score Check", "Soft Assessment — No CIBIL Impact", "Business & Personal Products", "Dedicated MSME Support"].map((x) => (
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
        <div className="ff-container mt-14 sm:mt-16">
          <div className="ff-navy-grad relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl p-6 text-white shadow-[0_24px_60px_-15px_rgb(10_25_47/0.35)] sm:p-10 md:flex-row md:items-center">
            <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-gold/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-full border border-white/10" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Looking To Strengthen Your Finances?</h2>
              <p className="mt-2 text-[#c9d4e3]">Get your FundenFlo Score and matched offers in under 2 minutes.</p>
            </div>
            <div className="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Button asChild className="h-12 w-full rounded-xl bg-gold px-6 font-bold text-navy shadow-sm hover:bg-[#ffc727] sm:w-auto"><Link href="/apply"><Zap /> Start Now</Link></Button>
              <Button asChild variant="outline" className="h-12 w-full rounded-xl border-white/30 bg-white/5 px-6 font-semibold text-white hover:bg-white/15 hover:text-white sm:w-auto"><Link href="/tools">EMI Calculator</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
      <span className="ff-eyebrow">{eyebrow}</span>
      <h2 className="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-base text-muted-foreground sm:text-lg">{sub}</p>}
    </div>
  )
}

function SegmentCard({ href, icon: Icon, title, sub, tags, className }: { href: string; icon: React.ElementType; title: string; sub: string; tags: string[]; className: string }) {
  return (
    <Link href={href} className={`group relative flex min-h-[250px] flex-col overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-[0_20px_50px_-15px_rgb(10_25_47/0.35)] transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-15px_rgb(10_25_47/0.45)] sm:min-h-[290px] sm:p-8 ${className}`}>
      <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-white/[0.06] blur-xl" />
      <Icon className="absolute -right-6 -bottom-6 size-44 opacity-[0.08] transition-transform duration-300 group-hover:scale-105" />
      <span className="mb-5 grid size-12 place-items-center rounded-xl bg-white/15 ring-1 ring-white/15 backdrop-blur-xs"><Icon className="size-6 text-gold" /></span>
      <h3 className="text-2xl font-bold text-white">{title}</h3>
      <p className="mt-1 text-[#d3ddf0]">{sub}</p>
      <div className="mt-4 mb-6 flex flex-wrap gap-2">
        {tags.map((t) => <span key={t} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-xs">{t}</span>)}
      </div>
      <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-navy shadow-xs transition-colors group-hover:bg-[#ffc727]">
        Check Eligibility <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
