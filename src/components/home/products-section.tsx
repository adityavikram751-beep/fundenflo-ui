"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PRODUCTS, type ApplicantType } from "@/lib/data"
import { cn } from "@/lib/utils"

const TABS: { id: "all" | ApplicantType; label: string }[] = [
  { id: "all", label: "All Products" },
  { id: "business", label: "Business / MSME" },
  { id: "individual", label: "Individuals" },
]

export function ProductsSection() {
  const [tab, setTab] = useState<"all" | ApplicantType>("all")
  const list = PRODUCTS.filter((p) => tab === "all" || p.seg === tab)
  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div role="tablist" className="grid w-full max-w-md grid-cols-3 gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-xs sm:inline-flex sm:w-auto sm:max-w-none">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn("truncate rounded-full px-2.5 py-2 text-xs font-semibold text-muted-foreground transition-all sm:px-5 sm:text-sm", tab === t.id && "bg-trust-blue text-white shadow-xs")}
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
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-trust-blue/50 hover:shadow-[0_16px_36px_-10px_rgb(29_78_158/0.16)]"
          >
            <span className={cn("absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100", p.seg === "business" ? "bg-gold" : "bg-trust-blue")} />
            <div className="mb-4 flex items-start justify-between">
              <span className={cn("grid size-11 place-items-center rounded-xl ring-1 ring-inset transition-colors", p.seg === "business" ? "bg-amber-50 text-gold-ink ring-amber-200/70 group-hover:bg-navy group-hover:text-gold" : "bg-blue-50 text-trust-blue ring-blue-200/70 group-hover:bg-trust-blue group-hover:text-white")}><p.icon className="size-5" /></span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase", p.seg === "business" ? "bg-gold-soft text-gold-ink" : "bg-info-soft/60 text-trust-blue")}>
                {p.seg === "business" ? "Business" : "Individual"}
              </span>
            </div>
            <h3 className="text-base font-semibold text-navy group-hover:text-trust-blue">{p.name}</h3>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">{p.desc}</p>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-muted-foreground">
              <span>From <b className="text-navy">{p.rate}</b></span>
              <span>Up To <b className="text-navy">{p.max}</b></span>
              <ArrowRight className="size-4 text-trust-blue transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
