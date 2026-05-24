import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { AcceptInviteButton } from "./accept-button"
import { InviteIllustration } from "./illustration"
import { Shield, LinkIcon } from "lucide-react"

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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="mx-auto rounded-2xl bg-muted p-4 w-fit">
            <LinkIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">Invite not found</h2>
          <p className="text-sm text-muted-foreground">
            This invite may have expired or already been used.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const spaceName = invite.spaces?.name ?? "a space"
  const spaceDescription = invite.spaces?.description

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-brand/5 via-background to-background">
      <div className="w-full max-w-md">
        <InviteIllustration />

        <div className="relative -mt-4 rounded-2xl bg-card ring-1 ring-foreground/10 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-brand via-brand-secondary to-brand" />

          <div className="px-6 pt-6 pb-2 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-brand mb-2">
              You&apos;re invited
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{spaceName}</h1>
            {spaceDescription && (
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                {spaceDescription}
              </p>
            )}
          </div>

          <div className="px-6 py-5">
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 mb-5">
              <div className="rounded-lg bg-brand/10 p-1.5 shrink-0">
                <Shield className="h-4 w-4 text-brand" />
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                Join this space to track goals, check in daily, and keep each
                other accountable.
              </p>
            </div>

            {user ? (
              <AcceptInviteButton
                inviteId={invite.id}
                spaceId={invite.space_id}
                userId={user.id}
              />
            ) : (
              <div className="space-y-3">
                <Button asChild className="w-full h-11 text-sm font-semibold gap-2">
                  <Link href={`/auth/signup?next=/invite/${token}`}>
                    Sign up & join space
                  </Link>
                </Button>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full h-11 text-sm">
                  <Link href={`/auth/login?next=/invite/${token}`}>
                    I already have an account
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <div className="px-6 pb-5">
            <p className="text-[11px] text-center text-muted-foreground/60">
              By joining, you agree to be held accountable.
            </p>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            What is HoldMe?
          </Link>
        </p>
      </div>
    </div>
  )
}
