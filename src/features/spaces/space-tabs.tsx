"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SpaceTabsProps {
  myCount: number
  joinedCount: number
  myContent: React.ReactNode
  joinedContent: React.ReactNode
}

export function SpaceTabs({ myCount, joinedCount, myContent, joinedContent }: SpaceTabsProps) {
  const [tab, setTab] = useState<"mine" | "joined">("mine")

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1 w-fit">
        <button
          onClick={() => setTab("mine")}
          className={cn(
            "relative flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all",
            tab === "mine"
              ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          My Spaces
          <span
            className={cn(
              "text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none",
              tab === "mine"
                ? "bg-brand/10 text-brand"
                : "bg-muted-foreground/10 text-muted-foreground"
            )}
          >
            {myCount}
          </span>
        </button>
        <button
          onClick={() => setTab("joined")}
          className={cn(
            "relative flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all",
            tab === "joined"
              ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Joined
          <span
            className={cn(
              "text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none",
              tab === "joined"
                ? "bg-brand/10 text-brand"
                : "bg-muted-foreground/10 text-muted-foreground"
            )}
          >
            {joinedCount}
          </span>
        </button>
      </div>

      {tab === "mine" ? myContent : joinedContent}
    </div>
  )
}
