"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useConfetti } from "@/components/effects/confetti"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Heart,
  Target,
  ClockCircle,
  Restart,
  Stars,
  MenuDots,
  TrashBinTrash,
  Pen2,
  Pause,
  Play,
  Bell,
  AltArrowRight,
} from "@solar-icons/react"
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

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  one_time: "Once",
}

export function ItemList({ items, currentUserId, spaceStrengths = [], spaceId, memberNames, lastCheckins = {} }: ItemListProps) {
  const [localItems, setLocalItems] = useState(items)
  const [sendingStrength, setSendingStrength] = useState<string | null>(null)
  const [sentStrength, setSentStrength] = useState<string | null>(null)
  const [receivedFlash, setReceivedFlash] = useState<Map<string, string>>(new Map())
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set())
  const [localCheckins, setLocalCheckins] = useState<Record<string, string>>(lastCheckins)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const [expandedRemindersId, setExpandedRemindersId] = useState<string | null>(null)
  const supabase = createClient()
  const fireConfetti = useConfetti()
  const checkBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const router = useRouter()

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
            setTimeout(() => {
              setReceivedFlash((prev) => {
                const next = new Map(prev)
                next.delete(strength.item_id)
                return next
              })
            }, 3000)
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

    const btn = checkBtnRefs.current.get(itemId)
    if (btn) {
      const rect = btn.getBoundingClientRect()
      fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
    } else {
      fireConfetti()
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
    setExpandedRemindersId(null)
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
    toast.success("Strength sent!")
    setTimeout(() => setSentStrength(null), 2000)
  }

  if (localItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-2xl bg-muted/60 p-5 mb-4">
          <Target className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold mb-1">No goals yet</h3>
        <p className="text-xs text-muted-foreground max-w-[220px]">
          Add your first goal to start tracking progress with your partners.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-2xl bg-card ring-1 ring-foreground/10 overflow-hidden divide-y divide-foreground/5">
        {localItems.map((item) => {
          const isOwn = item.user_id === currentUserId
          const justSent = sentStrength === item.id
          const justCheckedIn = checkedIn.has(item.id)
          const ownerName = !isOwn && memberNames ? memberNames[item.user_id] : undefined
          const flashSender = receivedFlash.get(item.id)
          const lastCheckin = localCheckins[item.id]
          const freq = frequencyLabels[item.frequency] ?? item.frequency

          let onCooldown = false
          let cooldownLabel = ""
          if (lastCheckin && item.frequency !== "one_time") {
            const nextTime = getNextCheckinTime(item.frequency, lastCheckin)
            if (nextTime.getTime() > Date.now()) {
              onCooldown = true
              cooldownLabel = formatTimeUntil(nextTime)
            }
          }

          const isChecked = item.status === "completed" || justCheckedIn || onCooldown
          const isPaused = item.status === "paused"
          const isCompleted = item.status === "completed"

          return (
            <div
              key={item.id}
              className={cn(
                "relative transition-opacity duration-200",
                isPaused && "opacity-50"
              )}
            >
              {flashSender && (
                <div className="px-4 py-1.5 bg-pink-50 dark:bg-pink-500/5 text-[11px] text-pink-500 font-medium flex items-center gap-1.5 animate-in fade-in duration-300">
                  <Heart className="h-3 w-3 fill-pink-500" />
                  {flashSender} sent you strength!
                </div>
              )}

              <div className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-muted/30">
                {isOwn ? (
                  <button
                    ref={(el) => { if (el) checkBtnRefs.current.set(item.id, el); else checkBtnRefs.current.delete(item.id) }}
                    onClick={() => !isChecked && !isPaused && handleCheckin(item.id)}
                    disabled={isChecked || isPaused}
                    className={cn(
                      "shrink-0 h-[22px] w-[22px] rounded-full flex items-center justify-center transition-all duration-300",
                      isChecked
                        ? "bg-foreground"
                        : isPaused
                          ? "ring-[1.5px] ring-foreground/15"
                          : "ring-[1.5px] ring-foreground/25 hover:ring-foreground/50 active:scale-90"
                    )}
                  >
                    {isChecked && <CheckCircle className="h-3 w-3 text-background" />}
                    {isPaused && <Pause className="h-2.5 w-2.5 text-muted-foreground" />}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendStrength(item.id, item.user_id)}
                    disabled={sendingStrength === item.id || justSent}
                    className="shrink-0 h-[22px] w-[22px] rounded-full flex items-center justify-center transition-all duration-300 active:scale-90"
                  >
                    {sendingStrength === item.id ? (
                      <Restart className="h-3.5 w-3.5 text-pink-400 animate-spin" />
                    ) : (
                      <Heart
                        className={cn(
                          "h-3.5 w-3.5 transition-all duration-300",
                          justSent
                            ? "text-pink-500 fill-pink-500 scale-110"
                            : "text-pink-400"
                        )}
                      />
                    )}
                  </button>
                )}

                <button
                  onClick={() => spaceId && router.push(`/spaces/${spaceId}/goals/${item.id}`)}
                  className="flex-1 min-w-0 text-left group/title"
                >
                  <div className="flex items-center gap-1.5">
                    <p
                      className={cn(
                        "text-[14px] leading-tight truncate group-hover/title:text-brand transition-colors",
                        isCompleted
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      )}
                    >
                      {item.title}
                    </p>
                    <AltArrowRight className="h-3 w-3 text-muted-foreground/0 group-hover/title:text-brand group-hover/title:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  {ownerName && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {ownerName}
                    </p>
                  )}
                </button>

                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {isOwn && (onCooldown || justCheckedIn) ? (
                    <span className="flex items-center gap-1 text-foreground/60">
                      <ClockCircle className="h-3 w-3" />
                      {cooldownLabel || "done"}
                    </span>
                  ) : isPaused ? (
                    "Paused"
                  ) : (
                    freq
                  )}
                </span>

                {isOwn && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="shrink-0 p-1 -mr-1 rounded-lg text-muted-foreground/40 hover:text-foreground transition-colors data-popup-open:text-foreground">
                      <MenuDots className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
                      <DropdownMenuItem onClick={() => startEditing(item)}>
                        <Pen2 className="h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                      {item.status === "active" && (
                        <DropdownMenuItem
                          onClick={() =>
                            setExpandedRemindersId(
                              expandedRemindersId === item.id ? null : item.id
                            )
                          }
                        >
                          <Bell className="h-3.5 w-3.5" />
                          Reminders
                        </DropdownMenuItem>
                      )}
                      {(item.status === "active" || item.status === "paused") && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleTogglePause(item.id, item.status)}
                          >
                            {isPaused ? (
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
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <Restart className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <TrashBinTrash className="h-3.5 w-3.5" />
                        )}
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {editingId === item.id && isOwn && (
                <div className="px-4 pb-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="rounded-xl bg-muted/30 ring-1 ring-foreground/5 p-3 space-y-2.5">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={80}
                      placeholder="Title"
                      className="w-full bg-card rounded-lg ring-1 ring-foreground/10 px-3 py-2 text-sm outline-none focus:ring-brand transition-colors"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      placeholder="Description (optional)"
                      className="w-full bg-card rounded-lg ring-1 ring-foreground/10 px-3 py-2 text-sm outline-none focus:ring-brand transition-colors resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(item.id)}
                        disabled={savingEdit || !editTitle.trim()}
                        className="h-8 text-xs rounded-lg gap-1.5"
                      >
                        {savingEdit ? (
                          <Restart className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {savingEdit ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        className="h-8 text-xs rounded-lg text-muted-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {expandedRemindersId === item.id && isOwn && item.status === "active" && (
                <div className="px-4 pb-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <ReminderSettings
                    itemId={item.id}
                    currentSchedule={item.reminder_schedule as ReminderSchedule | null}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
