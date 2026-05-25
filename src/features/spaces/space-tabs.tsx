"use client"

import { useState } from "react"
import { Crown, UsersGroupTwoRounded } from "@solar-icons/react"
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
    <div className="space-y-5">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 w-fit">
        <button
          onClick={() => setTab("mine")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
            tab === "mine"
              ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Crown className="h-3 w-3" />
          My Spaces
          <span
            className={cn(
              "text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none",
              tab === "mine"
                ? "bg-brand/10 text-brand"
                : "bg-muted text-muted-foreground"
            )}
          >
            {myCount}
          </span>
        </button>
        <button
          onClick={() => setTab("joined")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
            tab === "joined"
              ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UsersGroupTwoRounded className="h-3 w-3" />
          Joined
          <span
            className={cn(
              "text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none",
              tab === "joined"
                ? "bg-brand/10 text-brand"
                : "bg-muted text-muted-foreground"
            )}
          >
            {joinedCount}
          </span>
        </button>
      </div>

      <div key={tab} className="animate-in fade-in duration-200">
        {tab === "mine" ? myContent : joinedContent}
      </div>
    </div>
  )
}
