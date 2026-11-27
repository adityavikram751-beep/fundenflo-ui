"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { LoginForm } from "@/components/auth/login-form"
import { LoginSide } from "@/components/auth/login-side"
import { toast } from "@/components/toaster"
import { takePendingLoginAction } from "@/lib/auth"

/** Global "login required" popup — opened via requestLogin() / withLogin() */
export function LoginDialog() {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<string | undefined>()
  const [key, setKey] = useState(0)

  useEffect(() => {
    const on = (e: Event) => {
      setReason((e as CustomEvent<string | undefined>).detail)
      setKey((k) => k + 1) // fresh form each time
      setOpen(true)
    }
    window.addEventListener("ff-login-open", on)
    return () => window.removeEventListener("ff-login-open", on)
  }, [])

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) takePendingLoginAction() }}>
      <DialogContent className="max-h-[95vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        <DialogTitle className="sr-only">Login to FundenFlo</DialogTitle>
        <DialogDescription className="sr-only">Login with your mobile number and OTP</DialogDescription>
        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <LoginSide compact className="hidden md:flex" />
          <div className="p-7 sm:p-9">
            <LoginForm
              key={key}
              reason={reason}
              onDone={(u, isNew) => {
                setOpen(false)
                toast(isNew ? `Welcome to FundenFlo, ${u.name.split(" ")[0]}!` : `Welcome back, ${u.name.split(" ")[0]}!`)
                const next = takePendingLoginAction()
                if (next) setTimeout(next, 250)
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
