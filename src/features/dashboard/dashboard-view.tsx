"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  Fire,
  Target,
  CheckCircle,
  Heart,
  AltArrowRight,
  AddCircle,
  SkipNext,
  CloseCircle,
  UsersGroupTwoRounded,
  Crown,
} from "@solar-icons/react"
import { cn } from "@/lib/utils"

// ── Types ──

interface Space {
  id: string
  name: string
  owner_id: string
  visibility: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  space_members: any[] | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accountability_items?: any[] | null
}

interface Checkin {
  id: string
  status: string
  checked_in_at: string
  accountability_items: { title: string; space_id: string } | null
}

interface DashboardViewProps {
  firstName: string
  streak: number
  completionRate: number
  activeGoals: number
  strengthsReceived: number
  spaces: (Space & { owner?: { full_name: string | null } | null })[]
  recentCheckins: Checkin[]
  userId: string
}

// ── Animation primitives ──

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <div
      className={cn(
        "transition-all ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className
      )}
      style={{ transitionDuration: "600ms", transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const start = performance.now()
    const duration = 900
    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  return <span ref={ref}>{display}{suffix}</span>
}

// ── Greeting ──

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

// ── Main component ──

export function DashboardView({
  firstName,
  streak,
  completionRate,
  activeGoals,
  strengthsReceived,
  spaces,
  recentCheckins,
  userId,
}: DashboardViewProps) {
  const greeting = getGreeting()
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-8">
      {/* ── Greeting ── */}
      <FadeUp>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {greeting}, {firstName || "there"}
          </h1>
          <p className="text-sm text-muted-foreground/50 mt-1">{today}</p>
        </div>
      </FadeUp>

      {/* ── Stats row ── */}
      <FadeUp delay={80}>
        <div className="grid grid-cols-4 gap-px rounded-2xl bg-foreground/[0.04] ring-1 ring-foreground/[0.06] overflow-hidden">
          <StatCell
            icon={<Fire className="h-3.5 w-3.5 text-orange-500" />}
            value={streak}
            label="Streak"
          />
          <StatCell
            icon={<CheckCircle className="h-3.5 w-3.5 text-green-500" />}
            value={completionRate}
            suffix="%"
            label="This week"
          />
          <StatCell
            icon={<Target className="h-3.5 w-3.5 text-brand" />}
            value={activeGoals}
            label="Goals"
          />
          <StatCell
            icon={<Heart className="h-3.5 w-3.5 text-pink-500" />}
            value={strengthsReceived}
            label="Strength"
          />
        </div>
      </FadeUp>

      {/* ── Spaces ── */}
      <FadeUp delay={160}>
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
              Spaces
            </h2>
            <Link
              href="/spaces/new"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              <AddCircle className="h-3 w-3" />
              New
            </Link>
          </div>

          {spaces.length > 0 ? (
            <div className="space-y-2">
              {spaces.map((space, i) => {
                const isOwner = space.owner_id === userId
                const owner = space.owner as { full_name: string | null } | null
                const firstMember = space.space_members?.[0]
                const memberCount = typeof firstMember?.count === "number"
                  ? firstMember.count
                  : space.space_members?.length ?? 0
                const firstItem = space.accountability_items?.[0]
                const goalCount = typeof firstItem?.count === "number"
                  ? firstItem.count
                  : space.accountability_items?.length ?? 0

                return (
                  <SpaceRow
                    key={space.id}
                    id={space.id}
                    name={space.name}
                    isOwner={isOwner}
                    ownerName={!isOwner ? (owner?.full_name ?? null) : null}
                    memberCount={memberCount}
                    goalCount={goalCount}
                    index={i}
                  />
                )
              })}
              {spaces.length >= 5 && (
                <Link
                  href="/spaces"
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground py-3 transition-colors"
                >
                  View all
                  <AltArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/spaces/new"
              className="block text-center py-10 rounded-2xl border border-dashed border-foreground/[0.06] hover:border-brand/20 hover:bg-brand/[0.02] transition-all group"
            >
              <AddCircle className="h-5 w-5 text-muted-foreground/30 group-hover:text-brand mx-auto mb-2 transition-colors" />
              <p className="text-sm text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
                Create your first space
              </p>
            </Link>
          )}
        </section>
      </FadeUp>

      {/* ── Recent activity ── */}
      {recentCheckins.length > 0 && (
        <FadeUp delay={240}>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-4">
              Recent
            </h2>
            <div className="space-y-1">
              {recentCheckins.slice(0, 6).map((checkin, i) => (
                <ActivityRow key={checkin.id} checkin={checkin} index={i} />
              ))}
            </div>
          </section>
        </FadeUp>
      )}
    </div>
  )
}

// ── Sub-components ──

function StatCell({
  icon,
  value,
  suffix = "",
  label,
}: {
  icon: React.ReactNode
  value: number
  suffix?: string
  label: string
}) {
  return (
    <div className="bg-card flex flex-col items-center py-4 gap-1 transition-colors hover:bg-muted/30">
      {icon}
      <p className="text-base font-bold tabular-nums leading-tight">
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider font-medium">
        {label}
      </p>
    </div>
  )
}

function SpaceRow({
  id,
  name,
  isOwner,
  ownerName,
  memberCount,
  goalCount,
  index,
}: {
  id: string
  name: string
  isOwner: boolean
  ownerName: string | null
  memberCount: number
  goalCount: number
  index: number
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <Link
      href={`/spaces/${id}`}
      className={cn(
        "group flex items-center gap-3 rounded-xl bg-card ring-1 ring-foreground/[0.06] px-4 py-3 transition-all duration-300 hover:ring-foreground/10 hover:shadow-sm",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold truncate group-hover:text-brand transition-colors">
            {name}
          </h3>
          {isOwner && (
            <Crown className="h-3 w-3 text-brand/50 shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {ownerName && (
            <span className="text-[11px] text-muted-foreground/50">
              by {ownerName}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground/40 flex items-center gap-1">
            <UsersGroupTwoRounded className="h-2.5 w-2.5" />
            {memberCount}
          </span>
          {goalCount > 0 && (
            <span className="text-[11px] text-muted-foreground/40 flex items-center gap-1">
              <Target className="h-2.5 w-2.5" />
              {goalCount}
            </span>
          )}
        </div>
      </div>
      <AltArrowRight className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-brand group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
    </Link>
  )
}

const activityConfig = {
  completed: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500/8",
    label: "Done",
  },
  skipped: {
    icon: SkipNext,
    color: "text-yellow-500",
    bg: "bg-yellow-500/8",
    label: "Skipped",
  },
  missed: {
    icon: CloseCircle,
    color: "text-red-400",
    bg: "bg-red-500/8",
    label: "Missed",
  },
} as const

function ActivityRow({ checkin, index }: { checkin: Checkin; index: number }) {
  const config =
    activityConfig[checkin.status as keyof typeof activityConfig] ??
    activityConfig.completed
  const Icon = config.icon

  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-300 hover:bg-muted/40",
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
      )}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <div className={cn("rounded-full p-1.5 shrink-0", config.bg)}>
        <Icon className={cn("h-3 w-3", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">
          {checkin.accountability_items?.title}
        </p>
      </div>
      <span className="text-[10px] text-muted-foreground/40 shrink-0">
        {formatDistanceToNow(new Date(checkin.checked_in_at), { addSuffix: true })}
      </span>
    </div>
  )
}
