import Link from "next/link"
import { ArrowRight, ChartColumn, Compass, Eye, FileCheck, Handshake, Landmark, Layers, Mic, Scale, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHero } from "@/components/page-hero"
import { SERVE, STEPS } from "@/lib/data"

export const metadata = { title: "About us | FundenFlo" }

const WHY = [
  { icon: Compass, t: "Expert financial guidance", d: "Advisors who understand MSME cash flows, not just loan forms." },
  { icon: Landmark, t: "Multi-lender network", d: "50+ banks and NBFCs — we find the lender that fits you, not the other way round." },
  { icon: FileCheck, t: "Faster documentation", d: "One set of documents, checked before it reaches a lender." },
  { icon: ChartColumn, t: "Data-driven assessment", d: "Explainable scoring that shows exactly what lenders will look at." },
  { icon: Eye, t: "Transparent advisory", d: "Every fee shown upfront. No hidden charges, ever." },
  { icon: Users, t: "Dedicated MSME support", d: "A relationship manager from first call to disbursal." },
]
const VALUES = [
  { icon: Scale, t: "Fair", d: "We match on merit and explain every decision." },
  { icon: ShieldCheck, t: "Secure", d: "Consent-first data handling with 256-bit encryption." },
  { icon: Handshake, t: "On your side", d: "We advise you — we don't push a single lender's product." },
  { icon: Layers, t: "Simple", d: "Speak, write or fill a form — whatever is easiest for you." },
]

export default function AboutPage() {
  return (
    <>
      <PageHero crumb="About us" eyebrow="About FundenFlo" title="The right funding, at the right time." sub="FundenFlo is a loan advisory platform for MSMEs, businesses and families. We make borrowing clearer, faster and fairer by pairing smart technology with experienced advisors." />
      <div className="ff-container relative -mt-16 grid gap-16 pb-10">
        <div className="grid gap-4 rounded-2xl border bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {[["50+", "Lending partners across banks & NBFCs"], ["₹100Cr+", "Loans facilitated"], ["5,000+", "Families & businesses funded"], ["48 hrs", "To know your loan eligibility"]].map(([n, l]) => (
            <div key={n} className="rounded-xl bg-subtle/60 p-5">
              <div className="font-heading text-3xl font-bold text-navy">{n}</div>
              <div className="text-sm text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>

        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="ff-eyebrow">Our mission</span>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">A clearer path to capital for every Indian business</h2>
            <p className="mt-4 text-lg text-muted-foreground">India&apos;s small businesses power the economy, yet most find borrowing slow and confusing — too many forms, too little clarity on why a loan was rejected.</p>
            <p className="mt-3 text-muted-foreground">We started FundenFlo to change that: tell us about your business in your own words, see exactly how lenders will view you, fix what&apos;s holding you back, and get matched to lenders most likely to say yes.</p>
          </div>
          <div className="ff-navy-grad relative overflow-hidden rounded-3xl p-8 text-white">
            <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full border border-white/10" />
            <div className="relative grid gap-5">
              <div className="font-heading text-2xl font-bold text-gold">Your Ambition. Our Direction.</div>
              {["Business & personal loans under one roof", "Speak, write or fill a form — your choice", "Document verification that strengthens your file", "Advisors who stay with you till disbursal"].map((x) => (
                <div key={x} className="flex items-center gap-3 text-[#d8e2ea]"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-gold">✓</span>{x}</div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="ff-eyebrow">Why FundenFlo</span>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Built around the borrower</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w, i) => (
              <div key={w.t} className="rounded-2xl border bg-white p-6 shadow-sm">
                <span className={`mb-4 grid size-12 place-items-center rounded-xl ${i % 2 ? "bg-gold-soft text-gold-ink" : "bg-info-soft/60 text-navy-pressed"}`}><w.icon className="size-6" /></span>
                <h3 className="text-lg font-semibold">{w.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{w.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-2">
          <div>
            <span className="ff-eyebrow">How we work</span>
            <h2 className="mt-4 text-3xl font-bold">Consultation to disbursal</h2>
            <ol className="mt-6 grid gap-5">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold font-heading font-bold text-navy">{i + 1}</span>
                  <div><h3 className="text-base font-semibold">{s.t}</h3><p className="text-sm text-muted-foreground">{s.d}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <span className="ff-eyebrow">Our values</span>
            <h2 className="mt-4 text-3xl font-bold">What we stand for</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {VALUES.map((v) => (
                <div key={v.t} className="rounded-2xl border bg-white p-5">
                  <v.icon className="size-6 text-trust-blue" />
                  <h3 className="mt-3 text-base font-semibold">{v.t}</h3>
                  <p className="text-sm text-muted-foreground">{v.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <span className="ff-eyebrow">Who we serve</span>
            <h2 className="mt-4 text-3xl font-bold">From kirana stores to manufacturers</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {SERVE.map((s) => (
              <div key={s.t} className="flex flex-col items-center gap-3 rounded-2xl border bg-white p-5 text-center text-sm font-semibold text-navy shadow-sm">
                <span className="grid size-12 place-items-center rounded-xl bg-subtle"><s.icon className="size-6 text-trust-blue" /></span>{s.t}
              </div>
            ))}
          </div>
        </section>

        <div className="ff-navy-grad flex flex-col items-start justify-between gap-6 rounded-3xl p-6 text-white sm:p-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Let&apos;s find your right funding</h2>
            <p className="mt-2 text-[#c9d4e3]">Tell us what you need — in your own words.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-12 rounded-xl bg-gold px-6 font-bold text-navy hover:bg-[#ffc727]"><Link href="/assess"><Mic /> Start Smart Assessment</Link></Button>
            <Button asChild variant="outline" className="h-12 rounded-xl border-white/30 bg-transparent px-6 font-semibold text-white hover:bg-white/10 hover:text-white"><Link href="/contact">Contact us <ArrowRight /></Link></Button>
          </div>
        </div>
      </div>
    </>
  )
}
