"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { Heart, ChatRound, ClockCircle, UserPlus, CheckCircle, DangerCircle } from "@solar-icons/react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
}

interface NotificationListProps {
  notifications: Notification[]
}

const typeIcons = {
  strength: Heart,
  comment: ChatRound,
  reminder: ClockCircle,
  invite: UserPlus,
  checkin: CheckCircle,
  missed: DangerCircle,
}

const typeColors = {
  strength: "text-strength",
  comment: "text-brand",
  reminder: "text-blue-500",
  invite: "text-green-600",
  checkin: "text-green-600",
  missed: "text-red-500",
}

export function NotificationList({ notifications }: NotificationListProps) {
  const [items, setItems] = useState(notifications)
  const supabase = createClient()

  async function markAsRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id)
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No notifications yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          You&apos;ll see encouragement and updates here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {items.map((notification) => {
        const Icon =
          typeIcons[notification.type as keyof typeof typeIcons] ?? ClockCircle
        const color =
          typeColors[notification.type as keyof typeof typeColors] ??
          "text-muted-foreground"

        return (
          <button
            key={notification.id}
            onClick={() => markAsRead(notification.id)}
            className={cn(
              "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted/50",
              !notification.read && "bg-accent"
            )}
          >
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm",
                  !notification.read && "font-medium"
                )}
              >
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {notification.body}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-brand shrink-0 mt-1.5" />
            )}
          </button>
        )
      })}
    </div>
  )
}
