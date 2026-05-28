"use client"

import { useEffect, useCallback, useRef } from "react"

function playNotificationSound(type?: string) {
  try {
    const ctx = new AudioContext()
    const t = ctx.currentTime

    if (type === "comment") {
      playCommentTone(ctx, t)
    } else if (type === "strength") {
      playStrengthTone(ctx, t)
    } else {
      playDefaultTone(ctx, t)
    }

    setTimeout(() => ctx.close(), 600)
  } catch {
    playFallbackSound()
  }
}

function playCommentTone(ctx: AudioContext, t: number) {
  const pop = ctx.createOscillator()
  const popGain = ctx.createGain()
  pop.type = "sine"
  pop.frequency.setValueAtTime(588, t)
  pop.frequency.exponentialRampToValueAtTime(660, t + 0.08)
  popGain.gain.setValueAtTime(0, t)
  popGain.gain.linearRampToValueAtTime(0.18, t + 0.01)
  popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
  pop.connect(popGain).connect(ctx.destination)
  pop.start(t)
  pop.stop(t + 0.12)

  const pip = ctx.createOscillator()
  const pipGain = ctx.createGain()
  pip.type = "sine"
  pip.frequency.setValueAtTime(784, t + 0.1)
  pip.frequency.exponentialRampToValueAtTime(880, t + 0.18)
  pipGain.gain.setValueAtTime(0, t + 0.1)
  pipGain.gain.linearRampToValueAtTime(0.15, t + 0.11)
  pipGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
  pip.connect(pipGain).connect(ctx.destination)
  pip.start(t + 0.1)
  pip.stop(t + 0.25)

  const warm = ctx.createOscillator()
  const warmGain = ctx.createGain()
  warm.type = "sine"
  warm.frequency.setValueAtTime(392, t)
  warmGain.gain.setValueAtTime(0, t)
  warmGain.gain.linearRampToValueAtTime(0.06, t + 0.02)
  warmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  warm.connect(warmGain).connect(ctx.destination)
  warm.start(t)
  warm.stop(t + 0.2)
}

function playStrengthTone(ctx: AudioContext, t: number) {
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((freq, i) => {
    const offset = i * 0.09
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(freq, t + offset)
    gain.gain.setValueAtTime(0, t + offset)
    gain.gain.linearRampToValueAtTime(0.16, t + offset + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.25)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t + offset)
    osc.stop(t + offset + 0.25)
  })

  const shimmer = ctx.createOscillator()
  const shimmerGain = ctx.createGain()
  shimmer.type = "triangle"
  shimmer.frequency.setValueAtTime(1046.5, t + 0.22)
  shimmerGain.gain.setValueAtTime(0, t + 0.22)
  shimmerGain.gain.linearRampToValueAtTime(0.08, t + 0.24)
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
  shimmer.connect(shimmerGain).connect(ctx.destination)
  shimmer.start(t + 0.22)
  shimmer.stop(t + 0.45)
}

function playDefaultTone(ctx: AudioContext, t: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(698.46, t)
  osc.frequency.exponentialRampToValueAtTime(880, t + 0.1)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.16, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.2)

  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = "sine"
  osc2.frequency.setValueAtTime(1046.5, t + 0.12)
  gain2.gain.setValueAtTime(0, t + 0.12)
  gain2.gain.linearRampToValueAtTime(0.12, t + 0.13)
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  osc2.connect(gain2).connect(ctx.destination)
  osc2.start(t + 0.12)
  osc2.stop(t + 0.3)
}

function playFallbackSound() {
  try {
    const audio = new Audio("/sounds/comment-pop.wav")
    audio.volume = 0.5
    audio.play()
  } catch {}
}

export function NotificationSound() {
  const lastPlayedRef = useRef(0)

  const play = useCallback((type?: string) => {
    const now = Date.now()
    if (now - lastPlayedRef.current < 800) return
    lastPlayedRef.current = now
    playNotificationSound(type)
  }, [])

  useEffect(() => {
    function handleComment() { play("comment") }
    function handleStrength() { play("strength") }
    function handleNotification(e: CustomEvent) { play(e.detail?.type) }

    window.addEventListener("comment-received", handleComment)
    window.addEventListener("strength-received", handleStrength)
    window.addEventListener("notification-sound", handleNotification as EventListener)

    function handleSWMessage(e: MessageEvent) {
      if (e.data?.type === "play-notification-sound") {
        play(e.data.notificationType)
      }
    }
    navigator.serviceWorker?.addEventListener("message", handleSWMessage)

    return () => {
      window.removeEventListener("comment-received", handleComment)
      window.removeEventListener("strength-received", handleStrength)
      window.removeEventListener("notification-sound", handleNotification as EventListener)
      navigator.serviceWorker?.removeEventListener("message", handleSWMessage)
    }
  }, [play])

  return null
}
