"use client"

import { useState, useEffect } from "react"
import { Flame, Target, CheckCircle2, Heart } from "lucide-react"

interface StatCardsProps {
  streak: number
  completionRate: number
  activeGoals: number
  strengthsReceived: number
}

const stats = [
  {
    key: "streak",
    label: "Day Streak",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    key: "completionRate",
    label: "This Week",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
    suffix: "%",
  },
  {
    key: "activeGoals",
    label: "Active Goals",
    icon: Target,
    color: "text-brand",
    bg: "bg-brand/10",
  },
  {
    key: "strengthsReceived",
    label: "Strengths",
    icon: Heart,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
] as const

export function StatCards(props: StatCardsProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const value = props[stat.key]
        return (
          <div
            key={stat.key}
            className={`group relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 p-4 transition-all duration-500 hover:ring-brand/30 hover:shadow-sm ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: `${400 + i * 80}ms` }}
          >
            <div className={`inline-flex rounded-lg p-2 ${stat.bg} mb-3`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {value}
              {"suffix" in stat && stat.suffix}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        )
      })}
    </div>
  )
}
