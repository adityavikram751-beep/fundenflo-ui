import Link from "next/link"
import { Clock, Mail, MessageCircle, Mic } from "lucide-react"
import { PageHero } from "@/components/page-hero"
import { Card, CardContent } from "@/components/ui/card"
import { ContactForm } from "@/components/contact-form"

export const metadata = { title: "Contact us | FundenFlo" }

const SOCIAL = [
  ["LinkedIn", "https://www.linkedin.com/company/fundenflo"],
  ["Instagram", "https://www.instagram.com/fundenflo"],
  ["YouTube", "https://www.youtube.com/@Fundenflo"],
  ["Facebook", "https://www.facebook.com/profile.php?id=61589473495183"],
]

export default function ContactPage() {
  return (
    <>
      <PageHero crumb="Contact" eyebrow="Get in touch" title="Talk to a FundenFlo advisor" sub="Share your requirement and we'll call you back — or chat with Flo, our AI assistant, any time." />
      <div className="ff-container relative -mt-16 grid items-start gap-6 pb-10 lg:grid-cols-[1.3fr_0.7fr]">
        <ContactForm />
        <div className="grid gap-4">
          <Card>
            <CardContent className="grid gap-5">
              <a href="mailto:grow@fundenflo.com" className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-info-soft/60 text-navy-pressed"><Mail className="size-5" /></span>
                <div><div className="text-sm font-semibold text-navy">Email us</div><div className="text-sm text-trust-blue">grow@fundenflo.com</div></div>
              </a>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold-ink"><Clock className="size-5" /></span>
                <div><div className="text-sm font-semibold text-navy">Advisor hours</div><div className="text-sm text-muted-foreground">Mon–Sat · 9:30 AM – 7:00 PM</div></div>
              </div>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-soft text-success"><MessageCircle className="size-5" /></span>
                <div><div className="text-sm font-semibold text-navy">Chat 24×7</div><div className="text-sm text-muted-foreground">Ask Flo — bottom-right of every page</div></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-navy text-white ring-0">
            <CardContent className="grid gap-3">
              <div className="flex items-center gap-2 font-heading font-semibold text-gold"><Mic className="size-4" /> Faster than a form</div>
              <p className="text-sm text-[#c9d4e3]">Speak your requirement and get a credit assessment instantly — no waiting for a callback.</p>
              <Link href="/assess" className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-sm font-bold text-navy hover:bg-[#ffc727]">Try Smart Assessment →</Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">Follow us</div>
              <div className="flex flex-wrap gap-2">
                {SOCIAL.map(([n, href]) => <a key={n} href={href} target="_blank" rel="noopener noreferrer" className="rounded-full border px-3 py-1.5 text-sm font-medium text-navy hover:border-trust-blue hover:bg-subtle">{n}</a>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
