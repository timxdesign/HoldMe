"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const UnreadCountContext = createContext(0)

export function useUnreadCount() {
  return useContext(UnreadCountContext)
}

export { UnreadCountContext }

export function useUnreadCountValue(userId: string | undefined) {
  const [count, setCount] = useState(0)
  const supabase = createClient()
  const pathname = usePathname()

  const refresh = useCallback(async () => {
    if (!userId) return
    const { count: c } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false)
    setCount(c ?? 0)
  }, [userId, supabase])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (pathname === "/notifications") refresh()
  }, [pathname, refresh])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel("unread-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => setCount((prev) => prev + 1)
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => refresh()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, refresh])

  return count
}
