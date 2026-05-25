import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Record } from "@solar-icons/react"
import { AcceptCircleInvite } from "./accept-button"

interface CircleInvitePageProps {
  params: Promise<{ token: string }>
}

export default async function CircleInvitePage({ params }: CircleInvitePageProps) {
  const { token } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: invite } = await supabase
    .from("circle_invites")
    .select("*, circles(id, name, emoji)")
    .eq("token", token)
    .eq("status", "pending")
    .single()

  if (!invite || !invite.circles) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">This invite link is invalid or has expired.</p>
          <Button asChild>
            <Link href="/circles">Go to Circles</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect(`/auth/login?redirect=/circle-invite/${token}`)
  }

  const circle = invite.circles as { id: string; name: string; emoji: string }

  const { data: existing } = await supabase
    .from("circle_members")
    .select("id")
    .eq("circle_id", circle.id)
    .eq("user_id", user.id)
    .single()

  if (existing) {
    redirect(`/circles/${circle.id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/60 text-3xl mx-auto">
          {circle.emoji}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{circle.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;ve been invited to join this circle
          </p>
        </div>
        <AcceptCircleInvite
          circleId={circle.id}
          inviteId={invite.id}
          userId={user.id}
        />
      </div>
    </div>
  )
}
