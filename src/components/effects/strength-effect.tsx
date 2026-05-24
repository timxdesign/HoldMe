"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Zap } from "lucide-react"

function playZapSound() {
  try {
    const ctx = new AudioContext()

    const crack = ctx.createOscillator()
    const crackGain = ctx.createGain()
    crack.type = "sawtooth"
    crack.frequency.setValueAtTime(3000, ctx.currentTime)
    crack.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15)
    crackGain.gain.setValueAtTime(0.25, ctx.currentTime)
    crackGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    crack.connect(crackGain).connect(ctx.destination)
    crack.start(ctx.currentTime)
    crack.stop(ctx.currentTime + 0.15)

    const rumble = ctx.createOscillator()
    const rumbleGain = ctx.createGain()
    rumble.type = "sine"
    rumble.frequency.setValueAtTime(80, ctx.currentTime + 0.05)
    rumble.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4)
    rumbleGain.gain.setValueAtTime(0.2, ctx.currentTime + 0.05)
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    rumble.connect(rumbleGain).connect(ctx.destination)
    rumble.start(ctx.currentTime + 0.05)
    rumble.stop(ctx.currentTime + 0.4)

    const shimmer = ctx.createOscillator()
    const shimmerGain = ctx.createGain()
    shimmer.type = "sine"
    shimmer.frequency.setValueAtTime(800, ctx.currentTime + 0.1)
    shimmer.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.35)
    shimmerGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.1)
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    shimmer.connect(shimmerGain).connect(ctx.destination)
    shimmer.start(ctx.currentTime + 0.1)
    shimmer.stop(ctx.currentTime + 0.35)

    setTimeout(() => ctx.close(), 1000)
  } catch {}
}

function LightningBolt({ index }: { index: number }) {
  const xOffset = 30 + Math.random() * 40
  const points = [`${xOffset},0`]
  let y = 0
  let x = xOffset
  const segments = 5 + Math.floor(Math.random() * 4)
  for (let i = 0; i < segments; i++) {
    y += 100 / segments
    x += (Math.random() - 0.5) * 20
    points.push(`${x},${y}`)
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      style={{
        animationDelay: `${index * 80}ms`,
        opacity: 0,
        animation: `lightning-bolt 0.6s ease-out ${index * 80}ms forwards`,
      }}
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="white"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#bolt-glow)"
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="#93c5fd"
        strokeWidth="0.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <filter id="bolt-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}

export function StrengthEffect() {
  const [active, setActive] = useState(false)
  const [senderName, setSenderName] = useState("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const trigger = useCallback((name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setSenderName(name)
    setActive(true)
    playZapSound()
    timeoutRef.current = setTimeout(() => setActive(false), 1800)
  }, [])

  useEffect(() => {
    function handleStrengthEvent(e: CustomEvent<{ senderName: string }>) {
      trigger(e.detail.senderName)
    }

    window.addEventListener("strength-received", handleStrengthEvent as EventListener)
    return () => {
      window.removeEventListener("strength-received", handleStrengthEvent as EventListener)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [trigger])

  if (!active) return null

  return (
    <>
      <style>{`
        @keyframes lightning-bolt {
          0% { opacity: 0; }
          10% { opacity: 1; }
          30% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes flash-screen {
          0% { opacity: 0; }
          5% { opacity: 0.6; }
          10% { opacity: 0.1; }
          15% { opacity: 0.4; }
          25% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes badge-enter {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          40% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          60% { transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        }
      `}</style>

      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <div
          className="absolute inset-0 bg-blue-200/30"
          style={{ animation: "flash-screen 0.5s ease-out forwards" }}
        />

        <LightningBolt index={0} />
        <LightningBolt index={1} />
        <LightningBolt index={2} />

        <div
          className="absolute top-1/2 left-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-2xl shadow-blue-500/20 ring-1 ring-white/10"
          style={{ animation: "badge-enter 1.8s ease-out forwards" }}
        >
          <div className="rounded-full bg-yellow-400/20 p-1.5">
            <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-bold">{senderName} sent you strength!</p>
          </div>
        </div>
      </div>
    </>
  )
}
