"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Bell, BellOff, Smartphone, Restart, DangerTriangle } from "@solar-icons/react"
import { registerServiceWorker } from "@/lib/push/register-sw"
import {
  subscribeToPush,
  savePushSubscription,
  unsubscribePush,
  getExistingSubscription,
} from "@/lib/push/subscribe"

type PushState = "loading" | "unsupported" | "needs-install" | "disabled" | "enabled"

export function NotificationSettings() {
  const [state, setState] = useState<PushState>("loading")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState("unsupported")
        return
      }

      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.userAgent.includes("Mac") && "ontouchend" in document)
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      if (isIOS && !isStandalone) {
        setState("needs-install")
        return
      }

      const registration = await registerServiceWorker()
      if (!registration) {
        setState("unsupported")
        return
      }

      const existing = await getExistingSubscription(registration)
      setState(existing ? "enabled" : "disabled")
    }

    check()
  }, [])

  async function handleEnable() {
    setLoading(true)

    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      toast.error("Notification permission denied")
      setLoading(false)
      return
    }

    const registration = await registerServiceWorker()
    if (!registration) {
      toast.error("Could not register service worker")
      setLoading(false)
      return
    }

    try {
      const subscription = await subscribeToPush(registration)
      const saved = await savePushSubscription(subscription)
      if (!saved) {
        toast.error("Could not save subscription")
        setLoading(false)
        return
      }
      setState("enabled")
      toast.success("Push notifications enabled!")
    } catch {
      toast.error("Could not subscribe to push notifications")
    }

    setLoading(false)
  }

  async function handleDisable() {
    setLoading(true)

    const registration = await registerServiceWorker()
    if (registration) {
      const subscription = await getExistingSubscription(registration)
      if (subscription) {
        await unsubscribePush(subscription)
      }
    }

    setState("disabled")
    toast.success("Push notifications disabled")
    setLoading(false)
  }

  if (state === "loading") {
    return (
      <div className="flex items-center gap-3 py-2">
        <Restart className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Checking notification support...</span>
      </div>
    )
  }

  if (state === "unsupported") {
    return (
      <div className="flex items-start gap-3 py-2">
        <BellOff className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Not supported</p>
          <p className="text-xs text-muted-foreground">
            Your browser doesn&apos;t support push notifications.
          </p>
        </div>
      </div>
    )
  }

  if (state === "needs-install") {
    return (
      <div className="flex items-start gap-3 py-2">
        <Smartphone className="h-4 w-4 text-brand mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Add to Home Screen first</p>
          <p className="text-xs text-muted-foreground">
            On iOS, push notifications require the app to be installed.
            Tap the share button and select &quot;Add to Home Screen&quot;, then
            enable notifications here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Bell className="h-4 w-4 text-brand mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Push Notifications</p>
            <p className="text-xs text-muted-foreground">
              {state === "enabled"
                ? "You'll receive notifications even when the app is closed."
                : "Get notified about strengths and reminders even when offline."}
            </p>
          </div>
        </div>
        {state === "enabled" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDisable}
            disabled={loading}
            className="shrink-0"
          >
            {loading ? <Restart className="h-3.5 w-3.5 animate-spin" /> : "Disable"}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleEnable}
            disabled={loading}
            className="shrink-0"
          >
            {loading ? <Restart className="h-3.5 w-3.5 animate-spin" /> : "Enable"}
          </Button>
        )}
      </div>

      {state === "enabled" && (
        <div className="flex items-start gap-2 rounded-lg bg-green-500/10 p-2.5">
          <DangerTriangle className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-green-700 dark:text-green-400">
            Active on this device. You&apos;ll get alerts for strengths received and goal reminders.
          </p>
        </div>
      )}
    </div>
  )
}
