"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
  once?: boolean
}

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 700,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  const translate = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
    none: "",
  }[direction]

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out",
        visible
          ? "opacity-100 translate-x-0 translate-y-0"
          : `opacity-0 ${translate}`,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

interface StaggerChildrenProps {
  children: ReactNode
  className?: string
  staggerMs?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
}

export function StaggerChildren({
  children,
  className,
  staggerMs = 120,
  direction = "up",
  duration = 600,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const translate = {
    up: "translateY(24px)",
    down: "translateY(-24px)",
    left: "translateX(24px)",
    right: "translateX(-24px)",
    none: "none",
  }[direction]

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : translate,
                transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
                transitionDelay: visible ? `${i * staggerMs}ms` : "0ms",
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  )
}

interface CountUpProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function CountUp({ end, suffix = "", prefix = "", duration = 2000, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const startTime = performance.now()
    let raf: number

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * end))
      if (progress < 1) {
        raf = requestAnimationFrame(step)
      } else {
        setValue(end)
      }
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [started, end, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  )
}

export function FloatingElement({
  children,
  className,
  amplitude = 12,
  duration = 6,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  amplitude?: number
  duration?: number
  delay?: number
}) {
  return (
    <div
      className={cn("animate-float", className)}
      style={{
        // @ts-expect-error css custom properties
        "--float-amplitude": `${amplitude}px`,
        "--float-duration": `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

export function TextReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const words = text.split(" ")

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <span
            className="inline-block transition-transform ease-out"
            style={{
              transform: visible ? "translateY(0)" : "translateY(110%)",
              transitionDuration: "600ms",
              transitionDelay: `${delay + i * 60}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  )
}
