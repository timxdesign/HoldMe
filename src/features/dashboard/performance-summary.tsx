"use client"

import { useState, useEffect } from "react"

interface PerformanceSummaryProps {
  firstName: string
  completedCount: number
  totalCheckins: number
  streak: number
  strengthsReceived: number
  activeGoals: number
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function PerformanceSummary({ firstName }: PerformanceSummaryProps) {
  const greeting = getGreeting()
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <div
      className={`transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      <h1 className="text-2xl md:text-3xl tracking-tight">
        {greeting}, {firstName || "there"}
      </h1>
      <p className="text-sm text-muted-foreground/60 mt-1">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  )
}
