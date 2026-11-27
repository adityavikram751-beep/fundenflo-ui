"use client"
import { Lock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { toast } from "@/components/toaster"
import { useAuth } from "@/lib/auth"

/**
 * Shows `children` only to logged-in users. Otherwise shows a blurred preview of
 * what's behind the gate with the phone + OTP login form on top.
 */
export function AuthGate({ children, title, sub, preview, lockedClassName }: { children: React.ReactNode; title: string; sub: string; preview?: React.ReactNode; lockedClassName?: string }) {
  const { user, ready } = useAuth()
  if (!ready) return <div className={lockedClassName}><Card className="h-96 animate-pulse" /></div>
  if (user) return <>{children}</>

  return (
    <div className={lockedClassName}>
      <div className="relative min-h-[600px] overflow-hidden rounded-2xl sm:min-h-[640px]">
        <div aria-hidden className="pointer-events-none absolute inset-0 select-none blur-[6px] saturate-50">{preview ?? <FakePreview />}</div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background/90" />
        <div className="relative z-10 flex min-h-[600px] items-center justify-center p-3 py-6 sm:min-h-[640px] sm:items-start sm:p-6 sm:pt-12">
          <Card className="w-full max-w-md px-5 py-6 shadow-2xl sm:px-9 sm:py-7">
            <div className="-mt-1 mb-5 flex items-center gap-2 rounded-lg bg-gold-soft px-3 py-2 text-xs font-semibold text-gold-ink">
              <Lock className="size-3.5 shrink-0" /> {title}
            </div>
            <LoginForm reason={sub} onDone={(u, isNew) => toast(isNew ? `Welcome to FundenFlo, ${u.name.split(" ")[0]}!` : `Welcome back, ${u.name.split(" ")[0]}!`)} />
          </Card>
        </div>
      </div>
    </div>
  )
}

/** Generic score-report silhouette for the blurred background */
function FakePreview() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="grid h-72 place-items-center rounded-xl border bg-white">
          <div className="grid size-44 place-items-center rounded-full border-[18px] border-success/70 border-b-track font-heading text-5xl font-bold text-navy">7??</div>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-xl border bg-white p-5 xl:grid-cols-4">
          {["Eligible amount", "Interest rate", "Monthly EMI", "Approval chance"].map((k) => (
            <div key={k} className="rounded-xl bg-subtle p-4"><div className="text-xs text-muted-foreground uppercase">{k}</div><div className="mt-2 h-6 w-20 rounded bg-navy/20" /></div>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((c) => (
          <div key={c} className="grid gap-4 rounded-xl border bg-white p-6">
            {[80, 55, 92, 40, 70].map((w, i) => (
              <div key={i}><div className="mb-2 h-3 w-40 rounded bg-navy/15" /><div className="h-2.5 rounded-full bg-track"><div className="h-full rounded-full bg-chart-1/60" style={{ width: `${w}%` }} /></div></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
