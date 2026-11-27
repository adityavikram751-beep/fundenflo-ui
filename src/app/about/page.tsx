import Link from "next/link"
import { ArrowRight, ChartColumn, Compass, Eye, FileCheck, Handshake, Landmark, Layers, Mic, Scale, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHero } from "@/components/page-hero"
import { ProtectedLink } from "@/components/auth/require-login"
import { SERVE, STEPS } from "@/lib/data"

export const metadata = { title: "About Us | FundenFlo" }

const WHY = [
  { icon: Compass, t: "Expert Financial Guidance", d: "Advisors who understand MSME cash flows, not just loan forms." },
  { icon: Landmark, t: "Multi-Lender Network", d: "50+ banks and NBFCs — we find the lender that fits you, not the other way round." },
  { icon: FileCheck, t: "Faster Documentation", d: "One set of documents, checked before it reaches a lender." },
  { icon: ChartColumn, t: "Data-Driven Assessment", d: "Explainable scoring that shows exactly what lenders will look at." },
  { icon: Eye, t: "Transparent Advisory", d: "Every fee shown upfront. No hidden charges, ever." },
  { icon: Users, t: "Dedicated MSME Support", d: "A relationship manager from first call to disbursal." },
]
const VALUES = [
  { icon: Scale, t: "Fair", d: "We match on merit and explain every decision." },
  { icon: ShieldCheck, t: "Secure", d: "Consent-first data handling with 256-bit encryption." },
  { icon: Handshake, t: "On Your Side", d: "We advise you — we don't push a single lender's product." },
  { icon: Layers, t: "Simple", d: "Speak, write or fill a form — whatever is easiest for you." },
]

export default function AboutPage() {
  return (
    <>
      <PageHero crumb="About Us" eyebrow="About FundenFlo" title="The Right Funding, At The Right Time." sub="FundenFlo is a loan advisory platform for MSMEs, businesses and families. We make borrowing clearer, faster and fairer by pairing smart technology with experienced advisors." />
      <div className="ff-container relative -mt-12 grid gap-12 pb-10 sm:-mt-16 sm:gap-16">
        <div className="grid gap-3 rounded-3xl border border-slate-200/90 bg-white p-4 shadow-[0_20px_50px_-15px_rgb(29_78_158/0.14)] sm:grid-cols-2 sm:gap-4 sm:p-6 lg:grid-cols-4">
          {[["50+", "Lending partners across banks & NBFCs"], ["₹100Cr+", "Loans facilitated"], ["5,000+", "Families & businesses funded"], ["48 hrs", "To know your loan eligibility"]].map(([n, l]) => (
            <div key={n} className="rounded-2xl border border-slate-100 bg-[#f6faff] p-4 sm:p-5">
              <div className="font-heading text-2xl font-bold text-trust-blue sm:text-3xl">{n}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">{l}</div>
            </div>
          ))}
        </div>

        <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <span className="ff-eyebrow">Our Mission</span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl">A Clearer Path To Capital For Every Indian Business</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">India&apos;s small businesses power the economy, yet most find borrowing slow and confusing — too many forms, too little clarity on why a loan was rejected.</p>
            <p className="mt-3 leading-relaxed text-muted-foreground">We started FundenFlo to change that: tell us about your business in your own words, see exactly how lenders will view you, fix what&apos;s holding you back, and get matched to lenders most likely to say yes.</p>
          </div>
          <div className="ff-navy-grad relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-[0_24px_60px_-15px_rgb(10_25_47/0.35)] sm:p-8">
            <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-trust-blue/25 blur-2xl" />
            <div className="relative grid gap-4">
              <div className="font-heading text-2xl font-bold text-gold">Your Ambition. Our Direction.</div>
              {["Business & personal loans under one roof", "Speak, write or fill a form — your choice", "Document verification that strengthens your file", "Advisors who stay with you till disbursal"].map((x) => (
                <div key={x} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-[#e4ecf7]"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold text-xs font-bold text-navy">✓</span>{x}</div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <span className="ff-eyebrow">Why FundenFlo</span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl">Built Around The Borrower</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {WHY.map((w, i) => (
              <div key={w.t} className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-trust-blue/40 hover:shadow-[0_18px_40px_-14px_rgb(29_78_158/0.14)]">
                <span className={`mb-4 grid size-12 place-items-center rounded-xl ring-1 ring-inset ${i % 2 ? "bg-amber-50 text-gold-ink ring-amber-200/70" : "bg-blue-50 text-trust-blue ring-blue-200/70"}`}><w.icon className="size-6" /></span>
                <h3 className="text-lg font-semibold text-navy">{w.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{w.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
            <span className="ff-eyebrow">How We Work</span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Consultation To Disbursal</h2>
            <ol className="relative mt-6 grid gap-5">
              {STEPS.map((s, i) => (
                <li key={s.t} className="relative flex gap-4">
                  {i < STEPS.length - 1 && <span className="absolute top-11 bottom-[-20px] left-[19px] w-0.5 bg-gradient-to-b from-gold to-border" aria-hidden />}
                  <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-gold font-heading font-bold text-navy ring-4 ring-white">{i + 1}</span>
                  <div className="pt-0.5"><h3 className="text-base font-semibold">{s.t}</h3><p className="mt-0.5 text-sm text-muted-foreground">{s.d}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
            <span className="ff-eyebrow">Our Values</span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">What We Stand For</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {VALUES.map((v) => (
                <div key={v.t} className="rounded-2xl border border-slate-200/80 bg-[#f8fbff] p-5 transition-colors hover:border-trust-blue/35 hover:bg-white">
                  <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-trust-blue ring-1 ring-blue-200/60"><v.icon className="size-5" /></span>
                  <h3 className="mt-3 text-base font-semibold text-navy">{v.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <span className="ff-eyebrow">Who We Serve</span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">From Retail Businesses To Manufacturers</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
            {SERVE.map((s) => (
              <div key={s.t} className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-5 text-center text-sm font-semibold text-navy shadow-xs transition-all hover:-translate-y-0.5 hover:border-trust-blue/40 hover:shadow-md">
                <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-trust-blue ring-1 ring-blue-200/60"><s.icon className="size-6" /></span>{s.t}
              </div>
            ))}
          </div>
        </section>

        <div className="ff-navy-grad relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl p-6 text-white shadow-[0_24px_60px_-15px_rgb(10_25_47/0.35)] sm:p-10 md:flex-row md:items-center">
          <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-gold/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-full border border-white/10" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Let&apos;s Find Your Right Funding</h2>
            <p className="mt-2 text-[#c9d4e3]">Tell us what you need — in your own words.</p>
          </div>
          <div className="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild className="h-12 w-full rounded-xl bg-gold px-6 font-bold text-navy shadow-sm hover:bg-[#ffc727] sm:w-auto"><ProtectedLink href="/assess"><Mic /> Start Smart Assessment</ProtectedLink></Button>
            <Button asChild variant="outline" className="h-12 w-full rounded-xl border-white/30 bg-white/5 px-6 font-semibold text-white hover:bg-white/15 hover:text-white sm:w-auto"><Link href="/contact">Contact Us <ArrowRight /></Link></Button>
          </div>
        </div>
      </div>
    </>
  )
}
