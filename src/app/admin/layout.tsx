import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Widget, UsersGroupTwoRounded, DangerTriangle, ChartSquare } from "@solar-icons/react"

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: Widget },
  { href: "/admin/users", label: "Users", icon: UsersGroupTwoRounded },
  { href: "/admin/reports", label: "Reports", icon: DangerTriangle },
  { href: "/admin/analytics", label: "Analytics", icon: ChartSquare },
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
        <div className="flex items-center gap-2 p-4 border-b">
          <img src="/brand-asset/logo-mark.svg" alt="" className="h-6 w-6" />
          <span className="text-lg font-bold text-brand">HoldMe</span>
          <span className="text-xs text-muted-foreground">Admin</span>
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
