import { PageHero } from "@/components/page-hero"
import { ResultView } from "@/components/report/result-view"
import { AuthGate } from "@/components/auth/auth-gate"

export const metadata = { title: "Your FundenFlo Score Report | FundenFlo" }

export default function ResultPage() {
  return (
    <>
      <PageHero crumb="Score Report" eyebrow="AI Assessment" title="Your FundenFlo Score Report" sub="Your score, why it is what it is, how to improve it — and the lenders most likely to say yes." />
      <div className="ff-container relative -mt-12 pb-10 sm:-mt-16">
        <AuthGate title="Login Required To View Your Score Report" sub="Your FundenFlo Score, the reasons behind it and your matched offers are private. Verify your mobile number to continue.">
          <ResultView />
        </AuthGate>
      </div>
    </>
  )
}
