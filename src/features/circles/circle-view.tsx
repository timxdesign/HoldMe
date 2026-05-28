"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useConfetti } from "@/components/effects/confetti"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AddCircle,
  AltArrowRight,
  ChatRound,
  CheckCircle,
  Copy,
  Heart,
  Link as LinkIcon,
  Restart,
  Target,
  UserPlus,
  TrashBinTrash,
  Record,
} from "@solar-icons/react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface CircleViewProps {
  circle: {
    id: string
    name: string
    emoji: string
    created_by: string
  }
  goals: {
    id: string
    title: string
    description: string | null
    type: string
    frequency: string
    created_by: string
    status: string
    created_at: string
  }[]
  members: {
    user_id: string
    role: string
    users: { full_name: string | null } | null
  }[]
  memberNames: Record<string, string>
  recentCheckins: {
    id: string
    goal_id: string
    user_id: string
    note: string | null
    checked_in_at: string
  }[]
  currentUserId: string
  isOwner: boolean
  commentCounts?: Record<string, number>
  strengthCounts?: Record<string, number>
  latestComments?: Record<string, string>
}

const CIRCLE_GOAL_SEEN_KEY = "holdme-circle-goal-seen"

function hasNewComment(goalId: string, latestComment: string | undefined): boolean {
  if (!latestComment || typeof localStorage === "undefined") return false
  try {
    const seen = JSON.parse(localStorage.getItem(CIRCLE_GOAL_SEEN_KEY) || "{}")
    const lastSeen = seen[goalId]
    if (!lastSeen) return true
    return new Date(latestComment).getTime() > new Date(lastSeen).getTime()
  } catch { return false }
}

const frequencyLabels: Record<string, string> = {
  daily: "Daily", weekly: "Weekly", monthly: "Monthly", one_time: "Once",
}

const typeLabels: Record<string, string> = {
  goal: "Goal", task: "Task", habit: "Habit", commitment: "Commitment",
}

export function CircleView({
  circle,
  goals: initialGoals,
  members,
  memberNames,
  recentCheckins: initialCheckins,
  currentUserId,
  isOwner,
  commentCounts = {},
  strengthCounts = {},
  latestComments = {},
}: CircleViewProps) {
  const [goals, setGoals] = useState(initialGoals)
  const [checkins, setCheckins] = useState(initialCheckins)
  const [checkingIn, setCheckingIn] = useState<string | null>(null)
  const [justChecked, setJustChecked] = useState<Set<string>>(new Set())
  const [showInvite, setShowInvite] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const fireConfetti = useConfetti()
  const checkinBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [copied, setCopied] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const activeGoals = goals.filter((g) => g.status === "active")

  async function handleCheckin(goalId: string) {
    setCheckingIn(goalId)

    const { data, error } = await supabase
      .from("circle_checkins")
      .insert({ goal_id: goalId, user_id: currentUserId })
      .select()
      .single()

    setCheckingIn(null)
    if (error) { toast.error("Failed to check in"); return }

    const btn = checkinBtnRefs.current.get(goalId)
    if (btn) {
      const rect = btn.getBoundingClientRect()
      fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
    } else { fireConfetti() }

    setCheckins([data, ...checkins])
    setJustChecked((prev) => new Set(prev).add(goalId))
    toast.success("Checked in!")
    setTimeout(() => {
      setJustChecked((prev) => { const next = new Set(prev); next.delete(goalId); return next })
    }, 2000)
  }

  async function handleDeleteGoal(goalId: string) {
    const { error } = await supabase.from("circle_goals").delete().eq("id", goalId)
    if (error) { toast.error("Failed to delete"); return }
    setGoals(goals.filter((g) => g.id !== goalId))
    toast.success("Goal removed")
  }

  async function handleGenerateLink() {
    setGeneratingLink(true)
    const { data, error } = await supabase
      .from("circle_invites")
      .insert({ circle_id: circle.id, inviter_id: currentUserId })
      .select()
      .single()

    setGeneratingLink(false)
    if (error) { toast.error(error.message); return }
    setInviteLink(`${window.location.origin}/circle-invite/${data.token}`)
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const goalCheckinMap: Record<string, typeof checkins> = {}
  for (const c of checkins) {
    if (!goalCheckinMap[c.goal_id]) goalCheckinMap[c.goal_id] = []
    goalCheckinMap[c.goal_id].push(c)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted/60 text-xl">
          {circle.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold tracking-tight truncate">{circle.name}</h1>
          <p className="text-xs text-muted-foreground/60">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isOwner && (
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={() => setShowInvite(!showInvite)}>
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </Button>
        )}
      </div>

      {/* Invite panel */}
      {showInvite && (
        <div className="rounded-xl bg-muted/40 ring-1 ring-foreground/[0.06] p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {!inviteLink ? (
            <Button variant="outline" className="w-full gap-2" onClick={handleGenerateLink} disabled={generatingLink}>
              {generatingLink ? <Restart className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
              Generate invite link
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="text-xs h-9" />
              <Button size="icon" variant="outline" onClick={handleCopy} className="h-9 w-9 shrink-0">
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Members row */}
      <div className="flex items-center gap-1.5">
        {members.map((m) => (
          <div
            key={m.user_id}
            className="h-8 w-8 rounded-full bg-gradient-to-br from-brand/60 to-purple-500/60 flex items-center justify-center ring-2 ring-background -ml-1 first:ml-0"
            title={(m.users as { full_name: string | null } | null)?.full_name ?? "Member"}
          >
            <span className="text-[10px] font-bold text-white">
              {((m.users as { full_name: string | null } | null)?.full_name ?? "?").charAt(0).toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Goals */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground/70 uppercase tracking-wide">Goals</h2>
          <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" asChild>
            <Link href={`/create?circle=${circle.id}`}>
              <AddCircle className="h-3.5 w-3.5" />
              Add Goal
            </Link>
          </Button>
        </div>

        {activeGoals.length > 0 ? (
          <div className="space-y-2">
            {activeGoals.map((goal) => {
              const goalCheckins = goalCheckinMap[goal.id] ?? []
              const isJustChecked = justChecked.has(goal.id)
              const isLoading = checkingIn === goal.id
              const canDelete = goal.created_by === currentUserId || isOwner
              const commentCount = commentCounts[goal.id] ?? 0
              const strengthCount = strengthCounts[goal.id] ?? 0
              const hasNew = hasNewComment(goal.id, latestComments[goal.id])

              const uniqueCheckers = [...new Map(goalCheckins.map((c) => [c.user_id, c])).values()]

              return (
                <div key={goal.id} className="rounded-xl bg-card ring-1 ring-foreground/[0.06] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      ref={(el) => { if (el) checkinBtnRefs.current.set(goal.id, el); else checkinBtnRefs.current.delete(goal.id) }}
                      onClick={() => handleCheckin(goal.id)}
                      disabled={isLoading || isJustChecked}
                      className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isJustChecked
                          ? "bg-green-500 text-white scale-110"
                          : "ring-1 ring-foreground/10 hover:ring-brand hover:bg-brand/5"
                      }`}
                    >
                      {isLoading ? (
                        <Restart className="h-3.5 w-3.5 animate-spin" />
                      ) : isJustChecked ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                    </button>

                    <button
                      onClick={() => router.push(`/circles/${circle.id}/goals/${goal.id}`)}
                      className="flex-1 min-w-0 text-left group/title"
                    >
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate group-hover/title:text-brand transition-colors">
                          {goal.title}
                        </p>
                        <AltArrowRight className="h-3 w-3 text-muted-foreground/0 group-hover/title:text-brand group-hover/title:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      {goal.type !== "goal" && (
                        <span className="text-[10px] text-muted-foreground/50">{typeLabels[goal.type]} · {frequencyLabels[goal.frequency]}</span>
                      )}
                    </button>

                    <div className="shrink-0 flex items-center gap-2">
                      {commentCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                          {hasNew && <span className="h-1.5 w-1.5 rounded-full bg-brand animate-in fade-in duration-300" />}
                          <ChatRound className="h-3 w-3" />
                          {commentCount}
                        </span>
                      )}
                      {strengthCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-pink-500 tabular-nums">
                          <Heart className="h-3 w-3 fill-current" />
                          {strengthCount}
                        </span>
                      )}
                    </div>

                    {canDelete && (
                      <button onClick={() => handleDeleteGoal(goal.id)} className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/5 transition-colors">
                        <TrashBinTrash className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Who checked in */}
                  {uniqueCheckers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-11">
                      {uniqueCheckers.slice(0, 8).map((c) => (
                        <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-green-500/8 px-2 py-0.5 text-[10px] text-green-600 font-medium">
                          <CheckCircle className="h-2.5 w-2.5" />
                          {memberNames[c.user_id] ?? "Someone"}
                        </span>
                      ))}
                      {uniqueCheckers.length > 8 && (
                        <span className="text-[10px] text-muted-foreground/50 px-1 py-0.5">
                          +{uniqueCheckers.length - 8} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-10 rounded-xl border border-dashed border-foreground/[0.06]">
            <Record className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/50">No goals yet. Add one to get started.</p>
          </div>
        )}
      </section>

      {/* Recent Activity */}
      {checkins.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground/70 uppercase tracking-wide">Activity</h2>
          <div className="space-y-1">
            {checkins.slice(0, 10).map((c) => {
              const goalTitle = goals.find((g) => g.id === c.goal_id)?.title ?? "a goal"
              return (
                <div key={c.id} className="flex items-center gap-3 py-2 px-1">
                  <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  </div>
                  <p className="text-sm flex-1 min-w-0">
                    <span className="font-medium">{memberNames[c.user_id] ?? "Someone"}</span>
                    <span className="text-muted-foreground/60"> checked in on </span>
                    <span className="font-medium">{goalTitle}</span>
                  </p>
                  <span className="text-[11px] text-muted-foreground/40 shrink-0">
                    {formatDistanceToNow(new Date(c.checked_in_at), { addSuffix: true })}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
