"use client"
import { useState } from "react"
import { CircleCheck, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { isValidMobile } from "@/lib/auth"
import { cn } from "@/lib/utils"

const NEEDS = ["Business Loan", "Working Capital / OD", "Loan Against Property", "Machinery Loan", "Home Loan", "Personal Loan", "Something Else"]

/** Demo contact form — validates and shows a confirmation (no backend). */
export function ContactForm() {
  const [f, setF] = useState({ name: "", mobile: "", email: "", need: NEEDS[0], amount: "", msg: "" })
  const [err, setErr] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const set = (k: keyof typeof f, v: string) => { setF((s) => ({ ...s, [k]: v })); setErr(null) }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (f.name.trim().length < 2) return setErr("Please enter your name.")
    if (!isValidMobile(f.mobile)) return setErr("Please enter a valid 10-digit mobile number.")
    setSent(true)
  }

  if (sent) {
    return (
      <Card className="py-14">
        <CardContent className="mx-auto max-w-md text-center">
          <span className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-success-soft text-success"><CircleCheck className="size-8" /></span>
          <h2 className="text-2xl font-bold">Thanks, {f.name.split(" ")[0]}!</h2>
          <p className="mt-2 text-muted-foreground">An advisor will call you on <b className="text-navy">+91 {f.mobile}</b> within 2 working hours about your <b className="text-navy">{f.need.toLowerCase()}</b>. (Demo — no request was sent.)</p>
          <Button variant="outline" className="mt-6 rounded-xl" onClick={() => { setSent(false); setF({ name: "", mobile: "", email: "", need: NEEDS[0], amount: "", msg: "" }) }}>Send Another Request</Button>
        </CardContent>
      </Card>
    )
  }

  const field = "h-11 bg-white"
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl font-semibold text-navy">Request A Callback</CardTitle>
        <CardDescription>Free advice · no obligation · response within 2 working hours</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold text-navy">Full Name<Input className={field} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Your Name" /></label>
          <label className="grid gap-1.5 text-sm font-semibold text-navy">Mobile Number
            <div className="flex h-11 overflow-hidden rounded-lg border border-input bg-white focus-within:border-trust-blue">
              <span className="flex items-center border-r bg-subtle px-3 text-sm text-navy">+91</span>
              <input inputMode="numeric" maxLength={10} value={f.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, ""))} placeholder="98765 43210" className="ff-num min-w-0 flex-1 px-3 text-sm font-normal outline-none" />
            </div>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-navy">Email <span className="-mt-1.5 text-xs font-normal text-muted-foreground">(Optional)</span><Input type="email" className={field} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" /></label>
          <label className="grid gap-1.5 text-sm font-semibold text-navy">Approx. Amount <span className="-mt-1.5 text-xs font-normal text-muted-foreground">(Optional)</span><Input className={field} value={f.amount} onChange={(e) => set("amount", e.target.value)} placeholder="E.g. 50 lakh" /></label>
          <div className="grid gap-2 sm:col-span-2">
            <span className="text-sm font-semibold text-navy">What Do You Need?</span>
            <div className="flex flex-wrap gap-2">
              {NEEDS.map((n) => (
                <button type="button" key={n} onClick={() => set("need", n)} className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors", f.need === n ? "border-navy bg-navy text-white" : "border-input bg-white text-navy hover:border-trust-blue")}>{n}</button>
              ))}
            </div>
          </div>
          <label className="grid gap-1.5 text-sm font-semibold text-navy sm:col-span-2">Message <span className="-mt-1.5 text-xs font-normal text-muted-foreground">(Optional)</span>
            <Textarea value={f.msg} onChange={(e) => set("msg", e.target.value)} placeholder="Tell us a little about your business or requirement" className="min-h-28 bg-white font-normal" />
          </label>
          {err && <p role="alert" className="rounded-lg bg-error-soft px-3 py-2 text-sm text-destructive sm:col-span-2">{err}</p>}
          <Button type="submit" className="h-12 rounded-xl bg-gold text-base font-bold text-navy hover:bg-[#ffc727] sm:col-span-2"><Send /> Request Callback</Button>
        </form>
      </CardContent>
    </Card>
  )
}
