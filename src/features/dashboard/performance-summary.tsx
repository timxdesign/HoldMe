"use client"

import { useState, useEffect } from "react"
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react"

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

function getSummaryMessage({
  completedCount,
  totalCheckins,
  streak,
  strengthsReceived,
}: Omit<PerformanceSummaryProps, "firstName" | "activeGoals">) {
  const rate = totalCheckins > 0 ? Math.round((completedCount / totalCheckins) * 100) : 0

  const lines: string[] = []

  if (totalCheckins === 0) {
    lines.push(
      "Things have been quiet this week — and that's okay. Even one small check-in today can spark momentum. Your accountability partners are here for you."
    )
    return { lines, rate, trend: "neutral" as const }
  }

  if (rate >= 90) {
    lines.push(
      `You're absolutely crushing it! ${completedCount} goals completed this week with a ${rate}% success rate. Your consistency is inspiring.`
    )
  } else if (rate >= 70) {
    lines.push(
      `Great progress this week — ${completedCount} out of ${totalCheckins} check-ins completed. You're building real momentum here.`
    )
  } else if (rate >= 50) {
    lines.push(
      `Steady progress with ${completedCount} completions this week. Every step forward counts — try focusing on one goal at a time to build consistency.`
    )
  } else if (rate >= 30) {
    lines.push(
      `It's been a tough week, but you showed up ${completedCount} time${completedCount !== 1 ? "s" : ""} — that takes real courage. Progress isn't always linear.`
    )
  } else {
    lines.push(
      `This week had its challenges with ${completedCount} of ${totalCheckins} completed. Remember: every expert was once a beginner. Tomorrow is a fresh start.`
    )
  }

  if (streak >= 7) {
    lines.push(`You're on a ${streak}-day streak — incredible discipline!`)
  } else if (streak >= 3) {
    lines.push(`${streak}-day streak going strong. Don't break the chain!`)
  } else if (streak === 1) {
    lines.push("You checked in today — let's keep it rolling!")
  }

  if (strengthsReceived > 0) {
    lines.push(
      `Your community sent you ${strengthsReceived} strength${strengthsReceived !== 1 ? "s" : ""} this week. People are rooting for you.`
    )
  }

  const trend = rate >= 70 ? "up" : rate >= 40 ? "neutral" : "down"
  return { lines, rate, trend: trend as "up" | "neutral" | "down" }
}

export function PerformanceSummary(props: PerformanceSummaryProps) {
  const { firstName } = props
  const greeting = getGreeting()
  const { lines, rate, trend } = getSummaryMessage(props)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <div className="space-y-6">
      <div
        className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {greeting}, {firstName || "there"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand/10 via-brand/5 to-brand-secondary/10 p-5 md:p-6 ring-1 ring-brand/10 transition-all duration-700 delay-150 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="absolute top-3 right-3 md:top-4 md:right-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-brand/70 bg-brand/10 rounded-full px-2.5 py-1">
            <TrendIcon className="h-3 w-3" />
            {props.totalCheckins > 0 ? `${rate}%` : "—"}
          </div>
        </div>

        <div className="flex items-start gap-3 mb-3">
          <div className="rounded-xl bg-brand/15 p-2 shrink-0">
            <Sparkles className="h-4 w-4 text-brand" />
          </div>
          <p className="text-xs font-medium text-brand/70 uppercase tracking-wider pt-1.5">
            Your Weekly Summary
          </p>
        </div>

        <div className="space-y-2">
          {lines.map((line, i) => (
            <p
              key={i}
              className={`text-sm md:text-base leading-relaxed text-foreground/90 transition-all duration-500`}
              style={{ transitionDelay: `${300 + i * 100}ms` }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
