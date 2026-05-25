import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { LayoutDashboard, Users, AlertTriangle, BarChart3 } from "lucide-react"

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: AlertTriangle },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/dashboard")
  }

  // Check admin status via user metadata or a dedicated admin table
  const isAdmin = user.user_metadata?.is_admin === true

  if (!isAdmin) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-56 border-r flex-col bg-muted/30">
        <div className="p-4 border-b">
          <span className="text-lg font-bold text-brand">HoldMe</span>
          <span className="text-xs text-muted-foreground ml-2">Admin</span>
        </div>
        <nav className="p-2 space-y-1 flex-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
