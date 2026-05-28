"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function useRealtimeNotifications(userId: string | undefined) {
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as {
            title: string
            body: string
            type: string
            data: { sender_name?: string } | null
          }

          if (notification.type === "strength") {
            const senderName = notification.data?.sender_name ?? "Someone"
            window.dispatchEvent(
              new CustomEvent("strength-received", {
                detail: { senderName },
              })
            )
            toast(notification.title, {
              description: notification.body,
              icon: "💪",
              duration: 5000,
            })
          } else if (notification.type === "comment" || notification.type === "circle_comment" || notification.type === "circle_mention") {
            window.dispatchEvent(new CustomEvent("comment-received"))
            toast(notification.title, {
              description: notification.body,
              icon: notification.type === "circle_mention" ? "📣" : "💬",
              duration: 5000,
            })
          } else if (notification.type === "circle_strength") {
            window.dispatchEvent(
              new CustomEvent("strength-received", {
                detail: { senderName: notification.data?.sender_name ?? "Someone" },
              })
            )
            toast(notification.title, {
              description: notification.body,
              icon: "💪",
              duration: 5000,
            })
          } else {
            window.dispatchEvent(
              new CustomEvent("notification-sound", {
                detail: { type: notification.type },
              })
            )
            toast(notification.title, {
              description: notification.body,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])
}
