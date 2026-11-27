import Link from "next/link"
import { Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHero } from "@/components/page-hero"
import { LoanExplorer } from "@/components/loans/loan-explorer"

export const metadata = { title: "All Loans — Business & Personal | FundenFlo" }

export default function LoansPage() {
  return (
    <>
      <PageHero crumb="Loans" eyebrow="13 Products · 50+ Lenders" title="Find The Right Loan For Every Need" sub="Business finance for MSMEs and retail loans for individuals — compare rates, limits and tenures, then check your eligibility in minutes.">
        <Button asChild className="h-11 rounded-xl bg-gold px-5 font-bold text-navy hover:bg-[#ffc727]">
          <Link href="/assess"><Mic /> Not Sure? Just Tell Us</Link>
        </Button>
      </PageHero>
      <div className="ff-container relative -mt-12 pb-10 sm:-mt-16">
        <LoanExplorer />
      </div>
    </>
  )
}
