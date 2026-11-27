import Image from "next/image"
import Link from "next/link"
import { Mail } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="no-print mt-12 bg-navy text-sm text-[#a9b6cf] sm:mt-16">
      <div className="ff-container grid gap-8 py-10 sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Image src="/brand/logo-white.png" alt="FundenFlo" width={160} height={36} className="mb-4 h-9 w-[160px]" />
          <p className="max-w-xs leading-relaxed">A clearer path to capital. Loan advisory for MSMEs, businesses and individuals across a network of 50+ banks & NBFCs.</p>
          <a href="mailto:grow@fundenflo.com" className="mt-4 inline-flex items-center gap-2 normal-case text-white hover:text-gold"><Mail className="size-4" /> grow@fundenflo.com</a>
        </div>
        <div>
          <h4 className="mb-3 text-white">Business / MSME</h4>
          {[["Business Loan", "business"], ["Loan Against Property", "lap"], ["OD / CC Limit", "od"], ["Machinery Loan", "machinery"], ["Bill Discounting", "bill"]].map(([t, id]) => (
            <Link key={id} href={`/loans/${id}`} className="block py-1 hover:text-white">{t}</Link>
          ))}
        </div>
        <div>
          <h4 className="mb-3 text-white">Individuals</h4>
          {[["Home Loan", "home"], ["Personal Loan", "personal"], ["Auto Loan", "auto"], ["Education Loan", "education"], ["Professional Loan", "professional"]].map(([t, id]) => (
            <Link key={id} href={`/loans/${id}`} className="block py-1 hover:text-white">{t}</Link>
          ))}
        </div>
        <div>
          <h4 className="mb-3 text-white">Company & Tools</h4>
          <Link href="/apply" className="block py-1 hover:text-white">Check My Score</Link>
          <Link href="/assess" className="block py-1 hover:text-white">Smart Credit Assessment</Link>
          <Link href="/loans" className="block py-1 hover:text-white">Compare Loans</Link>
          <Link href="/about" className="block py-1 hover:text-white">About Us</Link>
          <Link href="/contact" className="block py-1 hover:text-white">Contact</Link>
          <Link href="/tools" className="block py-1 hover:text-white">EMI Calculator</Link>
          <Link href="/tools#eligibility" className="block py-1 hover:text-white">Eligibility Calculator</Link>
          <Link href="/dashboard" className="block py-1 hover:text-white">My Dashboard</Link>
        </div>
      </div>
      <div className="ff-container flex flex-wrap justify-between gap-4 border-t border-white/10 py-5 text-xs">
        <span>© FundenFlo. All rights reserved.</span>
        <span>Demo build — scores and offers are illustrative, not a loan sanction.</span>
      </div>
    </footer>
  )
}
