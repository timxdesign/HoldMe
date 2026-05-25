"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Pause,
  Play,
  Heart,
  Target,
  Repeat,
  CheckSquare,
  Handshake,
  Clock,
  User,
  Filter,
  Loader2,
  Sparkles,
  MoreHorizontal,
  Trash2,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ReminderSettings } from "./reminder-settings"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type ReminderSchedule = { enabled: boolean; times: string[]; timezone: string; days: number[] }

interface Item {
  id: string
  title: string
  description: string | null
  type: string
  frequency: string
  status: string
  user_id: string
  created_at: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reminder_schedule: any
}

interface ItemListProps {
  items: Item[]
  currentUserId: string
  spaceStrengths?: { id: string; accountability_items: unknown }[]
  spaceId?: string
  memberNames?: Record<string, string>
  lastCheckins?: Record<string, string>
}

function getNextCheckinTime(frequency: string, lastCheckinAt: string): Date {
  const last = new Date(lastCheckinAt)
  switch (frequency) {
    case "daily": {
      const next = new Date(last)
      next.setDate(next.getDate() + 1)
      next.setHours(0, 0, 0, 0)
      return next
    }
    case "weekly": {
      const next = new Date(last)
      next.setDate(next.getDate() + (7 - next.getDay() || 7))
      next.setHours(0, 0, 0, 0)
      return next
    }
    case "monthly": {
      const next = new Date(last)
      next.setMonth(next.getMonth() + 1, 1)
      next.setHours(0, 0, 0, 0)
      return next
    }
    default:
      return new Date(0)
  }
}

function formatTimeUntil(target: Date): string {
  const now = Date.now()
  const diff = target.getTime() - now
  if (diff <= 0) return ""

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours >= 24) {
    const days = Math.ceil(hours / 24)
    return `${days}d`
  }
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

const typeConfig: Record<string, { icon: typeof Target; label: string; color: string; bg: string; gradient: string }> = {
  goal: { icon: Target, label: "Goal", color: "text-brand", bg: "bg-brand/10", gradient: "from-brand/20 to-brand/5" },
  habit: { icon: Repeat, label: "Habit", color: "text-green-500", bg: "bg-green-500/10", gradient: "from-green-500/20 to-green-500/5" },
  task: { icon: CheckSquare, label: "Task", color: "text-orange-500", bg: "bg-orange-500/10", gradient: "from-orange-500/20 to-orange-500/5" },
  commitment: { icon: Handshake, label: "Commitment", color: "text-purple-500", bg: "bg-purple-500/10", gradient: "from-purple-500/20 to-purple-500/5" },
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: "Active", color: "text-green-600", bg: "bg-green-500/10", dot: "bg-green-500" },
  in_progress: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-500/10", dot: "bg-blue-500" },
  completed: { label: "Done", color: "text-brand", bg: "bg-brand/10", dot: "bg-brand" },
  missed: { label: "Missed", color: "text-red-600", bg: "bg-red-500/10", dot: "bg-red-500" },
  paused: { label: "Paused", color: "text-muted-foreground", bg: "bg-muted", dot: "bg-muted-foreground" },
}

const frequencyConfig: Record<string, { label: string; short: string }> = {
  daily: { label: "Daily", short: "D" },
  weekly: { label: "Weekly", short: "W" },
  monthly: { label: "Monthly", short: "M" },
  one_time: { label: "One-time", short: "1x" },
}

type FilterTab = "all" | "mine" | "partners"

function HeartBurst({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-ping"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
            animationDelay: `${i * 0.06}s`,
          }}
        >
          <Heart className="h-3 w-3 text-pink-500 fill-pink-500" style={{ opacity: 0.8 }} />
        </div>
      ))}
    </div>
  )
}

function StrengthReceivedFlash({ senderName, onDone }: { senderName: string; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="absolute inset-0 pointer-events-none rounded-2xl z-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 rounded-2xl ring-2 ring-pink-500/30 animate-pulse" />
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-pink-500 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-pink-500/20 animate-in slide-in-from-top-2 duration-300">
        <Heart className="h-3 w-3 fill-white" />
        {senderName} sent strength!
      </div>
    </div>
  )
}

export function ItemList({ items, currentUserId, spaceStrengths = [], spaceId, memberNames, lastCheckins = {} }: ItemListProps) {
  const [localItems, setLocalItems] = useState(items)
  const [sendingStrength, setSendingStrength] = useState<string | null>(null)
  const [sentStrength, setSentStrength] = useState<string | null>(null)
  const [receivedFlash, setReceivedFlash] = useState<Map<string, string>>(new Map())
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set())
  const [localCheckins, setLocalCheckins] = useState<Record<string, string>>(lastCheckins)
  const [filter, setFilter] = useState<FilterTab>("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const supabase = createClient()

  const hasPartnerItems = localItems.some((item) => item.user_id !== currentUserId)

  const filteredItems = useMemo(() => {
    if (filter === "mine") return localItems.filter((i) => i.user_id === currentUserId)
    if (filter === "partners") return localItems.filter((i) => i.user_id !== currentUserId)
    return localItems
  }, [localItems, filter, currentUserId])

  const handleRealtimeStrength = useCallback(
    (payload: { new: { item_id: string; sender_id: string } }) => {
      const strength = payload.new
      const targetItem = localItems.find(
        (item) => item.id === strength.item_id && item.user_id === currentUserId
      )
      if (targetItem && strength.sender_id !== currentUserId) {
        supabase
          .from("users")
          .select("full_name")
          .eq("id", strength.sender_id)
          .single()
          .then(({ data }) => {
            const name = data?.full_name ?? "Someone"
            setReceivedFlash((prev) => new Map(prev).set(strength.item_id, name))
          })
      }
    },
    [localItems, currentUserId, supabase]
  )

  useEffect(() => {
    if (!spaceId) return

    const channel = supabase
      .channel(`strengths-space-${spaceId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "strengths" },
        handleRealtimeStrength
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [spaceId, supabase, handleRealtimeStrength])

  async function handleCheckin(itemId: string) {
    const item = localItems.find((i) => i.id === itemId)
    if (!item) return

    setCheckedIn((prev) => new Set(prev).add(itemId))

    const { error } = await supabase.from("item_checkins").insert({
      item_id: itemId,
      user_id: currentUserId,
      status: "completed",
    })

    if (error) {
      setCheckedIn((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
      toast.error("Failed to check in")
      return
    }

    const now = new Date().toISOString()
    setLocalCheckins((prev) => ({ ...prev, [itemId]: now }))

    if (item.frequency === "one_time") {
      setLocalItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: "completed" } : i))
      )
    }

    toast.success("Checked in!")
  }

  async function handleTogglePause(itemId: string, currentStatus: string) {
    const newStatus = currentStatus === "paused" ? "active" : "paused"
    const { error } = await supabase
      .from("accountability_items")
      .update({ status: newStatus })
      .eq("id", itemId)

    if (error) {
      toast.error("Failed to update status")
      return
    }

    setLocalItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    )
    toast.success(newStatus === "paused" ? "Goal paused" : "Goal resumed")
  }

  async function handleDelete(itemId: string) {
    setDeletingId(itemId)
    const { error } = await supabase
      .from("accountability_items")
      .delete()
      .eq("id", itemId)

    setDeletingId(null)

    if (error) {
      toast.error("Failed to delete")
      return
    }

    setLocalItems((prev) => prev.filter((item) => item.id !== itemId))
    toast.success("Goal deleted")
  }

  function startEditing(item: Item) {
    setEditingId(item.id)
    setEditTitle(item.title)
    setEditDescription(item.description ?? "")
  }

  async function handleSaveEdit(itemId: string) {
    if (!editTitle.trim()) {
      toast.error("Title can't be empty")
      return
    }
    setSavingEdit(true)

    const { error } = await supabase
      .from("accountability_items")
      .update({ title: editTitle.trim(), description: editDescription.trim() || null })
      .eq("id", itemId)

    setSavingEdit(false)

    if (error) {
      toast.error("Failed to update")
      return
    }

    setLocalItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, title: editTitle.trim(), description: editDescription.trim() || null }
          : i
      )
    )
    setEditingId(null)
    toast.success("Goal updated")
  }

  async function handleSendStrength(itemId: string, receiverId: string) {
    setSendingStrength(itemId)
    const { error } = await supabase.from("strengths").insert({
      item_id: itemId,
      sender_id: currentUserId,
      receiver_id: receiverId,
    })

    setSendingStrength(null)

    if (error) {
      toast.error("Could not send strength")
      return
    }

    setSentStrength(itemId)
    toast.success("Strength sent! They'll be notified.")
    setTimeout(() => setSentStrength(null), 2000)
  }

  if (localItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative mb-5">
          <div className="rounded-2xl bg-muted/60 p-5">
            <Target className="h-7 w-7 text-muted-foreground" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-brand/40" />
        </div>
        <h3 className="text-sm font-semibold mb-1.5">No goals yet</h3>
        <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
          Add your first goal to start tracking progress with your partners.
        </p>
      </div>
    )
  }

  const counts = {
    all: localItems.length,
    mine: localItems.filter((i) => i.user_id === currentUserId).length,
    partners: localItems.filter((i) => i.user_id !== currentUserId).length,
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      {hasPartnerItems && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {(["all", "mine", "partners"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                filter === tab
                  ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "all" && <Filter className="h-3 w-3" />}
              {tab === "mine" && <User className="h-3 w-3" />}
              {tab === "partners" && <Heart className="h-3 w-3" />}
              {tab === "all" ? "All" : tab === "mine" ? "Mine" : "Partners"}
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                filter === tab ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground"
              )}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Item list */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isOwn = item.user_id === currentUserId
          const type = typeConfig[item.type] ?? typeConfig.goal
          const status = statusConfig[item.status] ?? statusConfig.active
          const freq = frequencyConfig[item.frequency] ?? frequencyConfig.daily
          const hasStrengths = spaceStrengths.some(
            (s) => (s.accountability_items as { title: string } | null)?.title === item.title
          )
          const flashSender = receivedFlash.get(item.id)
          const justSent = sentStrength === item.id
          const justCheckedIn = checkedIn.has(item.id)
          const ownerName = !isOwn && memberNames ? memberNames[item.user_id] : undefined
          const TypeIcon = type.icon
          const lastCheckin = localCheckins[item.id]
          let onCooldown = false
          let cooldownLabel = ""
          if (lastCheckin && item.frequency !== "one_time") {
            const nextTime = getNextCheckinTime(item.frequency, lastCheckin)
            if (nextTime.getTime() > Date.now()) {
              onCooldown = true
              cooldownLabel = formatTimeUntil(nextTime)
            }
          }

          return (
            <div
              key={item.id}
              className={cn(
                "relative overflow-hidden rounded-2xl bg-card ring-1 transition-all duration-300 group",
                item.status === "completed"
                  ? "ring-foreground/5 opacity-75 hover:opacity-100"
                  : item.status === "paused"
                    ? "ring-foreground/5 opacity-60 hover:opacity-100"
                    : isOwn
                      ? "ring-foreground/10 hover:ring-brand/25 hover:shadow-lg hover:shadow-brand/5"
                      : "ring-foreground/8 hover:ring-foreground/15 hover:shadow-md"
              )}
            >
              {justSent && <HeartBurst onDone={() => setSentStrength(null)} />}
              {flashSender && (
                <StrengthReceivedFlash
                  senderName={flashSender}
                  onDone={() =>
                    setReceivedFlash((prev) => {
                      const next = new Map(prev)
                      next.delete(item.id)
                      return next
                    })
                  }
                />
              )}

              {/* Type gradient accent bar */}
              {isOwn && item.status !== "completed" && item.status !== "paused" && (
                <div className={cn("h-[3px] bg-gradient-to-r", type.gradient)} />
              )}

              <div className="p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "rounded-xl p-2.5 shrink-0 transition-transform duration-300 group-hover:scale-105",
                    type.bg
                  )}>
                    <TypeIcon className={cn("h-4 w-4", type.color)} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className={cn(
                          "font-semibold text-sm leading-snug",
                          item.status === "completed" && "line-through text-muted-foreground"
                        )}>
                          {item.title}
                        </h4>
                        {ownerName && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-brand/40 to-purple-500/40 flex items-center justify-center">
                              <span className="text-[7px] font-bold text-white">
                                {ownerName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">{ownerName}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {hasStrengths && isOwn && (
                          <div className="flex items-center gap-1 bg-pink-500/10 rounded-full px-2 py-0.5">
                            <Heart className="h-3 w-3 text-pink-500 fill-pink-500 animate-pulse" />
                            <span className="text-[10px] text-pink-500 font-medium">Supported</span>
                          </div>
                        )}
                        {isOwn && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors data-popup-open:bg-muted data-popup-open:text-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
                              <DropdownMenuItem onClick={() => startEditing(item)}>
                                <Pencil className="h-3.5 w-3.5" />
                                Edit goal
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(item.id)}
                                disabled={deletingId === item.id}
                              >
                                {deletingId === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                {deletingId === item.id ? "Deleting..." : "Delete goal"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta pills */}
                <div className="flex items-center gap-1.5 pl-[52px]">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    status.bg, status.color
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {freq.label}
                  </span>
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5",
                    type.bg, type.color
                  )}>
                    {type.label}
                  </span>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 pl-[52px] pt-1">
                  {isOwn ? (
                    <>
                      {item.status === "completed" && !justCheckedIn ? (
                        <span className="text-[11px] text-green-500 font-medium flex items-center gap-1.5 bg-green-500/10 rounded-full px-3 py-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </span>
                      ) : item.status !== "completed" && item.status !== "paused" && (
                        onCooldown ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-green-500 bg-green-500/10 rounded-full px-3 py-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Checked in
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 rounded-full px-2.5 py-1">
                              <Clock className="h-2.5 w-2.5" />
                              Next in {cooldownLabel}
                            </span>
                          </div>
                        ) : justCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-green-500 bg-green-500/10 rounded-full px-3 py-1.5 animate-in fade-in duration-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Done! Next check-in {item.frequency === "one_time" ? "n/a" : freq.label.toLowerCase()}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleCheckin(item.id)}
                            className="gap-1.5 rounded-xl h-9 text-xs font-medium"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Check in
                          </Button>
                        )
                      )}
                      {(item.status === "active" || item.status === "paused") && !onCooldown && !justCheckedIn && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTogglePause(item.id, item.status)}
                          className="gap-1.5 rounded-xl h-9 text-xs"
                        >
                          {item.status === "paused" ? (
                            <>
                              <Play className="h-3.5 w-3.5" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="h-3.5 w-3.5" />
                              Pause
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendStrength(item.id, item.user_id)}
                      disabled={sendingStrength === item.id || justSent}
                      className={cn(
                        "gap-1.5 rounded-xl h-9 text-xs font-medium transition-all duration-300",
                        justSent
                          ? "text-white bg-pink-500 border-pink-500 hover:bg-pink-500 hover:text-white shadow-lg shadow-pink-500/20"
                          : "text-pink-500 border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-600"
                      )}
                    >
                      {sendingStrength === item.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Heart
                            className={cn(
                              "h-3.5 w-3.5 transition-all duration-300",
                              justSent && "fill-white scale-110"
                            )}
                          />
                          {justSent ? "Sent!" : "Send Strength"}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Inline edit form */}
                {editingId === item.id && isOwn && (
                  <div className="pl-[52px] pt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="rounded-xl ring-1 ring-foreground/10 bg-muted/30 p-3 space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                          Title
                        </label>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={80}
                          className="w-full rounded-lg ring-1 ring-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:ring-brand transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                          Description
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg ring-1 ring-foreground/10 bg-card px-3 py-2 text-sm outline-none focus:ring-brand transition-colors resize-none"
                          placeholder="Optional details..."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(item.id)}
                          disabled={savingEdit || !editTitle.trim()}
                          className="gap-1.5 rounded-lg h-8 text-xs"
                        >
                          {savingEdit ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {savingEdit ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg h-8 text-xs text-muted-foreground"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reminder settings */}
                {isOwn && item.status === "active" && (
                  <div className="pl-[52px] pt-1 border-t border-foreground/5 mt-1">
                    <ReminderSettings
                      itemId={item.id}
                      currentSchedule={item.reminder_schedule as ReminderSchedule | null}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === "mine"
              ? "You haven't added any goals yet."
              : "No partner goals in this space yet."}
          </p>
        </div>
      )}
    </div>
  )
}
