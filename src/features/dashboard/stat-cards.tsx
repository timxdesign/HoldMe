"use client"

import { useState, useEffect } from "react"
import { Fire, Target, CheckCircle, Heart } from "@solar-icons/react"

interface StatCardsProps {
  streak: number
  completionRate: number
  activeGoals: number
  strengthsReceived: number
}

export function StatCards({ streak, completionRate, activeGoals, strengthsReceived }: StatCardsProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <div
      className={`flex flex-wrap items-center gap-2 transition-all duration-500 delay-200 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <StatPill icon={Fire} color="text-orange-500" bg="bg-orange-500/8" value={streak} label="day streak" />
      <StatPill icon={CheckCircle} color="text-green-500" bg="bg-green-500/8" value={`${completionRate}%`} label="this week" />
      <StatPill icon={Target} color="text-brand" bg="bg-brand/8" value={activeGoals} label="goals" />
      {strengthsReceived > 0 && (
        <StatPill icon={Heart} color="text-pink-500" bg="bg-pink-500/8" value={strengthsReceived} label="strengths" />
      )}
    </div>
  )
}

function StatPill({
  icon: Icon,
  color,
  bg,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  value: number | string
  label: string
}) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full ${bg} px-3 py-1.5`}>
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className="text-sm font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground/70">{label}</span>
    </div>
  )
}
