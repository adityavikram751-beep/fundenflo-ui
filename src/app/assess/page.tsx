import { PageHero } from "@/components/page-hero"
import { SmartAssessment } from "@/components/assess/smart-assessment"

export const metadata = { title: "Smart Credit Assessment — speak or write | FundenFlo" }

export default function AssessPage() {
  return (
    <>
      <PageHero
        crumb="Smart Credit Assessment"
        eyebrow="New · Voice & text"
        title="Just tell us. We'll build your credit assessment."
        sub="Speak or write about your business and loan need — in English or Hinglish. Then upload your balance sheets and bank statements to verify it and boost your score."
      />
      <div className="ff-container relative -mt-16 pb-10">
        <SmartAssessment />
      </div>
    </>
  )
}
