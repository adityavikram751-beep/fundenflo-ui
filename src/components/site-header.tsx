"use client"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ArrowRight, Calculator, ChevronDown, FileText, Gauge, House, Info, LayoutDashboard, Lock, LogIn, LogOut, Mail, Menu, Mic, ShieldCheck, Sparkles, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/toaster"
import { maskPhone, signOut, useAuth } from "@/lib/auth"
import { PRODUCTS, initials } from "@/lib/data"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export const NAV: { href: string; label: string; icon: typeof House; badge?: string }[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/loans", label: "Loans", icon: Wallet },
  { href: "/assess", label: "Smart Assessment", icon: Mic, badge: "NEW" },
  { href: "/tools", label: "EMI Tools", icon: Calculator },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
]
const linkCls = "inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-navy transition-colors hover:bg-subtle"

export function SiteHeader() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const { user, ready } = useAuth()
  const loginHref = path === "/login" ? "/login" : `/login?next=${encodeURIComponent(path)}`
  const logout = () => { signOut(); toast("You have been logged out") }
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href))

  return (
    <>
      <div className="no-print bg-navy text-xs text-[#c9d4e3]">
        <div className="ff-container flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-gold" /> RBI-regulated lending partners</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="size-3.5 text-gold" /> 256-bit encrypted</span>
            <span className="hidden items-center gap-1.5 sm:inline-flex"><Sparkles className="size-3.5 text-gold" /> Zero hidden fees</span>
          </div>
          <span className="font-semibold text-gold">Demo mode · sample data only</span>
        </div>
      </div>
      <header className="no-print sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md">
        <div className="ff-container flex h-[72px] items-center gap-6">
          <Link href="/" className="shrink-0" aria-label="FundenFlo home">
            <Image src="/brand/logo.png" alt="FundenFlo — The Right Funding, At the Right Time" width={178} height={40} priority className="h-10 w-[178px]" />
          </Link>
          <NavigationMenu viewport={false} className="ml-auto hidden xl:flex" aria-label="Main">
            <NavigationMenuList className="gap-0.5">
              {NAV.map((n) => n.href === "/loans" ? (
                <NavigationMenuItem key={n.href}>
                  <NavigationMenuTrigger className={cn(linkCls, "bg-transparent", isActive("/loans") && "bg-info-soft/60 text-navy-pressed")}>Loans</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <LoansMega />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={n.href}>
                  <NavigationMenuLink asChild>
                    <Link href={n.href} className={cn(linkCls, isActive(n.href) && "bg-info-soft/60 text-navy-pressed")}>
                      {n.label}
                      {n.badge && <span className="rounded bg-gold px-1.5 py-px text-[9px] font-extrabold tracking-wide text-navy">{n.badge}</span>}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <div className="hidden items-center gap-2 xl:flex">
            {ready && (user ? <UserMenu name={user.name} phone={user.phone} onLogout={logout} /> : (
              <Button asChild variant="outline" className="h-10 rounded-xl border-input px-4 font-semibold text-navy">
                <Link href={loginHref}><LogIn /> Login</Link>
              </Button>
            ))}
            <Button asChild className="h-10 rounded-xl bg-gold px-4 font-bold text-navy shadow-[0_6px_16px_rgb(253_185_1/0.3)] hover:bg-[#ffc727]">
              <Link href="/apply"><Gauge /> Check my score</Link>
            </Button>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="ml-auto xl:hidden" aria-label="Open menu"><Menu className="size-6" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Image src="/brand/logo.png" alt="FundenFlo" width={143} height={32} className="h-8 w-[143px]" />
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-1 px-4" aria-label="Mobile">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy hover:bg-subtle", isActive(n.href) && "bg-navy text-white hover:bg-navy")}
                  >
                    <n.icon className="size-4" /> {n.label}
                    {n.badge && <span className="ml-auto rounded bg-gold px-1.5 py-px text-[9px] font-extrabold text-navy">{n.badge}</span>}
                  </Link>
                ))}
              </nav>
              <div className="px-4">
                <Button asChild className="h-11 w-full rounded-xl bg-gold font-bold text-navy hover:bg-[#ffc727]"><Link href="/apply" onClick={() => setOpen(false)}><Gauge /> Check my score</Link></Button>
              </div>
              <div className="mt-2 border-t px-4 pt-4">
                {user ? (
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-navy text-xs font-bold text-gold">{initials(user.name)}</span>
                      <div><div className="text-sm font-semibold text-navy">{user.name}</div><div className="ff-num text-xs text-muted-foreground">{maskPhone(user.phone)}</div></div>
                    </div>
                    <Button asChild className="rounded-xl"><Link href="/dashboard" onClick={() => setOpen(false)}><LayoutDashboard /> My dashboard</Link></Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => { logout(); setOpen(false) }}><LogOut /> Logout</Button>
                  </div>
                ) : (
                  <Button asChild variant="outline" className="h-11 w-full rounded-xl font-semibold text-navy"><Link href={loginHref} onClick={() => setOpen(false)}><LogIn /> Login with mobile</Link></Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  )
}

function UserMenu({ name, phone, onLogout }: { name: string; phone: string; onLogout: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl border border-input bg-white py-1 pr-2.5 pl-1 text-sm font-semibold text-navy hover:bg-subtle" aria-label="Account menu">
          <span className="grid size-8 place-items-center rounded-lg bg-navy text-xs font-bold text-gold">{initials(name)}</span>
          <span className="max-w-28 truncate">{name.split(" ")[0]}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="text-sm font-semibold text-navy">{name}</div>
          <div className="ff-num text-xs font-normal text-muted-foreground">{maskPhone(phone)}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/dashboard"><LayoutDashboard /> My dashboard</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/result"><Gauge /> My score report</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/apply"><FileText /> Apply for a loan</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive"><LogOut /> Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LoansMega() {
  const col = (seg: "business" | "individual") => PRODUCTS.filter((p) => p.seg === seg)
  return (
    <div className="grid w-[760px] grid-cols-[1fr_1fr_220px] gap-2 p-3">
      {(["business", "individual"] as const).map((seg) => (
        <div key={seg}>
          <div className="px-2 pt-1 pb-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">{seg === "business" ? "Business / MSME" : "Individuals"}</div>
          {col(seg).map((p) => (
            <NavigationMenuLink key={p.id} asChild>
              <Link href={`/loans/${p.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-subtle">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-info-soft/60 text-navy-pressed"><p.icon className="size-4" /></span>
                <span className="min-w-0"><span className="block text-sm font-semibold text-navy">{p.name}</span><span className="block text-xs text-muted-foreground">From {p.rate}</span></span>
              </Link>
            </NavigationMenuLink>
          ))}
        </div>
      ))}
      <div className="ff-navy-grad flex flex-col rounded-xl p-4 text-white">
        <Mic className="size-6 text-gold" />
        <div className="mt-3 font-heading text-base font-semibold">Not sure which loan?</div>
        <p className="mt-1 text-xs text-[#c9d4e3]">Just tell us about your business — get a credit assessment in a minute.</p>
        <NavigationMenuLink asChild>
          <Link href="/assess" className="mt-auto inline-flex items-center gap-1 rounded-lg bg-gold px-3 py-2 text-xs font-bold text-navy hover:bg-[#ffc727]">Speak or write <ArrowRight className="size-3.5" /></Link>
        </NavigationMenuLink>
        <NavigationMenuLink asChild>
          <Link href="/loans" className="mt-2 text-xs font-semibold text-gold hover:underline">View & compare all loans →</Link>
        </NavigationMenuLink>
      </div>
    </div>
  )
}
