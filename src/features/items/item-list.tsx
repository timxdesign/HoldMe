"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Pause, Play, Heart } from "lucide-react"
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
}

const statusBadgeVariant = {
  active: "default",
  in_progress: "secondary",
  completed: "default",
  missed: "destructive",
  paused: "outline",
} as const

export function ItemList({ items, currentUserId }: ItemListProps) {
  const [localItems, setLocalItems] = useState(items)
  const supabase = createClient()

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
    const { error } = await supabase.from("strengths").insert({
      item_id: itemId,
      sender_id: currentUserId,
      receiver_id: receiverId,
    })

    if (error) {
      toast.error("Could not send strength")
      return
    }

    toast.success("Strength sent!")
  }

  if (localItems.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No accountability items yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {localItems.map((item) => {
        const isOwn = item.user_id === currentUserId
        return (
          <Card key={item.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <h4 className="font-medium">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    statusBadgeVariant[
                      item.status as keyof typeof statusBadgeVariant
                    ] ?? "secondary"
                  }
                  className="shrink-0 text-[10px]"
                >
                  {item.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">
                  {item.type}
                </Badge>
                <span>{item.frequency}</span>
              </div>

              <div className="flex items-center gap-2">
                {isOwn ? (
                  <>
                    {item.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleCheckin(item.id)}
                        className="gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Check in
                      </Button>
                    )}
                    {item.status === "active" && (
                      <Button size="sm" variant="outline" className="gap-1">
                        <Pause className="h-3.5 w-3.5" />
                        Pause
                      </Button>
                    )}
                    {item.status === "paused" && (
                      <Button size="sm" variant="outline" className="gap-1">
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
                    className="gap-1 text-strength border-strength/30 hover:bg-strength/10"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    Send Strength
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
