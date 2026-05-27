"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, AddCircle, ArrowLeft } from "@solar-icons/react"
import { Button } from "@/components/ui/button"
import { useUnreadCount } from "@/hooks/use-unread-count"
import { cn } from "@/lib/utils"

interface TopBarProps {
  title?: string
  showCreate?: boolean
  showBack?: boolean
}

export function TopBar({ title = "HoldMe", showCreate = true, showBack = false }: TopBarProps) {
  const router = useRouter()
  const unreadCount = useUnreadCount()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between h-14 px-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-bold text-brand md:hidden">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {showCreate && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/spaces/new">
                <AddCircle className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span
                  className={cn(
                    "absolute flex items-center justify-center rounded-full bg-red-500 text-white font-bold ring-2 ring-background",
                    unreadCount > 9
                      ? "top-0.5 -right-0.5 h-[18px] min-w-[18px] px-1 text-[9px]"
                      : unreadCount > 0
                        ? "top-0.5 right-0.5 h-[16px] min-w-[16px] text-[10px]"
                        : ""
                  )}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
