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
    <div className="space-y-6">
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/40 w-fit">
        <button
          onClick={() => setTab("mine")}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
            tab === "mine"
              ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/[0.06]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          My Spaces
          <span
            className={cn(
              "ml-1.5 text-[10px] font-semibold",
              tab === "mine" ? "text-brand" : "text-muted-foreground"
            )}
          >
            {myCount}
          </span>
        </button>
        <button
          onClick={() => setTab("joined")}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
            tab === "joined"
              ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/[0.06]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Joined
          <span
            className={cn(
              "ml-1.5 text-[10px] font-semibold",
              tab === "joined" ? "text-brand" : "text-muted-foreground"
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
