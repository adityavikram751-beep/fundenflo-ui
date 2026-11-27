import { Suspense } from "react"
import { LoginPageClient } from "@/components/auth/login-page-client"
import { LoginSide } from "@/components/auth/login-side"

export const metadata = { title: "Login | FundenFlo" }

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <section className="ff-hero-bg py-10 lg:py-14">
      <div className="ff-container">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border bg-white shadow-[0_24px_60px_rgb(10_25_47/0.12)] lg:grid-cols-[1fr_1fr]">
          <LoginSide className="hidden min-h-[620px] lg:flex" />
          <div className="flex items-center p-7 sm:p-12">
            <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-xl bg-subtle" />}>
              <NextFromParams searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}

async function NextFromParams({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const sp = await searchParams
  // only allow same-site relative redirects
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/dashboard"
  return <LoginPageClient next={next} />
}
