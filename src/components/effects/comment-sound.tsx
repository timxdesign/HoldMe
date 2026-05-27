"use client"

import { useEffect, useCallback, useRef } from "react"

function playCommentSound() {
  try {
    const ctx = new AudioContext()
    const t = ctx.currentTime

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

    setTimeout(() => ctx.close(), 500)
  } catch {
    playCommentSoundFallback()
  }
}

function playCommentSoundFallback() {
  try {
    const audio = new Audio("/sounds/comment-pop.wav")
    audio.volume = 0.5
    audio.play()
  } catch {}
}

export function CommentSound() {
  const lastPlayedRef = useRef(0)

  const play = useCallback(() => {
    const now = Date.now()
    if (now - lastPlayedRef.current < 800) return
    lastPlayedRef.current = now
    playCommentSound()
  }, [])

  useEffect(() => {
    window.addEventListener("comment-received", play)

    function handleSWMessage(e: MessageEvent) {
      if (e.data?.type === "play-comment-sound") play()
    }
    navigator.serviceWorker?.addEventListener("message", handleSWMessage)

    return () => {
      window.removeEventListener("comment-received", play)
      navigator.serviceWorker?.removeEventListener("message", handleSWMessage)
    }
  }, [play])

  return null
}
