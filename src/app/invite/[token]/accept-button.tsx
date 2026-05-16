"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AcceptInviteButtonProps {
  inviteId: string
  spaceId: string
  userId: string
}

export function AcceptInviteButton({
  inviteId,
  spaceId,
  userId,
}: AcceptInviteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleAccept() {
    setLoading(true)

    const { error: memberError } = await supabase
      .from("space_members")
      .insert({
        space_id: spaceId,
        user_id: userId,
        role: "partner",
      })

    if (memberError && !memberError.message.includes("duplicate")) {
      toast.error("Failed to join space")
      setLoading(false)
      return
    }

    await supabase
      .from("invites")
      .update({ status: "accepted" })
      .eq("id", inviteId)

    toast.success("Welcome! You've joined the space.")
    router.push(`/spaces/${spaceId}`)
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleAccept} className="w-full" disabled={loading}>
        {loading ? "Joining..." : "Accept Invite"}
      </Button>
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => router.push("/dashboard")}
      >
        Decline
      </Button>
    </div>
  )
}
