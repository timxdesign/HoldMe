import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { SpaceCard } from "@/features/spaces/space-card"
import { SpaceTabs } from "@/features/spaces/space-tabs"
import { FadeIn } from "@/components/ui/fade-in"
import Link from "next/link"
import { AddCircle, Widget, UsersGroupTwoRounded, Target } from "@solar-icons/react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Spaces",
}

export default async function SpacesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: spaces }, { data: strengths }] = await Promise.all([
    supabase
      .from("spaces")
      .select("*, owner:users!owner_id(full_name), space_members(count), accountability_items(count)")
      .order("updated_at", { ascending: false }),
    supabase
      .from("strengths")
      .select("id, item_id, created_at, accountability_items(space_id)")
      .eq("receiver_id", user?.id ?? "")
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ),
  ])

  const strengthsBySpace = new Map<string, number>()
  strengths?.forEach((s) => {
    const spaceId = (s.accountability_items as { space_id: string } | null)
      ?.space_id
    if (spaceId) {
      strengthsBySpace.set(spaceId, (strengthsBySpace.get(spaceId) ?? 0) + 1)
    }
  })

  const mySpaces = (spaces ?? []).filter((s) => s.owner_id === user?.id)
  const joinedSpaces = (spaces ?? []).filter((s) => s.owner_id !== user?.id)

  const totalMembers =
    spaces?.reduce(
      (sum, s) => sum + (s.space_members?.[0]?.count ?? 0),
      0
    ) ?? 0
  const totalGoals =
    spaces?.reduce(
      (sum, s) => sum + (s.accountability_items?.[0]?.count ?? 0),
      0
    ) ?? 0

  return (
    <>
      <TopBar title="Spaces" showCreate={false} />
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <FadeIn>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manage Spaces</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your accountability groups and the ones you&apos;ve joined.
              </p>
            </div>
            <Button asChild className="gap-2 shrink-0">
              <Link href="/spaces/new">
                <AddCircle className="h-4 w-4" />
                <span className="hidden sm:inline">New Space</span>
              </Link>
            </Button>
          </div>
        </FadeIn>

        {spaces && spaces.length > 0 && (
          <FadeIn delay={100}>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-3 md:p-4 flex flex-col items-center text-center gap-2">
                <div className="rounded-lg bg-brand/10 p-2">
                  <Widget className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{spaces.length}</p>
                  <p className="text-[11px] text-muted-foreground">Spaces</p>
                </div>
              </div>
              <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-3 md:p-4 flex flex-col items-center text-center gap-2">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <UsersGroupTwoRounded className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{totalMembers}</p>
                  <p className="text-[11px] text-muted-foreground">Members</p>
                </div>
              </div>
              <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-3 md:p-4 flex flex-col items-center text-center gap-2">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <Target className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{totalGoals}</p>
                  <p className="text-[11px] text-muted-foreground">Goals</p>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {spaces && spaces.length > 0 ? (
          <FadeIn delay={250}>
            <SpaceTabs
              myCount={mySpaces.length}
              joinedCount={joinedSpaces.length}
              myContent={
                mySpaces.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {mySpaces.map((space) => (
                      <SpaceCard
                        key={space.id}
                        space={space}
                        strengthCount={strengthsBySpace.get(space.id) ?? 0}
                        isOwner
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 rounded-2xl border border-dashed">
                    <p className="text-sm text-muted-foreground mb-3">
                      You haven&apos;t created any spaces yet.
                    </p>
                    <Button asChild size="sm" className="gap-2">
                      <Link href="/spaces/new">
                        <AddCircle className="h-3.5 w-3.5" />
                        Create a Space
                      </Link>
                    </Button>
                  </div>
                )
              }
              joinedContent={
                joinedSpaces.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {joinedSpaces.map((space) => {
                      const owner = space.owner as { full_name: string | null } | null
                      return (
                        <SpaceCard
                          key={space.id}
                          space={space}
                          strengthCount={strengthsBySpace.get(space.id) ?? 0}
                          ownerName={owner?.full_name ?? undefined}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 rounded-2xl border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      You haven&apos;t joined any spaces yet. Accept an invite to get started.
                    </p>
                  </div>
                )
              }
            />
          </FadeIn>
        ) : (
          <FadeIn delay={200}>
            <div className="text-center py-20 rounded-2xl border border-dashed">
              <div className="rounded-full bg-muted p-4 inline-block mb-4">
                <Widget className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No spaces yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Create your first accountability space and invite partners to
                track goals together.
              </p>
              <Button asChild className="gap-2">
                <Link href="/spaces/new">
                  <AddCircle className="h-4 w-4" />
                  Create Your First Space
                </Link>
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </>
  )
}
