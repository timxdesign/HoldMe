"use client"

import { useState, useEffect, useCallback } from "react"
import { CloseSquare, Download, Share, AddCircle, Smartphone } from "@solar-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type Platform = "android" | "ios" | "other"

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other"
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return "ios"
  if (/android/.test(ua)) return "android"
  return "other"
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

const DISMISS_KEY = "holdme-pwa-install-dismissed"
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

function wasDismissedRecently(): boolean {
  if (typeof localStorage === "undefined") return false
  const dismissed = localStorage.getItem(DISMISS_KEY)
  if (!dismissed) return false
  return Date.now() - parseInt(dismissed, 10) < DISMISS_DURATION
}

export function PwaInstallPrompt() {
  const [platform, setPlatform] = useState<Platform>("other")
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return

    const detectedPlatform = detectPlatform()
    setPlatform(detectedPlatform)

    if (detectedPlatform === "ios") {
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }

    if (detectedPlatform === "android") {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setTimeout(() => setShowPrompt(true), 2000)
      }
      window.addEventListener("beforeinstallprompt", handler)
      return () => window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleDismiss = useCallback(() => {
    setShowPrompt(false)
    setShowIosGuide(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }, [])

  const handleInstallAndroid = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  if (!showPrompt || platform === "other") return null

  return (
    <>
      {/* Bottom sheet prompt */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-16 md:bottom-0 z-[60] px-4 pb-4 animate-in slide-in-from-bottom-8 duration-500",
          showIosGuide && "hidden"
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
                <Smartphone className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Install HoldMe</h3>
                <p className="text-xs text-muted-foreground">
                  Get push notifications & quick access
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
              <div className="flex -space-x-1">
                <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-[8px]">🔔</span>
                </div>
                <div className="h-5 w-5 rounded-full bg-brand/20 flex items-center justify-center">
                  <span className="text-[8px]">⚡</span>
                </div>
                <div className="h-5 w-5 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <span className="text-[8px]">💪</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Never miss a strength or reminder — even when the app is closed
              </p>
            </div>

            {platform === "android" && (
              <Button
                onClick={handleInstallAndroid}
                className="w-full gap-2 rounded-xl h-11"
              >
                <Download className="h-4 w-4" />
                Install App
              </Button>
            )}

            {platform === "ios" && (
              <Button
                onClick={() => setShowIosGuide(true)}
                className="w-full gap-2 rounded-xl h-11"
              >
                <AddCircle className="h-4 w-4" />
                Add to Home Screen
              </Button>
            )}

            <button
              onClick={handleDismiss}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>

      {/* iOS step-by-step guide overlay */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-x-0 bottom-0 animate-in slide-in-from-bottom duration-300">
            <div className="mx-auto max-w-sm rounded-t-3xl bg-card shadow-2xl">
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              </div>

              <div className="px-6 pb-8 pt-4 space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-base">Add to Home Screen</h3>
                  <p className="text-xs text-muted-foreground">
                    Follow these steps to install HoldMe
                  </p>
                </div>

                <div className="space-y-4">
                  <Step
                    number={1}
                    icon={<Share className="h-4 w-4" />}
                    title="Tap the Share button"
                    description="In Safari's toolbar at the bottom of the screen"
                  />
                  <Step
                    number={2}
                    icon={<AddCircle className="h-4 w-4" />}
                    title='Tap "Add to Home Screen"'
                    description="Scroll down in the share menu to find it"
                  />
                  <Step
                    number={3}
                    icon={<Download className="h-4 w-4" />}
                    title='Tap "Add"'
                    description="HoldMe will appear on your home screen"
                  />
                </div>

                <div className="rounded-xl bg-amber-500/10 px-4 py-3">
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    <span className="font-semibold">Important:</span> Push notifications on iPhone only work after installing the app to your home screen.
                  </p>
                </div>

                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="w-full rounded-xl h-11"
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: number
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-brand text-white text-xs font-bold shrink-0">
        {number}
      </div>
      <div className="flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <h4 className="text-sm font-semibold">{title}</h4>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
