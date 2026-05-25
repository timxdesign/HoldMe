"use client"

import { formatDistanceToNow } from "date-fns"
import { CheckCircle, SkipNext, CloseCircle } from "@solar-icons/react"

interface Checkin {
  id: string
  status: string
  checked_in_at: string
  accountability_items: {
    title: string
    space_id: string
  } | null
}

interface ActivityFeedProps {
  checkins: Checkin[]
}

const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-500/10",
    label: "Completed",
  },
  skipped: {
    icon: SkipNext,
    color: "text-yellow-600",
    bg: "bg-yellow-500/10",
    label: "Skipped",
  },
  missed: {
    icon: CloseCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    label: "Missed",
  },
} as const

export function ActivityFeed({ checkins }: ActivityFeedProps) {
  if (checkins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <CheckCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No activity yet. Check in on your goals to see progress here.
        </p>
      </div>
    )
  }

  return (
    <div className="relative space-y-1">
      {checkins.map((checkin) => {
        const config =
          statusConfig[checkin.status as keyof typeof statusConfig] ??
          statusConfig.completed
        const Icon = config.icon

        return (
          <div
            key={checkin.id}
            className="relative flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50"
          >
            <div className={`relative z-10 rounded-full p-1.5 ${config.bg} shrink-0`}>
              <Icon className={`h-3.5 w-3.5 ${config.color}`} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm leading-snug">
                <span className="font-medium">{config.label}</span>{" "}
                <span className="text-foreground/80">
                  {checkin.accountability_items?.title}
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(checkin.checked_in_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
