"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PRODUCTS, type ApplicantType } from "@/lib/data"
import { cn } from "@/lib/utils"

const TABS: { id: "all" | ApplicantType; label: string }[] = [
  { id: "all", label: "All products" },
  { id: "business", label: "Business / MSME" },
  { id: "individual", label: "Individuals" },
]

export function ProductsSection() {
  const [tab, setTab] = useState<"all" | ApplicantType>("all")
  const list = PRODUCTS.filter((p) => tab === "all" || p.seg === tab)
  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div role="tablist" className="inline-flex flex-wrap gap-1 rounded-xl border bg-subtle p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn("rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors", tab === t.id && "bg-white text-navy shadow-sm")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <Link
            key={p.id}
            href={`/loans/${p.id}`}
            className="group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-trust-blue/40 hover:shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-info-soft/60 text-navy-pressed"><p.icon className="size-5" /></span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase", p.seg === "business" ? "bg-gold-soft text-gold-ink" : "bg-subtle text-info")}>
                {p.seg === "business" ? "Business" : "Individual"}
              </span>
            </div>
            <h3 className="text-base font-semibold">{p.name}</h3>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">{p.desc}</p>
            <div className="mt-auto flex items-center justify-between border-t border-dashed pt-3 text-xs text-muted-foreground">
              <span>From <b className="text-navy">{p.rate}</b></span>
              <span>Up to <b className="text-navy">{p.max}</b></span>
              <ArrowRight className="size-4 text-trust-blue transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
