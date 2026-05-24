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
          }

          if (notification.type === "strength") {
            toast(notification.title, {
              description: notification.body,
              icon: "💪",
              duration: 5000,
            })
          } else {
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
