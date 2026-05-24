import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AcceptInviteButton } from "./accept-button"
import { Users } from "lucide-react"

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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-muted/50 to-background">
      <Card className="max-w-sm w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto rounded-full bg-brand/10 p-3 mb-3 w-fit">
            <Users className="h-6 w-6 text-brand" />
          </div>
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
          {user ? (
            <AcceptInviteButton
              inviteId={invite.id}
              spaceId={invite.space_id}
              userId={user.id}
            />
          ) : (
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href={`/auth/signup?next=/invite/${token}`}>
                  Sign up to join
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href={`/auth/login?next=/invite/${token}`}>
                  Already have an account? Log in
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
