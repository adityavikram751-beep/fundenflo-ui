import { Dashboard } from "@/components/dashboard/dashboard"
import { AuthGate } from "@/components/auth/auth-gate"

export const metadata = { title: "My Dashboard | FundenFlo" }

export default function DashboardPage() {
  return (
    <AuthGate lockedClassName="ff-container py-8" title="Login Required To Open Your Dashboard" sub="Track your score, applications, documents and offers. Login with your mobile number.">
      <Dashboard />
    </AuthGate>
  )
}
