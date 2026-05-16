"use client"

import { formatDistanceToNow } from "date-fns"
import { CheckCircle2, SkipForward, XCircle } from "lucide-react"

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

const statusIcons = {
  completed: CheckCircle2,
  skipped: SkipForward,
  missed: XCircle,
}

const statusColors = {
  completed: "text-green-600",
  skipped: "text-yellow-600",
  missed: "text-red-500",
}

export function ActivityFeed({ checkins }: ActivityFeedProps) {
  if (checkins.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No activity yet. Check in on your goals to see progress here.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {checkins.map((checkin) => {
        const Icon =
          statusIcons[checkin.status as keyof typeof statusIcons] ??
          CheckCircle2
        const color =
          statusColors[checkin.status as keyof typeof statusColors] ??
          "text-muted-foreground"

        return (
          <div
            key={checkin.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
          >
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium capitalize">
                  {checkin.status}
                </span>{" "}
                {checkin.accountability_items?.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
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
