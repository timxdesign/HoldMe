"use client"

import Link from "next/link"
import { UsersGroupTwoRounded, Target } from "@solar-icons/react"

const CIRCLE_SEEN_KEY = "holdme-circle-seen"

function hasNewCircleComment(circleId: string, latestComment: string | undefined): boolean {
  if (!latestComment || typeof localStorage === "undefined") return false
  try {
    const seen = JSON.parse(localStorage.getItem(CIRCLE_SEEN_KEY) || "{}")
    const lastSeen = seen[circleId]
    if (!lastSeen) return true
    return new Date(latestComment).getTime() > new Date(lastSeen).getTime()
  } catch { return false }
}

interface CircleCardProps {
  circle: { id: string; name: string; emoji: string | null; role: string }
  memberCount: number
  goalCount: number
  latestComment?: string
}

export function CircleCard({ circle, memberCount, goalCount, latestComment }: CircleCardProps) {
  const showNewIndicator = hasNewCircleComment(circle.id, latestComment)

  function handleClick() {
    try {
      const seen = JSON.parse(localStorage.getItem(CIRCLE_SEEN_KEY) || "{}")
      seen[circle.id] = new Date().toISOString()
      localStorage.setItem(CIRCLE_SEEN_KEY, JSON.stringify(seen))
    } catch {}
  }

  return (
    <Link
      href={`/circles/${circle.id}`}
      onClick={handleClick}
      className="group flex items-center gap-3.5 rounded-xl ring-1 ring-foreground/[0.06] p-4 transition-all duration-200 hover:ring-foreground/15 hover:bg-muted/30"
    >
      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted/50 text-lg shrink-0 transition-transform duration-300 group-hover:scale-105">
        {circle.emoji ?? "🎯"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {showNewIndicator && (
            <span className="shrink-0 h-2 w-2 rounded-full bg-brand animate-in fade-in duration-300" />
          )}
          <h3 className="font-semibold text-[15px] truncate">
            {circle.name}
          </h3>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <UsersGroupTwoRounded className="h-3 w-3" />
            {memberCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Target className="h-3 w-3" />
            {goalCount}
          </span>
        </div>
      </div>
    </Link>
  )
}
