"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Pause, Play, Heart, Target } from "lucide-react"
import { toast } from "sonner"

interface Item {
  id: string
  title: string
  description: string | null
  type: string
  frequency: string
  status: string
  user_id: string
}

interface ItemListProps {
  items: Item[]
  currentUserId: string
  spaceStrengths?: { id: string; accountability_items: unknown }[]
  spaceId?: string
}

const statusConfig = {
  active: { variant: "default" as const, color: "bg-green-500" },
  in_progress: { variant: "secondary" as const, color: "bg-blue-500" },
  completed: { variant: "default" as const, color: "bg-brand" },
  missed: { variant: "destructive" as const, color: "bg-red-500" },
  paused: { variant: "outline" as const, color: "bg-muted-foreground" },
}

function HeartBurst({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-10">
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
          <Heart
            className="h-3 w-3 text-pink-500 fill-pink-500"
            style={{ opacity: 0.7 }}
          />
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
    <div className="absolute inset-0 pointer-events-none rounded-xl z-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 rounded-xl ring-2 ring-pink-500/40 animate-pulse" />
      <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-pink-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full animate-in slide-in-from-top-2 duration-300">
        <Heart className="h-3 w-3 fill-white" />
        {senderName} sent strength!
      </div>
    </div>
  )
}

export function ItemList({ items, currentUserId, spaceStrengths = [], spaceId }: ItemListProps) {
  const [localItems, setLocalItems] = useState(items)
  const [sendingStrength, setSendingStrength] = useState<string | null>(null)
  const [sentStrength, setSentStrength] = useState<string | null>(null)
  const [receivedFlash, setReceivedFlash] = useState<Map<string, string>>(new Map())
  const supabase = createClient()

  const strengthCountByItem = new Map<string, number>()
  spaceStrengths.forEach((s) => {
    const item = s.accountability_items as { space_id: string } | null
    if (item) {
      const key = s.id
      strengthCountByItem.set(key, (strengthCountByItem.get(key) ?? 0) + 1)
    }
  })

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
        {
          event: "INSERT",
          schema: "public",
          table: "strengths",
        },
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <Target className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No accountability items yet. Add your first goal to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {localItems.map((item) => {
        const isOwn = item.user_id === currentUserId
        const config = statusConfig[item.status as keyof typeof statusConfig] ?? statusConfig.active
        const hasStrengths = spaceStrengths.some(
          (s) => (s.accountability_items as { space_id: string; title: string } | null)?.title === item.title
        )
        const flashSender = receivedFlash.get(item.id)
        const justSent = sentStrength === item.id

        return (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3 transition-all hover:ring-brand/20"
          >
            {justSent && (
              <HeartBurst onDone={() => setSentStrength(null)} />
            )}

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

            {hasStrengths && isOwn && (
              <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                <div className="absolute top-2 right-2">
                  <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500 animate-pulse" />
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${config.color} shrink-0`} />
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 pl-4">
                    {item.description}
                  </p>
                )}
              </div>
              <Badge
                variant={config.variant}
                className="shrink-0 text-[10px] capitalize"
              >
                {item.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="flex items-center gap-2 pl-4 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[10px]">
                {item.type}
              </Badge>
              <span className="capitalize">{item.frequency}</span>
            </div>

            <div className="flex items-center gap-2 pl-4 pt-1">
              {isOwn ? (
                <>
                  {item.status !== "completed" && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleCheckin(item.id)}
                      className="gap-1.5 rounded-lg"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Check in
                    </Button>
                  )}
                  {item.status === "active" && (
                    <Button size="sm" variant="outline" className="gap-1.5 rounded-lg">
                      <Pause className="h-3.5 w-3.5" />
                      Pause
                    </Button>
                  )}
                  {item.status === "paused" && (
                    <Button size="sm" variant="outline" className="gap-1.5 rounded-lg">
                      <Play className="h-3.5 w-3.5" />
                      Resume
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendStrength(item.id, item.user_id)}
                  disabled={sendingStrength === item.id || justSent}
                  className={`gap-1.5 rounded-lg transition-all duration-300 ${
                    justSent
                      ? "text-white bg-pink-500 border-pink-500 hover:bg-pink-500 hover:text-white"
                      : "text-pink-500 border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-600"
                  }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 transition-all duration-300 ${
                      justSent ? "fill-white scale-110" : ""
                    }`}
                  />
                  {sendingStrength === item.id
                    ? "Sending..."
                    : justSent
                      ? "Sent!"
                      : "Send Strength"}
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
