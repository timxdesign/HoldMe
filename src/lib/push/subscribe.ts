function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

export async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
  const keyArray = urlBase64ToUint8Array(publicKey)
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: keyArray.buffer as ArrayBuffer,
  })
  return subscription
}

export async function savePushSubscription(
  subscription: PushSubscription
): Promise<boolean> {
  const p256dh = subscription.getKey("p256dh")
  const auth = subscription.getKey("auth")

  if (!p256dh || !auth) return false

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      p256dh: arrayBufferToBase64Url(p256dh),
      auth: arrayBufferToBase64Url(auth),
    }),
  })

  return res.ok
}

export async function unsubscribePush(
  subscription: PushSubscription
): Promise<boolean> {
  await subscription.unsubscribe()

  const res = await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  })

  return res.ok
}

export async function getExistingSubscription(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  return registration.pushManager.getSubscription()
}
