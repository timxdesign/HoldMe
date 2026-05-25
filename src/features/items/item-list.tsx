"use client"

import { useState, useEffect, useCallback } from "react"
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
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ReminderSettings } from "./reminder-settings"

type ReminderSchedule = { enabled: boolean; times: string[]; timezone: string; days: number[] }

interface Item {
  id: string
  title: string
  description: string | null
  type: string
  frequency: string
  status: string
  user_id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reminder_schedule: any
}

interface ItemListProps {
  items: Item[]
  currentUserId: string
  spaceStrengths?: { id: string; accountability_items: unknown }[]
  spaceId?: string
  memberNames?: Record<string, string>
}

const typeConfig: Record<string, { icon: typeof Target; color: string; bg: string }> = {
  goal: { icon: Target, color: "text-brand", bg: "bg-brand/10" },
  habit: { icon: Repeat, color: "text-green-500", bg: "bg-green-500/10" },
  task: { icon: CheckSquare, color: "text-orange-500", bg: "bg-orange-500/10" },
  commitment: { icon: Handshake, color: "text-purple-500", bg: "bg-purple-500/10" },
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "text-green-600 bg-green-500/10", dot: "bg-green-500" },
  in_progress: { label: "In Progress", color: "text-blue-600 bg-blue-500/10", dot: "bg-blue-500" },
  completed: { label: "Completed", color: "text-brand bg-brand/10", dot: "bg-brand" },
  missed: { label: "Missed", color: "text-red-600 bg-red-500/10", dot: "bg-red-500" },
  paused: { label: "Paused", color: "text-muted-foreground bg-muted", dot: "bg-muted-foreground" },
}

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  one_time: "One-time",
}

function HeartBurst({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-ping"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDuration: `${0.6 + Math.random() * 0.4}s`,
            animationDelay: `${i * 0.08}s`,
          }}
        >
          <Heart className="h-3 w-3 text-pink-500 fill-pink-500" style={{ opacity: 0.7 }} />
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
      <div className="absolute inset-0 rounded-2xl ring-2 ring-pink-500/40 animate-pulse" />
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-pink-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full animate-in slide-in-from-top-2 duration-300">
        <Heart className="h-3 w-3 fill-white" />
        {senderName} sent strength!
      </div>
    </div>
  )
}

export function ItemList({ items, currentUserId, spaceStrengths = [], spaceId, memberNames }: ItemListProps) {
  const [localItems, setLocalItems] = useState(items)
  const [sendingStrength, setSendingStrength] = useState<string | null>(null)
  const [sentStrength, setSentStrength] = useState<string | null>(null)
  const [receivedFlash, setReceivedFlash] = useState<Map<string, string>>(new Map())
  const supabase = createClient()

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
    const { error } = await supabase.from("item_checkins").insert({
      item_id: itemId,
      user_id: currentUserId,
      status: "completed",
    })

    if (error) {
      toast.error("Failed to check in")
      return
    }

    setLocalItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: "completed" } : item
      )
    )
    toast.success("Checked in!")
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-2xl bg-muted/60 p-4 mb-4">
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
    <div className="space-y-3">
      {localItems.map((item) => {
        const isOwn = item.user_id === currentUserId
        const type = typeConfig[item.type] ?? typeConfig.goal
        const status = statusConfig[item.status] ?? statusConfig.active
        const hasStrengths = spaceStrengths.some(
          (s) => (s.accountability_items as { title: string } | null)?.title === item.title
        )
        const flashSender = receivedFlash.get(item.id)
        const justSent = sentStrength === item.id
        const ownerName = !isOwn && memberNames ? memberNames[item.user_id] : undefined
        const TypeIcon = type.icon

        return (
          <div
            key={item.id}
            className={cn(
              "relative overflow-hidden rounded-2xl bg-card ring-1 transition-all duration-300",
              isOwn
                ? "ring-foreground/10 hover:ring-brand/25 hover:shadow-md"
                : "ring-foreground/8 hover:ring-foreground/15 hover:shadow-sm"
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

            {isOwn && (
              <div className={cn("h-0.5", type.bg.replace("/10", "/30"))} />
            )}

            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className={cn("rounded-xl p-2 shrink-0 mt-0.5", type.bg)}>
                  <TypeIcon className={cn("h-4 w-4", type.color)} />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm leading-snug">{item.title}</h4>
                    {hasStrengths && isOwn && (
                      <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500 animate-pulse shrink-0 mt-0.5" />
                    )}
                  </div>

                  {ownerName && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{ownerName}</span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pl-11">
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", status.color)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {frequencyLabels[item.frequency] ?? item.frequency}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-11 pt-0.5">
                {isOwn ? (
                  <>
                    {item.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleCheckin(item.id)}
                        className="gap-1.5 rounded-lg h-8 text-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Check in
                      </Button>
                    )}
                    {item.status === "active" && (
                      <Button size="sm" variant="outline" className="gap-1.5 rounded-lg h-8 text-xs">
                        <Pause className="h-3.5 w-3.5" />
                        Pause
                      </Button>
                    )}
                    {item.status === "paused" && (
                      <Button size="sm" variant="outline" className="gap-1.5 rounded-lg h-8 text-xs">
                        <Play className="h-3.5 w-3.5" />
                        Resume
                      </Button>
                    )}
                    {item.status === "completed" && (
                      <span className="text-[11px] text-brand font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Completed
                      </span>
                    )}
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendStrength(item.id, item.user_id)}
                    disabled={sendingStrength === item.id || justSent}
                    className={cn(
                      "gap-1.5 rounded-lg h-8 text-xs transition-all duration-300",
                      justSent
                        ? "text-white bg-pink-500 border-pink-500 hover:bg-pink-500 hover:text-white"
                        : "text-pink-500 border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-600"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-3.5 w-3.5 transition-all duration-300",
                        justSent && "fill-white scale-110"
                      )}
                    />
                    {sendingStrength === item.id
                      ? "Sending..."
                      : justSent
                        ? "Sent!"
                        : "Send Strength"}
                  </Button>
                )}
              </div>

              {isOwn && item.status === "active" && (
                <div className="pl-11 pt-1 border-t border-foreground/5 mt-1">
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
  )
}
