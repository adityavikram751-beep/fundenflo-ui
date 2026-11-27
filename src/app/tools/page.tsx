import { PageHero } from "@/components/page-hero"
import { EmiCalculator } from "@/components/tools/emi-calculator"
import { EligibilityCalculator } from "@/components/tools/eligibility-calculator"

export const metadata = { title: "EMI & Eligibility Calculators | FundenFlo" }

export default function ToolsPage() {
  return (
    <>
      <PageHero crumb="EMI Tools" eyebrow="Free Tools" title="EMI & Eligibility Calculators" sub="Plan before you borrow — see your EMI, total interest and how much you can borrow." />
      <div className="ff-container relative -mt-12 grid gap-6 pb-10 sm:-mt-16">
        <EmiCalculator />
        <EligibilityCalculator />
      </div>
    </>
  )
}
