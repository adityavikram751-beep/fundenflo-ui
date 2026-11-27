import Link from "next/link"
import { ChevronRight } from "lucide-react"

/** Navy page header used on inner pages; content below overlaps it via -mt */
export function PageHero({ eyebrow, title, sub, crumb, children }: { eyebrow?: string; title: string; sub?: string; crumb: string; children?: React.ReactNode }) {
  return (
    <section className="ff-navy-grad relative overflow-hidden pt-9 pb-24 text-white">
      <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -top-24 -right-24 size-[360px] rounded-full border border-white/10" />
      <div className="ff-container relative">
        <nav className="mb-3 flex items-center gap-1 text-xs text-[#9fb0d0]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">Home</Link> <ChevronRight className="size-3" /> <span className="text-[#c9d4e3]">{crumb}</span>
        </nav>
        {eyebrow && <span className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-gold uppercase">{eyebrow}</span>}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-white md:text-4xl">{title}</h1>
            {sub && <p className="mt-2 text-[#c9d4e3]">{sub}</p>}
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}
