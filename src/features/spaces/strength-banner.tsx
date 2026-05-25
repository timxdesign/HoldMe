"use client"

import { useState } from "react"
import { Heart, AltArrowDown, AltArrowUp } from "@solar-icons/react"
import { formatDistanceToNow } from "date-fns"

interface StrengthItem {
  id: string
  senderName: string
  itemTitle: string
  message: string | null
  createdAt: string
}

interface StrengthBannerProps {
  strengths: StrengthItem[]
}

function formatSenderNames(strengths: StrengthItem[]): string {
  const uniqueNames = [...new Set(strengths.map((s) => s.senderName))]
  if (uniqueNames.length === 1) return uniqueNames[0]
  if (uniqueNames.length === 2) return `${uniqueNames[0]} and ${uniqueNames[1]}`
  const remaining = uniqueNames.length - 2
  return `${uniqueNames[0]}, ${uniqueNames[1]}, and ${remaining} other${remaining > 1 ? "s" : ""}`
}

export function StrengthBanner({ strengths }: StrengthBannerProps) {
  const [expanded, setExpanded] = useState(false)

  const latest = strengths[0]
  const hasMore = strengths.length > 1

  return (
    <div className="rounded-xl bg-pink-500/[0.04] ring-1 ring-pink-500/10 p-3.5">
      <div className="flex items-center gap-2.5">
        <div className="rounded-full bg-pink-500/10 p-1.5 shrink-0">
          <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {formatSenderNames(strengths)} sent you strength
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {latest.message
              ? `"${latest.message}" — on ${latest.itemTitle}`
              : `On "${latest.itemTitle}" · ${formatDistanceToNow(new Date(latest.createdAt), { addSuffix: true })}`}
          </p>
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 flex items-center gap-1 text-xs text-pink-500 font-medium hover:underline"
          >
            {expanded ? (
              <>
                <AltArrowUp className="h-3 w-3" />
                Hide
              </>
            ) : (
              <>
                <AltArrowDown className="h-3 w-3" />
                +{strengths.length - 1}
              </>
            )}
          </button>
        )}
      </div>

      {expanded && hasMore && (
        <div className="mt-3 pt-3 border-t border-pink-500/10 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {strengths.slice(1).map((s) => (
            <div key={s.id} className="flex items-start gap-2 pl-8">
              <Heart className="h-3 w-3 text-pink-400 fill-pink-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs">
                  <span className="font-medium">{s.senderName}</span>{" "}
                  {s.message ? `"${s.message}"` : `on "${s.itemTitle}"`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
