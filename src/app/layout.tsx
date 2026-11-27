import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ChatWidget } from "@/components/chat-widget"
import { Toaster } from "@/components/toaster"
import { LoginDialog } from "@/components/auth/login-dialog"
import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["500", "600", "700", "800"] })

export const metadata: Metadata = {
  title: "FundenFlo | A Clearer Path To Capital",
  description: "AI-powered loan advisory for MSMEs, businesses and individuals — check eligibility, get your FundenFlo Score and compare offers from 50+ banks & NBFCs.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <TooltipProvider delayDuration={150}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <ChatWidget />
          <LoginDialog />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}
