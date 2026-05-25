"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Widget, Record, User, Settings } from "@solar-icons/react"
import { cn } from "@/lib/utils"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"
import { StrengthEffect } from "@/components/effects/strength-effect"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/spaces", label: "Spaces", icon: Widget },
  { href: "/circles", label: "Circles", icon: Record },
  { href: "/profile", label: "Profile", icon: User },
]

export function AppShell({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const pathname = usePathname()
  useRealtimeNotifications(userId)

  return (
    <div className="flex min-h-screen">
      <StrengthEffect />
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 border-r bg-sidebar">
        <div className="flex items-center h-14 px-5 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-brand">
            <img src="/brand-asset/logo-mark.svg" alt="" className="h-6 w-6" />
            HoldMe
          </Link>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-brand"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t px-3 py-3">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-sidebar-accent text-brand"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </aside>

      <div className="flex flex-col flex-1 md:pl-56">
        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
          <div className="flex items-center justify-around h-16 px-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "text-brand"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
