"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/push/register-sw"
import { getExistingSubscription, savePushSubscription } from "@/lib/push/subscribe"

export function PushRegistration() {
  useEffect(() => {
    async function init() {
      const registration = await registerServiceWorker()
      if (!registration) return

      if (Notification.permission === "granted") {
        const existing = await getExistingSubscription(registration)
        if (existing) {
          await savePushSubscription(existing)
        }
      }
    }

    init()
  }, [])

  return null
}
