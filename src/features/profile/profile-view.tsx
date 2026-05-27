"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CheckCircle,
  AltArrowRight,
  Heart,
  Logout2,
  Pen2,
  Target,
} from "@solar-icons/react"
import { cn } from "@/lib/utils"

const INTERESTS = [
  "Fitness",
  "Faith",
  "Education",
  "Business",
  "Content Creation",
  "Mental Health",
  "Reading",
  "Career",
  "Relationships",
  "Finance",
]

const interestEmojis: Record<string, string> = {
  Fitness: "\u{1F4AA}",
  Faith: "\u{1F64F}",
  Education: "\u{1F4DA}",
  Business: "\u{1F4BC}",
  "Content Creation": "\u{1F3A8}",
  "Mental Health": "\u{1F9E0}",
  Reading: "\u{1F4D6}",
  Career: "\u{1F680}",
  Relationships: "\u{2764}\u{FE0F}",
  Finance: "\u{1F4B0}",
}

interface ProfileViewProps {
  profile: {
    id: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    interests: string[] | null
  } | null
  userId: string
  email: string
  stats: {
    spacesOwned: number
    spacesJoined: number
    totalGoals: number
    completedCheckins: number
    totalCheckins: number
    strengthsSent: number
    strengthsReceived: number
    memberSince: string
  }
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(el)
          const start = performance.now()
          const duration = 800
          function step(now: number) {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(eased * value))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref}>{display}</span>
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ transitionDuration: "600ms", transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export function ProfileView({ profile, userId, email, stats }: ProfileViewProps) {
  const fullName = profile?.full_name ?? ""
  const bio = profile?.bio ?? ""
  const interests = profile?.interests ?? []
  const avatarUrl = profile?.avatar_url ?? null
  const router = useRouter()
  const supabase = createClient()

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const completionRate =
    stats.totalCheckins > 0
      ? Math.round((stats.completedCheckins / stats.totalCheckins) * 100)
      : 0

  const memberDate = new Date(stats.memberSince)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="space-y-8">
      {/* ── Identity ── */}
      <FadeUp>
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 ring-2 ring-foreground/5 shadow-lg mb-4">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback className="text-2xl font-bold bg-brand/10 text-brand">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-bold tracking-tight">
            {fullName || "Add your name"}
          </h2>
          {bio && (
            <p className="text-sm text-muted-foreground mt-1 max-w-xs leading-relaxed">
              {bio}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground/50">
            <span>{email}</span>
            <span className="h-1 w-1 rounded-full bg-foreground/10" />
            <span>
              Joined {memberDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
          <Link
            href="/profile/edit"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline transition-colors"
          >
            <Pen2 className="h-3 w-3" />
            Edit profile
          </Link>
        </div>
      </FadeUp>

      {/* ── Stats ── */}
      <FadeUp delay={100}>
        <div className="grid grid-cols-3 gap-px rounded-2xl bg-foreground/[0.04] ring-1 ring-foreground/[0.06] overflow-hidden">
          <StatCell
            value={stats.totalGoals}
            label="Goals"
            icon={<Target className="h-3.5 w-3.5 text-brand" />}
          />
          <StatCell
            value={completionRate}
            suffix="%"
            label="Complete"
            icon={<CheckCircle className="h-3.5 w-3.5 text-green-500" />}
          />
          <StatCell
            value={stats.strengthsReceived}
            label="Strength"
            icon={<Heart className="h-3.5 w-3.5 text-pink-500" />}
          />
        </div>
      </FadeUp>

      {/* ── Journey ── */}
      <FadeUp delay={200}>
        <div className="rounded-2xl bg-card ring-1 ring-foreground/[0.06] p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-4">
            Journey
          </h3>
          <div className="space-y-0">
            <JourneyRow
              label="Spaces owned"
              value={stats.spacesOwned}
              delay={0}
            />
            <JourneyRow
              label="Spaces joined"
              value={stats.spacesJoined}
              delay={50}
            />
            <JourneyRow
              label="Check-ins"
              value={stats.completedCheckins}
              delay={100}
            />
            <JourneyRow
              label="Strength sent"
              value={stats.strengthsSent}
              delay={150}
            />
          </div>
        </div>
      </FadeUp>

      {/* ── Interests ── */}
      <FadeUp delay={300}>
        <div className="rounded-2xl bg-card ring-1 ring-foreground/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
              Interests
            </h3>
            {interests.length > 0 && (
              <Link
                href="/profile/edit"
                className="text-[11px] text-brand font-medium hover:underline"
              >
                Edit
              </Link>
            )}
          </div>

          {interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, i) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium animate-in fade-in duration-300"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="text-sm">{interestEmojis[interest]}</span>
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <Link
              href="/profile/edit"
              className="block w-full py-6 text-center rounded-xl border border-dashed border-foreground/8 hover:border-brand/20 hover:bg-brand/[0.02] transition-colors group"
            >
              <p className="text-sm text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
                Add your interests
              </p>
            </Link>
          )}
        </div>
      </FadeUp>

      {/* ── Links ── */}
      <FadeUp delay={400}>
        <div className="space-y-2">
          <QuickLink
            href="/settings"
            label="Settings"
            sub="Notifications & reminders"
          />
          <QuickLink
            href="/spaces"
            label="Your spaces"
            sub={`${stats.spacesOwned + stats.spacesJoined} total`}
          />
        </div>
      </FadeUp>

      {/* ── Logout ── */}
      <FadeUp delay={450}>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
        >
          <Logout2 className="h-4 w-4" />
          Log out
        </button>
      </FadeUp>
    </div>
  )
}

function StatCell({
  value,
  suffix = "",
  label,
  icon,
}: {
  value: number
  suffix?: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-card flex flex-col items-center py-5 gap-1.5 transition-colors hover:bg-muted/30">
      {icon}
      <p className="text-lg font-bold tabular-nums">
        <AnimatedNumber value={value} />{suffix}
      </p>
      <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
        {label}
      </p>
    </div>
  )
}

function JourneyRow({
  label,
  value,
  delay = 0,
}: {
  label: string
  value: number
  delay?: number
}) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="flex items-center justify-between py-3 border-b border-foreground/[0.04] last:border-0"
    >
      <span
        className={cn(
          "text-sm text-muted-foreground transition-all ease-out",
          visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
        )}
        style={{ transitionDuration: "400ms", transitionDelay: `${delay}ms` }}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums transition-all ease-out",
          visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        )}
        style={{ transitionDuration: "400ms", transitionDelay: `${delay + 80}ms` }}
      >
        {value}
      </span>
    </div>
  )
}

function QuickLink({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between rounded-xl bg-card ring-1 ring-foreground/[0.06] px-4 py-3.5 hover:ring-foreground/10 transition-all duration-200"
    >
      <div>
        <p className="text-sm font-medium group-hover:text-brand transition-colors">{label}</p>
        <p className="text-[11px] text-muted-foreground/40">{sub}</p>
      </div>
      <AltArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-brand group-hover:translate-x-0.5 transition-all duration-200" />
    </a>
  )
}
