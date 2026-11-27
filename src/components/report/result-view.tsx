"use client"
import { useMemo } from "react"
import Link from "next/link"
import { CalendarDays, FileText, Gauge, PencilLine, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScoreReport } from "@/components/report/score-report"
import { productById } from "@/lib/data"
import { computeScore } from "@/lib/scoring"
import { KEYS, useStored, type SavedResult } from "@/lib/store"

export function ResultView() {
  const [saved, , ready] = useStored<SavedResult>(KEYS.result)
  const result = useMemo(() => (saved ? computeScore(saved.raw) : null), [saved])

  if (!ready) return <Card className="h-72 animate-pulse" />
  if (!saved || !result) {
    return (
      <Card className="py-14">
        <CardContent className="mx-auto max-w-lg text-center">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-subtle text-navy"><Gauge className="size-7" /></span>
          <h2 className="text-2xl font-bold">No Score Yet</h2>
          <p className="mt-2 text-muted-foreground">Fill the 2-minute application — your report will appear here.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="h-11 rounded-xl px-5"><Link href="/apply">Start Application</Link></Button>
            <Button asChild variant="outline" className="h-11 rounded-xl px-5"><Link href="/tools">EMI Calculator</Link></Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const p = result.profile
  return (
    <div className="grid gap-6">
      <Card className="py-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-navy"><User className="size-4 text-trust-blue" /> {p.name || "Applicant"}{p.businessName ? ` · ${p.businessName}` : ""}</span>
            <span className="inline-flex items-center gap-2 text-muted-foreground"><FileText className="size-4" /> {productById(p.product).name}</span>
            <span className="inline-flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" /> {new Date(saved.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
            <span className="rounded-full bg-subtle px-2.5 py-0.5 text-xs font-semibold text-navy">
              From Application Form
            </span>
          </div>
          <Button asChild variant="outline" size="sm" className="no-print">
            <Link href="/apply"><PencilLine /> Edit Details</Link>
          </Button>
        </CardContent>
      </Card>
      <ScoreReport result={result} />
    </div>
  )
}
