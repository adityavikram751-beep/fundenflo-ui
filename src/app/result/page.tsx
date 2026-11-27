import { PageHero } from "@/components/page-hero"
import { ResultView } from "@/components/report/result-view"
import { AuthGate } from "@/components/auth/auth-gate"

export const metadata = { title: "Your FundenFlo Score report | FundenFlo" }

export default function ResultPage() {
  return (
    <>
      <PageHero crumb="Score report" eyebrow="AI assessment" title="Your FundenFlo Score report" sub="Your score, why it is what it is, how to improve it — and the lenders most likely to say yes." />
      <div className="ff-container relative -mt-16 pb-10">
        <AuthGate title="Login required to view your score report" sub="Your FundenFlo Score, the reasons behind it and your matched offers are private. Verify your mobile number to continue.">
          <ResultView />
        </AuthGate>
      </div>
    </>
  )
}
