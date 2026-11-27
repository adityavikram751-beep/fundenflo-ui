"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Columns3, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { PRODUCTS, type ApplicantType } from "@/lib/data"
import { PRODUCT_CONTENT } from "@/lib/product-content"
import { cn } from "@/lib/utils"

type Sort = "popular" | "rate" | "amount"

export function LoanExplorer() {
  const [seg, setSeg] = useState<"all" | ApplicantType>("all")
  const [q, setQ] = useState("")
  const [sort, setSort] = useState<Sort>("popular")
  const [compare, setCompare] = useState<string[]>([])

  const list = useMemo(() => {
    const l = PRODUCTS.filter((p) => (seg === "all" || p.seg === seg) && (!q || `${p.name} ${p.desc}`.toLowerCase().includes(q.toLowerCase())))
    if (sort === "rate") return [...l].sort((a, b) => a.minRate - b.minRate)
    if (sort === "amount") return [...l].sort((a, b) => b.maxAmount - a.maxAmount)
    return l
  }, [seg, q, sort])

  const toggle = (id: string) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]))
  const cmp = PRODUCTS.filter((p) => compare.includes(p.id))

  return (
    <div className="grid min-w-0 gap-6 [&>*]:min-w-0">
      <Card className="py-4">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:min-w-56 sm:flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search loans — e.g. machinery, home, OD" className="h-11 bg-white pl-9" aria-label="Search loans" />
          </div>
          <div role="tablist" className="grid w-full grid-cols-3 rounded-xl border bg-subtle p-1 sm:inline-flex sm:w-auto">
            {([["all", "All"], ["business", "Business / MSME"], ["individual", "Individual"]] as const).map(([id, l]) => (
              <button key={id} role="tab" aria-selected={seg === id} onClick={() => setSeg(id)} className={cn("truncate rounded-lg px-2 py-2 text-xs font-semibold text-muted-foreground sm:px-3.5 sm:text-sm", seg === id && "bg-white text-navy shadow-sm")}>{l}</button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm font-medium text-navy sm:w-auto" aria-label="Sort">
            <option value="popular">Sort: Popular</option>
            <option value="rate">Sort: Lowest Rate</option>
            <option value="amount">Sort: Highest Amount</option>
          </select>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => {
          const c = PRODUCT_CONTENT[p.id]
          const on = compare.includes(p.id)
          return (
            <div key={p.id} className={cn("group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl", on && "border-trust-blue ring-4 ring-info-soft")}>
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-info-soft/60 text-navy-pressed"><p.icon className="size-6" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-lg font-semibold">{p.name}</h3>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase", p.seg === "business" ? "bg-gold-soft text-gold-ink" : "bg-subtle text-info")}>{p.seg === "business" ? "Business" : "Individual"}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{c.tagline}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-subtle/70 p-3 text-center">
                <div><div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Rate from</div><div className="ff-num font-heading font-bold text-navy">{p.rate}</div></div>
                <div><div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Up to</div><div className="ff-num font-heading font-bold text-navy">{p.max}</div></div>
                <div><div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Tenure</div><div className="font-heading text-sm font-bold text-navy">{p.tenure}</div></div>
              </div>
              <ul className="mt-4 grid gap-1.5 text-sm text-muted-foreground">
                {c.highlights.slice(0, 2).map((h) => <li key={h} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-deep" />{h}</li>)}
              </ul>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                <label className="mr-auto flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Checkbox checked={on} onCheckedChange={() => toggle(p.id)} disabled={!on && compare.length >= 3} aria-label={`Compare ${p.name}`} /> Compare
                </label>
                <Button asChild variant="outline" size="sm"><Link href={`/loans/${p.id}`}>Details</Link></Button>
                <Button asChild size="sm"><Link href={`/apply?type=${p.seg}&product=${p.id}`}>Check Eligibility <ArrowRight /></Link></Button>
              </div>
            </div>
          )
        })}
        {list.length === 0 && <p className="col-span-full py-10 text-center text-muted-foreground">No loans match “{q}”.</p>}
      </div>

      {cmp.length >= 2 && (
        <Card className="animate-in fade-in slide-in-from-bottom-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-heading text-lg font-semibold text-navy"><Columns3 className="size-5 text-trust-blue" /> Side-By-Side Comparison</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setCompare([])}><X /> Clear</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-subtle text-left">
                  <tr><th className="w-44 px-4 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Feature</th>{cmp.map((p) => <th key={p.id} className="px-4 py-3 font-heading font-semibold text-navy">{p.name}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    ["Interest Rate", (p: (typeof cmp)[number]) => `From ${p.rate}`],
                    ["Maximum Amount", (p: (typeof cmp)[number]) => p.max],
                    ["Tenure", (p: (typeof cmp)[number]) => p.tenure],
                    ["Collateral", (p: (typeof cmp)[number]) => PRODUCT_CONTENT[p.id].collateral],
                    ["Processing Fee", (p: (typeof cmp)[number]) => PRODUCT_CONTENT[p.id].processing],
                    ["Best For", (p: (typeof cmp)[number]) => PRODUCT_CONTENT[p.id].idealFor.slice(0, 2).join(", ")],
                  ].map(([label, fn]) => (
                    <tr key={label as string}>
                      <td className="px-4 py-3 font-semibold text-muted-foreground">{label as string}</td>
                      {cmp.map((p) => <td key={p.id} className="px-4 py-3 text-navy">{(fn as (x: (typeof cmp)[number]) => string)(p)}</td>)}
                    </tr>
                  ))}
                  <tr>
                    <td />
                    {cmp.map((p) => <td key={p.id} className="px-4 py-3"><Button asChild size="sm"><Link href={`/apply?type=${p.seg}&product=${p.id}`}>Apply <ArrowRight /></Link></Button></td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      {compare.length === 1 && <p className="text-center text-sm text-muted-foreground">Select one more loan to compare side by side (up to 3).</p>}
    </div>
  )
}
