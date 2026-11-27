import { PageHero } from "@/components/page-hero"
import { SmartAssessment } from "@/components/assess/smart-assessment"
import { RequireLogin } from "@/components/auth/require-login"

export const metadata = { title: "Smart Credit Assessment — Speak Or Write | FundenFlo" }

export default function AssessPage() {
  return (
    <>
      <PageHero
        crumb="Smart Credit Assessment"
        eyebrow="New · Voice & Text"
        title="Just Tell Us. We'll Build Your Credit Assessment."
        sub="Speak or write about your business and loan need — in English or Hindi. Then upload your balance sheets and bank statements to verify it and boost your score."
      />
      <div className="ff-container relative -mt-12 pb-10 sm:-mt-16">
        <RequireLogin>
          <SmartAssessment />
        </RequireLogin>
      </div>
    </>
  )
}
