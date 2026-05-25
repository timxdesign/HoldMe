"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Restart } from "@solar-icons/react"
import { toast } from "sonner"

interface AcceptCircleInviteProps {
  circleId: string
  inviteId: string
  userId: string
}

export function AcceptCircleInvite({ circleId, inviteId, userId }: AcceptCircleInviteProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleAccept() {
    setLoading(true)

    const { error: memberError } = await supabase
      .from("circle_members")
      .insert({ circle_id: circleId, user_id: userId, role: "member" })

    if (memberError) {
      toast.error(memberError.message)
      setLoading(false)
      return
    }

    await supabase
      .from("circle_invites")
      .update({ status: "accepted" })
      .eq("id", inviteId)

    toast.success("You joined the circle!")
    router.push(`/circles/${circleId}`)
  }

  return (
    <Button onClick={handleAccept} disabled={loading} className="w-full h-10 gap-2">
      {loading ? (
        <>
          <Restart className="h-4 w-4 animate-spin" />
          Joining...
        </>
      ) : (
        "Join Circle"
      )}
    </Button>
  )
}
