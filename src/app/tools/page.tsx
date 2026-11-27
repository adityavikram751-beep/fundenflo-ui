import { PageHero } from "@/components/page-hero"
import { EmiCalculator } from "@/components/tools/emi-calculator"
import { EligibilityCalculator } from "@/components/tools/eligibility-calculator"

export const metadata = { title: "EMI & eligibility calculators | FundenFlo" }

export default function ToolsPage() {
  return (
    <>
      <PageHero crumb="EMI tools" eyebrow="Free tools" title="EMI & eligibility calculators" sub="Plan before you borrow — see your EMI, total interest and how much you can borrow." />
      <div className="ff-container relative -mt-16 grid gap-6 pb-10">
        <EmiCalculator />
        <EligibilityCalculator />
      </div>
    </>
  )
}
