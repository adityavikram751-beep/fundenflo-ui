import { Suspense } from "react"
import { PageHero } from "@/components/page-hero"
import { ApplyWizard } from "@/components/apply/apply-wizard"
import { Card } from "@/components/ui/card"

export const metadata = { title: "Apply for a loan | FundenFlo" }

export default function ApplyPage({ searchParams }: PageProps<"/apply">) {
  return (
    <>
      <PageHero
        crumb="Apply for loan"
        eyebrow="2-minute application"
        title="Check eligibility & get your FundenFlo Score"
        sub="Four quick steps. Soft check only — no impact on your CIBIL. Use “Fill demo data” to try it instantly."
      />
      <div className="ff-container relative -mt-16 pb-10">
        {/* searchParams are request-time data: stream the wizard so the page shell stays prerendered */}
        <Suspense fallback={<Card className="h-[520px] animate-pulse" />}>
          <WizardFromParams searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  )
}

async function WizardFromParams({ searchParams }: { searchParams: PageProps<"/apply">["searchParams"] }) {
  const sp = await searchParams
  const type = sp.type === "business" || sp.type === "individual" ? sp.type : undefined
  const product = typeof sp.product === "string" ? sp.product : undefined
  return <ApplyWizard initialType={type} initialProduct={product} />
}
