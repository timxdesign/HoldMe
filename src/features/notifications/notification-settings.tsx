"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function NotificationSettings() {
  const [pushEnabled, setPushEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleEnablePush() {
    setLoading(true)

    if (!("Notification" in window)) {
      toast.error("Push notifications are not supported in this browser")
      setLoading(false)
      return
    }

    const permission = await Notification.requestPermission()

    if (permission === "granted") {
      setPushEnabled(true)
      toast.success("Push notifications enabled!")
    } else {
      toast.error("Notification permission denied")
    }

    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Push Notifications</p>
          <p className="text-xs text-muted-foreground">
            Receive reminders and encouragement alerts
          </p>
        </div>
        <Button
          size="sm"
          variant={pushEnabled ? "secondary" : "default"}
          onClick={handleEnablePush}
          disabled={loading || pushEnabled}
        >
          {pushEnabled ? "Enabled" : loading ? "Enabling..." : "Enable"}
        </Button>
      </div>
    </div>
  )
}
