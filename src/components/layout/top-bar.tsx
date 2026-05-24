"use client"

import Link from "next/link"
import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopBarProps {
  title?: string
  showCreate?: boolean
}

export function TopBar({ title = "HoldMe", showCreate = true }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between h-14 px-4 max-w-4xl mx-auto">
        <h1 className="text-lg font-bold text-brand md:hidden">{title}</h1>
        <div className="flex items-center gap-2">
          {showCreate && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/spaces/new">
                <Plus className="h-5 w-5" />
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
