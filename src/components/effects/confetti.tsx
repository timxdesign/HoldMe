"use client"

import { useCallback, useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  opacity: number
  shape: "square" | "circle" | "strip"
}

const COLORS = [
  "#1E96FC", // brand blue
  "#60a5fa", // light blue
  "#f472b6", // pink
  "#a78bfa", // purple
  "#34d399", // green
  "#fbbf24", // yellow
  "#fb923c", // orange
]

function createParticle(x: number, y: number): Particle {
  const angle = Math.random() * Math.PI * 2
  const speed = 3 + Math.random() * 6
  const shapes: Particle["shape"][] = ["square", "circle", "strip"]
  return {
    x,
    y,
    vx: Math.cos(angle) * speed * (0.6 + Math.random() * 0.8),
    vy: Math.sin(angle) * speed * -1 - Math.random() * 3,
    size: 4 + Math.random() * 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    opacity: 1,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
  }
}

export function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      cancelAnimationFrame(rafRef.current)
      if (canvasRef.current) {
        canvasRef.current.remove()
        canvasRef.current = null
      }
    }
  }, [])

  const ensureCanvas = useCallback(() => {
    if (canvasRef.current) return canvasRef.current

    const canvas = document.createElement("canvas")
    canvas.style.position = "fixed"
    canvas.style.inset = "0"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "9999"
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    canvasRef.current = canvas
    return canvas
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !mountedRef.current) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const particles = particlesRef.current
    let alive = false

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.vy += 0.15
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.rotationSpeed
      p.opacity -= 0.012

      if (p.opacity <= 0) {
        particles.splice(i, 1)
        continue
      }

      alive = true
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.fillStyle = p.color

      if (p.shape === "circle") {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      } else if (p.shape === "strip") {
        ctx.fillRect(-p.size / 2, -1, p.size, 2.5)
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      }

      ctx.restore()
    }

    if (alive) {
      rafRef.current = requestAnimationFrame(animate)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      canvas.remove()
      canvasRef.current = null
    }
  }, [])

  const fire = useCallback(
    (originX?: number, originY?: number) => {
      const canvas = ensureCanvas()
      const x = originX ?? canvas.width / 2
      const y = originY ?? canvas.height / 2

      const count = 40 + Math.floor(Math.random() * 20)
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle(x, y))
      }

      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(animate)
    },
    [ensureCanvas, animate]
  )

  return fire
}
