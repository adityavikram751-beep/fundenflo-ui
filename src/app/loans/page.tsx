import Link from "next/link"
import { Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHero } from "@/components/page-hero"
import { LoanExplorer } from "@/components/loans/loan-explorer"

export const metadata = { title: "All loans — business & personal | FundenFlo" }

export default function LoansPage() {
  return (
    <>
      <PageHero crumb="Loans" eyebrow="13 products · 50+ lenders" title="Find the right loan for every need" sub="Business finance for MSMEs and retail loans for individuals — compare rates, limits and tenures, then check your eligibility in minutes.">
        <Button asChild className="h-11 rounded-xl bg-gold px-5 font-bold text-navy hover:bg-[#ffc727]">
          <Link href="/assess"><Mic /> Not sure? Just tell us</Link>
        </Button>
      </PageHero>
      <div className="ff-container relative -mt-16 pb-10">
        <LoanExplorer />
      </div>
    </>
  )
}
