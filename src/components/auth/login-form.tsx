"use client"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, CircleCheck, LoaderCircle, Lock, MessageSquareText, PencilLine, Smartphone, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { isValidMobile, knownUser, maskPhone, signIn } from "@/lib/auth"
import type { User } from "@/lib/store"
import { cn } from "@/lib/utils"

type Step = "phone" | "otp" | "profile"
const RESEND_SECS = 30
const MAX_TRIES = 3

/** Phone → OTP → (new users) name & consent. Demo: the OTP arrives as an on-screen "SMS". */
export function LoginForm({ onDone, reason, className }: { onDone: (u: User, isNew: boolean) => void; reason?: string; className?: string }) {
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState(true)
  const [otp, setOtp] = useState("")
  const [code, setCode] = useState("")
  const [sms, setSms] = useState(false)
  const [left, setLeft] = useState(0)
  const [tries, setTries] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(true)
  const phoneRef = useRef<HTMLInputElement>(null)
  const otpRef = useRef<HTMLInputElement>(null)

  // resend countdown
  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [left])

  const fail = (msg: string) => {
    setErr(msg); setShake(true)
    setTimeout(() => setShake(false), 450)
  }

  const sendOtp = (resend = false) => {
    if (!isValidMobile(phone)) return fail("Enter a valid 10-digit Indian mobile number (starts with 6–9).")
    setErr(null); setBusy(true); setSms(false)
    setTimeout(() => {
      const c = String(Math.floor(100000 + Math.random() * 900000))
      setCode(c); setOtp(""); setTries(0); setLeft(RESEND_SECS); setBusy(false); setStep("otp")
      setTimeout(() => setSms(true), resend ? 600 : 1200) // the "SMS" lands a moment later
    }, 900)
  }

  const verify = (value = otp) => {
    if (value.length < 6) return fail("Enter all 6 digits of the OTP.")
    setBusy(true); setErr(null)
    setTimeout(() => {
      setBusy(false)
      if (value !== code) {
        const t = tries + 1
        setTries(t); setOtp("")
        setTimeout(() => otpRef.current?.focus(), 0) // keep the cursor in the OTP boxes for a retry
        return fail(t >= MAX_TRIES ? "Too many wrong attempts. Please request a new OTP." : `Incorrect OTP. ${MAX_TRIES - t} attempt${MAX_TRIES - t > 1 ? "s" : ""} left.`)
      }
      const known = knownUser(phone)
      if (known) onDone(signIn(phone, known.name, known.email), false)
      else setStep("profile")
    }, 700)
  }

  const finish = () => {
    if (name.trim().length < 2) return fail("Please enter your full name.")
    if (!consent) return fail("Please accept the consent to continue.")
    onDone(signIn(phone, name.trim(), email.trim() || undefined), true)
  }

  return (
    <div className={cn("w-full", className)}>
      {/* progress dots */}
      <div className="mb-6 flex items-center gap-2" aria-hidden>
        {(["phone", "otp", "profile"] as Step[]).map((s, i) => (
          <span key={s} className={cn("h-1.5 rounded-full transition-all", step === s ? "w-8 bg-gold" : i < ["phone", "otp", "profile"].indexOf(step) ? "w-4 bg-success" : "w-4 bg-track")} />
        ))}
      </div>

      {step === "phone" && (
        <form onSubmit={(e) => { e.preventDefault(); sendOtp() }} className="animate-in fade-in">
          <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-info-soft/60 text-navy-pressed"><Smartphone className="size-6" /></span>
          <h2 className="text-2xl font-bold">Login or sign up</h2>
          <p className="mt-1 text-sm text-muted-foreground">{reason ?? "Enter your mobile number — we'll send you a one-time password."}</p>

          <label htmlFor="login-phone" className="mt-6 mb-1.5 block text-sm font-semibold text-navy">Mobile number</label>
          <div className={cn("flex h-12 overflow-hidden rounded-xl border-[1.5px] border-input bg-white focus-within:border-trust-blue focus-within:ring-3 focus-within:ring-trust-blue/15", shake && "animate-[shake_.4s]", err && "border-destructive")}>
            <span className="flex items-center gap-1.5 border-r bg-subtle px-3 text-sm font-semibold text-navy">+91</span>
            <input
              ref={phoneRef}
              id="login-phone"
              autoFocus
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErr(null) }}
              className="ff-num flex-1 bg-transparent px-3 text-base font-semibold tracking-wider text-navy outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
            />
            {isValidMobile(phone) && <CircleCheck className="mr-3 size-5 self-center text-success" />}
          </div>
          {err && <p role="alert" className="mt-2 text-sm text-destructive">{err}</p>}

          <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
            <Checkbox checked={whatsapp} onCheckedChange={(v) => setWhatsapp(v === true)} />
            Get loan updates on <b className="font-semibold text-[#128c4b]">WhatsApp</b>
          </label>

          <Button type="submit" disabled={busy} className="mt-6 h-12 w-full rounded-xl bg-gold text-base font-bold text-navy hover:bg-[#ffc727]">
            {busy ? <><LoaderCircle className="animate-spin" /> Sending OTP…</> : <>Get OTP <ArrowRight /></>}
          </Button>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Lock className="mt-0.5 size-3.5 shrink-0" /> By continuing you agree to FundenFlo&apos;s Terms of Use & Privacy Policy. We never share your number without consent.
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={(e) => { e.preventDefault(); verify() }} className="animate-in fade-in">
          <button type="button" onClick={() => { setStep("phone"); setErr(null); setSms(false) }} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-navy">
            <ArrowLeft className="size-4" /> Back
          </button>
          <h2 className="text-2xl font-bold">Verify your number</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the 6-digit OTP sent to <b className="ff-num text-navy">{maskPhone(phone)}</b>
            <button type="button" onClick={() => { setStep("phone"); setSms(false) }} className="ml-1.5 inline-flex items-center gap-0.5 font-semibold text-trust-blue hover:underline"><PencilLine className="size-3.5" /> Edit</button>
          </p>

          {/* simulated incoming SMS (demo) */}
          <div className={cn("mt-5 overflow-hidden transition-all duration-500", sms ? "max-h-40 opacity-100" : "max-h-0 opacity-0")}>
            <div className="flex items-start gap-3 rounded-xl border border-[#c9dbf7] bg-info-soft/40 p-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy text-gold"><MessageSquareText className="size-4" /></span>
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground"><b className="text-navy">VM-FUNDFL</b><span>now · demo SMS</span></div>
                <p className="mt-0.5 text-navy"><b className="ff-num tracking-wider">{code}</b> is your FundenFlo login OTP. Valid for 10 minutes. Do not share it with anyone.</p>
              </div>
            </div>
            <button type="button" onClick={() => { setOtp(code); verify(code) }} className="mt-2 text-xs font-semibold text-trust-blue hover:underline">Auto-fill from SMS</button>
          </div>

          <div className={cn("mt-5 flex justify-center sm:justify-start", shake && "animate-[shake_.4s]")}>
            <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={otp} ref={otpRef} onChange={(v) => { if (busy) return; setOtp(v); setErr(null); if (v.length === 6 && tries < MAX_TRIES) verify(v) }} autoFocus disabled={tries >= MAX_TRIES} aria-label="One-time password">
              <InputOTPGroup className="gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} aria-invalid={!!err} className="ff-num size-12 rounded-xl border-[1.5px] font-heading text-xl font-bold text-navy first:rounded-xl last:rounded-xl data-[active=true]:border-trust-blue data-[active=true]:ring-trust-blue/20 sm:size-13" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {err && <p role="alert" className="mt-3 text-sm text-destructive">{err}</p>}

          <Button type="submit" disabled={busy || otp.length < 6 || tries >= MAX_TRIES} className="mt-6 h-12 w-full rounded-xl text-base font-semibold">
            {busy ? <><LoaderCircle className="animate-spin" /> Verifying…</> : <>Verify & continue <ArrowRight /></>}
          </Button>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {left > 0 ? (
              <>Didn&apos;t get it? Resend in <b className="ff-num text-navy">00:{String(left).padStart(2, "0")}</b></>
            ) : (
              <span className="inline-flex gap-4">
                <button type="button" onClick={() => sendOtp(true)} className="font-semibold text-trust-blue hover:underline">Resend OTP</button>
                <button type="button" onClick={() => sendOtp(true)} className="font-semibold text-[#128c4b] hover:underline">Get OTP on WhatsApp</button>
              </span>
            )}
          </div>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={(e) => { e.preventDefault(); finish() }} className="animate-in fade-in">
          <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-success-soft text-success"><UserRound className="size-6" /></span>
          <h2 className="text-2xl font-bold">Almost done!</h2>
          <p className="mt-1 text-sm text-muted-foreground"><CircleCheck className="mr-1 inline size-4 text-success" />{maskPhone(phone)} verified. Tell us your name to set up your account.</p>
          <div className="mt-6 grid gap-4">
            <div>
              <label htmlFor="login-name" className="mb-1.5 block text-sm font-semibold text-navy">Full name (as per PAN)</label>
              <Input id="login-name" autoFocus value={name} onChange={(e) => { setName(e.target.value); setErr(null) }} placeholder="e.g. Priya Nair" className="h-12 rounded-xl bg-white text-base" />
            </div>
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-navy">Email <span className="font-normal text-muted-foreground">(optional)</span></label>
              <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 rounded-xl bg-white text-base" />
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border bg-background p-3.5 text-xs leading-relaxed text-muted-foreground">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
              <span>I authorise FundenFlo and its lending partners to fetch my credit report (soft check — no impact on my score) and contact me about loan offers via call, SMS, email or WhatsApp.</span>
            </label>
          </div>
          {err && <p role="alert" className="mt-3 text-sm text-destructive">{err}</p>}
          <Button type="submit" className="mt-6 h-12 w-full rounded-xl bg-gold text-base font-bold text-navy hover:bg-[#ffc727]">Create account & continue <ArrowRight /></Button>
        </form>
      )}
    </div>
  )
}
