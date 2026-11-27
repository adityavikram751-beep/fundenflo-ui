"use client"
import { useEffect, type ComponentProps } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"

/** Builds `/login?next=...` for protected eligibility and score flows */
export const loginRedirectHref = (target: string) => `/login?next=${encodeURIComponent(target)}`

/** Sends logged-out visitors straight to `/login?next=...` before anything starts */
export function RequireLogin({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!ready || user) return
    const search = typeof window !== "undefined" ? window.location.search : ""
    router.replace(loginRedirectHref(`${pathname}${search}`))
  }, [ready, user, pathname, router])

  if (!ready || !user) {
    return (
      <Card className="grid h-[420px] place-items-center text-center">
        <div className="flex flex-col items-center gap-3 px-6">
          <LoaderCircle className="size-7 animate-spin text-trust-blue" />
          <p className="text-sm font-medium text-muted-foreground">Redirecting To Login…</p>
        </div>
      </Card>
    )
  }

  return <>{children}</>
}

/** Routes Check Eligibility / Check Score links straight to `/login?next=...` when signed out */
export function ProtectedLink({ href, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const { user, ready } = useAuth()
  const target = ready && user ? href : loginRedirectHref(href)
  return <Link href={target} {...props} />
}
