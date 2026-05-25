"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, AddCircle, ArrowLeft } from "@solar-icons/react"
import { Button } from "@/components/ui/button"

interface TopBarProps {
  title?: string
  showCreate?: boolean
  showBack?: boolean
}

export function TopBar({ title = "HoldMe", showCreate = true, showBack = false }: TopBarProps) {
  const router = useRouter()

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
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
