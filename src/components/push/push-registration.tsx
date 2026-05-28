"use client"

import { useEffect, useState, useCallback } from "react"
import { Bell, CloseSquare, Restart } from "@solar-icons/react"
import { Button } from "@/components/ui/button"
import { registerServiceWorker } from "@/lib/push/register-sw"
import {
  getExistingSubscription,
  savePushSubscription,
  subscribeToPush,
} from "@/lib/push/subscribe"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const DISMISS_KEY = "holdme-push-prompt-dismissed"
const DISMISS_DURATION = 14 * 24 * 60 * 60 * 1000

function wasDismissedRecently(): boolean {
  if (typeof localStorage === "undefined") return false
  const dismissed = localStorage.getItem(DISMISS_KEY)
  if (!dismissed) return false
  return Date.now() - parseInt(dismissed, 10) < DISMISS_DURATION
}

type PromptState = "hidden" | "show" | "loading"

export function PushRegistration() {
  const [promptState, setPromptState] = useState<PromptState>("hidden")

  useEffect(() => {
    async function init() {
      if (typeof window === "undefined") return
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return

      const registration = await registerServiceWorker()
      if (!registration) return

      const permission = Notification.permission

      if (permission === "granted") {
        const existing = await getExistingSubscription(registration)
        if (existing) {
          await savePushSubscription(existing)
        }
        return
      }

      if (permission === "denied") return

      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.userAgent.includes("Mac") && "ontouchend" in document)
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches
      if (isIOS && !isStandalone) return

      if (wasDismissedRecently()) return

      const timer = setTimeout(() => setPromptState("show"), 5000)
      return () => clearTimeout(timer)
    }

    init()
  }, [])

  const handleEnable = useCallback(async () => {
    setPromptState("loading")

    const permission = await Notification.requestPermission()
    if (permission === "denied") {
      toast.error("Notifications are blocked. Enable them in your browser settings.")
      setPromptState("hidden")
      return
    }
    if (permission !== "granted") {
      setPromptState("show")
      return
    }

    const registration = await registerServiceWorker()
    if (!registration) {
      toast.error("Could not register service worker")
      setPromptState("hidden")
      return
    }

    try {
      const subscription = await subscribeToPush(registration)
      const saved = await savePushSubscription(subscription)
      if (!saved) {
        toast.error("Could not save subscription")
        setPromptState("hidden")
        return
      }
      toast.success("Push notifications enabled!")
    } catch {
      toast.error("Could not subscribe to push notifications")
    }

    setPromptState("hidden")
  }, [])

  const handleDismiss = useCallback(() => {
    setPromptState("hidden")
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }, [])

  if (promptState === "hidden") return null

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-20 md:bottom-4 z-[55] px-4",
        "animate-in slide-in-from-bottom-4 duration-500"
      )}
    >
      <div className="relative mx-auto max-w-sm rounded-2xl bg-card shadow-2xl shadow-black/20 ring-1 ring-foreground/10 overflow-hidden">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
        >
          <CloseSquare className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand/10 p-2.5">
              <Bell className="h-5 w-5 text-brand" />
            </div>
            <div className="pr-6">
              <h3 className="font-semibold text-sm">
                Turn on notifications
              </h3>
              <p className="text-xs text-muted-foreground">
                Get notified about comments, strengths, and reminders
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleEnable}
              disabled={promptState === "loading"}
              className="flex-1 gap-2 rounded-xl h-11"
            >
              {promptState === "loading" ? (
                <Restart className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              Allow Notifications
            </Button>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
