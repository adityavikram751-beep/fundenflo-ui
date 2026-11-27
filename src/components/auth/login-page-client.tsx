"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CircleCheck, LayoutDashboard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/auth/login-form"
import { toast } from "@/components/toaster"
import { maskPhone, signOut, useAuth } from "@/lib/auth"

export function LoginPageClient({ next }: { next: string }) {
  const router = useRouter()
  const { user, ready } = useAuth()
  const [justLoggedIn, setJustLoggedIn] = useState(false) // keeps the form from flashing "already logged in" while redirecting

  if (!ready) return <div className="h-96 w-full animate-pulse rounded-xl bg-subtle" />

  if (user && !justLoggedIn) {
    return (
      <div className="w-full text-center">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-success-soft text-success"><CircleCheck className="size-7" /></span>
        <h2 className="text-2xl font-bold">You&apos;re logged in</h2>
        <p className="mt-1 text-muted-foreground">{user.name} · <span className="ff-num">{maskPhone(user.phone)}</span></p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="h-11 rounded-xl px-5"><Link href={next}><LayoutDashboard /> Continue</Link></Button>
          <Button variant="outline" className="h-11 rounded-xl px-5" onClick={() => { signOut(); toast("Logged out") }}><LogOut /> Use another number</Button>
        </div>
      </div>
    )
  }

  return (
    <LoginForm
      onDone={(u, isNew) => {
        setJustLoggedIn(true)
        toast(isNew ? `Welcome to FundenFlo, ${u.name.split(" ")[0]}!` : `Welcome back, ${u.name.split(" ")[0]}!`)
        router.replace(next)
      }}
    />
  )
}
