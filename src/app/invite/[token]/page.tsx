import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AcceptInviteButton } from "./accept-button"

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params
  const supabase = await createClient()

  const { data: invite } = await supabase
    .from("invites")
    .select("*, spaces(name, description)")
    .eq("token", token)
    .eq("status", "pending")
    .single()

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-sm w-full">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              This invite is no longer valid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=/invite/${token}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-sm w-full">
        <CardHeader className="text-center pb-2">
          <p className="text-sm text-muted-foreground">
            You&apos;ve been invited to join
          </p>
          <h2 className="text-xl font-bold">
            {invite.spaces?.name ?? "a space"}
          </h2>
          {invite.spaces?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {invite.spaces.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <AcceptInviteButton
            inviteId={invite.id}
            spaceId={invite.space_id}
            userId={user.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
