"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, Sparkles, ArrowRight } from "lucide-react"

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
  const [joined, setJoined] = useState(false)
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

    setJoined(true)
    toast.success("Welcome! You've joined the space.")

    setTimeout(() => {
      router.push(`/spaces/${spaceId}`)
    }, 1500)
  }

  if (joined) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-3">
            <Check className="h-5 w-5 text-white" />
          </div>
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
            You&apos;re in!
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            Taking you to your space <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleAccept}
        className="w-full h-12 text-sm font-semibold gap-2 relative overflow-hidden group"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Joining...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110" />
            Join this space
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        className="w-full h-10 text-xs text-muted-foreground"
        onClick={() => router.push("/dashboard")}
        disabled={loading}
      >
        No thanks
      </Button>
    </div>
  )
}
