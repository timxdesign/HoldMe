export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return null
  if (!("serviceWorker" in navigator)) return null

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })
    return registration
  } catch {
    return null
  }
}
