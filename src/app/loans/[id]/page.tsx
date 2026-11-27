import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, BadgeCheck, ChevronRight, CircleCheck, FileText, Mic, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MiniEmi } from "@/components/loans/mini-emi"
import { DOCS, PRODUCTS } from "@/lib/data"
import { PRODUCT_CONTENT, SEGMENT_ELIGIBILITY } from "@/lib/product-content"

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: PageProps<"/loans/[id]">) {
  const { id } = await params
  const p = PRODUCTS.find((x) => x.id === id)
  return { title: p ? `${p.name} — rates from ${p.rate} | FundenFlo` : "Loan | FundenFlo" }
}

export default async function LoanDetailPage({ params }: PageProps<"/loans/[id]">) {
  const { id } = await params
  const p = PRODUCTS.find((x) => x.id === id)
  if (!p) notFound()
  const c = PRODUCT_CONTENT[p.id]
  const related = PRODUCTS.filter((x) => x.seg === p.seg && x.id !== p.id).slice(0, 3)
  const defaultMonths = p.id === "home" ? 240 : p.id === "lap" ? 120 : p.id === "bill" || p.id === "od" || p.id === "lc" ? 12 : 60

  return (
    <>
      <section className="ff-navy-grad relative overflow-hidden pt-9 pb-16 text-white">
        <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full border border-white/10" />
        <div className="ff-container relative">
          <nav className="mb-4 flex items-center gap-1 text-xs text-[#9fb0d0]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link><ChevronRight className="size-3" />
            <Link href="/loans" className="hover:text-white">Loans</Link><ChevronRight className="size-3" />
            <span className="text-[#c9d4e3]">{p.name}</span>
          </nav>
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-gold uppercase">
                <p.icon className="size-3.5" /> {p.seg === "business" ? "Business / MSME" : "Individual"} loan
              </span>
              <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">{p.name}</h1>
              <p className="mt-3 max-w-xl text-lg text-[#c9d4e3]">{c.tagline}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="h-12 rounded-xl bg-gold px-6 font-bold text-navy hover:bg-[#ffc727]"><Link href={`/apply?type=${p.seg}&product=${p.id}`}>Check eligibility <ArrowRight /></Link></Button>
                <Button asChild variant="outline" className="h-12 rounded-xl border-white/25 bg-white/10 px-6 font-semibold text-white hover:bg-white/20 hover:text-white"><Link href="/assess"><Mic /> Speak your requirement</Link></Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[["Rate from", p.rate], ["Up to", p.max], ["Tenure", p.tenure]].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur">
                  <div className="text-[11px] font-semibold tracking-wider text-[#9fb0d0] uppercase">{k}</div>
                  <div className="ff-num mt-1 font-heading text-xl font-bold text-white">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="ff-container grid gap-6 py-10 lg:grid-cols-[1fr_360px]">
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader><CardTitle className="font-heading text-xl font-semibold text-navy">Why choose this loan</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {c.highlights.map((h) => (
                <div key={h} className="flex items-start gap-3 rounded-xl bg-subtle/70 p-4"><BadgeCheck className="mt-0.5 size-5 shrink-0 text-success" /><span className="text-sm font-medium text-navy">{h}</span></div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold text-navy"><Target className="size-5 text-gold-deep" /> Ideal for</CardTitle></CardHeader>
              <CardContent><ul className="grid gap-2 text-sm">{c.idealFor.map((x) => <li key={x} className="flex gap-2"><CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />{x}</li>)}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold text-navy"><CircleCheck className="size-5 text-trust-blue" /> Eligibility</CardTitle></CardHeader>
              <CardContent><ul className="grid gap-2 text-sm">{SEGMENT_ELIGIBILITY[p.seg].map((x) => <li key={x} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-deep" />{x}</li>)}</ul></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="font-heading text-lg font-semibold text-navy">Fees & charges</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    {[["Interest rate", `From ${p.rate} p.a. — final rate depends on your FundenFlo Score`], ["Processing fee", c.processing], ["Collateral", c.collateral], ["Prepayment", p.seg === "individual" ? "Nil on floating-rate loans for individuals" : "Usually 2–4% on the prepaid amount; nil at select lenders"], ["FundenFlo advisory fee", "Free eligibility check · no hidden charges"]].map(([k, v]) => (
                      <tr key={k}><td className="w-48 bg-subtle/60 px-4 py-3 font-semibold text-muted-foreground">{k}</td><td className="px-4 py-3 text-navy">{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Indicative terms across our lender network. Exact terms are shown with each offer.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold text-navy"><FileText className="size-5 text-trust-blue" /> Documents you&apos;ll need</CardTitle></CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {DOCS[p.seg].map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium text-navy">{d.name}</span>
                  {!d.req && <span className="ml-auto text-xs text-muted-foreground">if applicable</span>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-heading text-lg font-semibold text-navy">Frequently asked questions</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="f0">
                {c.faqs.map((f, i) => (
                  <AccordionItem key={f.q} value={`f${i}`}>
                    <AccordionTrigger className="text-[15px] font-semibold text-navy">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <aside className="grid content-start gap-6 lg:sticky lg:top-24 lg:self-start">
          <MiniEmi rate={p.minRate + 1.5} months={defaultMonths} maxAmount={p.maxAmount} />
          <Card className="bg-gold-soft/60 ring-[#f3d98a]">
            <CardContent className="grid gap-3">
              <div className="flex items-center gap-2 font-heading font-semibold text-navy"><Mic className="size-4 text-gold-deep" /> Not sure what you qualify for?</div>
              <p className="text-sm text-[#5a4200]">Tell us about your {p.seg === "business" ? "business" : "income"} in your own words — get a credit assessment in a minute.</p>
              <Button asChild className="rounded-xl"><Link href="/assess">Try Smart Assessment <ArrowRight /></Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="font-heading text-base font-semibold text-navy">Related loans</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              {related.map((r) => (
                <Link key={r.id} href={`/loans/${r.id}`} className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:border-trust-blue/50 hover:bg-subtle/50">
                  <span className="grid size-9 place-items-center rounded-lg bg-info-soft/60 text-navy-pressed"><r.icon className="size-4" /></span>
                  <div className="min-w-0 flex-1"><div className="text-sm font-semibold text-navy">{r.name}</div><div className="text-xs text-muted-foreground">From {r.rate}</div></div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  )
}
