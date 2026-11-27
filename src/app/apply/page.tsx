import { Suspense } from "react"
import { PageHero } from "@/components/page-hero"
import { ApplyWizard } from "@/components/apply/apply-wizard"
import { RequireLogin } from "@/components/auth/require-login"
import { Card } from "@/components/ui/card"

export const metadata = { title: "Apply For A Loan | FundenFlo" }

export default function ApplyPage({ searchParams }: PageProps<"/apply">) {
  return (
    <>
      <PageHero
        crumb="Apply For Loan"
        eyebrow="2-Minute Application"
        title="Check Eligibility & Get Your FundenFlo Score"
        sub="Four quick steps. Soft check only — no impact on your CIBIL. Use “Fill demo data” to try it instantly."
      />
      <div className="ff-container relative -mt-12 pb-10 sm:-mt-16">
        <RequireLogin>
          {/* searchParams are request-time data: stream the wizard so the page shell stays prerendered */}
          <Suspense fallback={<Card className="h-[520px] animate-pulse" />}>
            <WizardFromParams searchParams={searchParams} />
          </Suspense>
        </RequireLogin>
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
