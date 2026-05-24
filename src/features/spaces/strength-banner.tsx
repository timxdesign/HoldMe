"use client"

import { useState } from "react"
import { Heart, X, ChevronDown, ChevronUp } from "lucide-react"
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

export function StrengthBanner({ strengths }: StrengthBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (dismissed) return null

  const latest = strengths[0]
  const hasMore = strengths.length > 1

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-500/10 via-pink-500/5 to-orange-500/10 ring-1 ring-pink-500/20 p-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="rounded-full bg-pink-500/15 p-2 shrink-0 animate-pulse">
          <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {strengths.length === 1
              ? `${latest.senderName} sent you strength`
              : `${strengths.length} people sent you strength`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {latest.message
              ? `"${latest.message}" — on ${latest.itemTitle}`
              : `On "${latest.itemTitle}" · ${formatDistanceToNow(new Date(latest.createdAt), { addSuffix: true })}`}
          </p>

          {hasMore && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-brand font-medium mt-2 hover:underline"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" /> Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" /> Show {strengths.length - 1} more
                  </>
                )}
              </button>

              {expanded && (
                <div className="mt-2 space-y-2 pt-2 border-t border-pink-500/10">
                  {strengths.slice(1).map((s) => (
                    <div key={s.id} className="flex items-start gap-2">
                      <Heart className="h-3 w-3 text-pink-400 fill-pink-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs">
                          <span className="font-medium">{s.senderName}</span>{" "}
                          {s.message ? `"${s.message}"` : `on "${s.itemTitle}"`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(s.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
