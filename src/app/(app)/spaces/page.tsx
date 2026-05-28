import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { SpaceCard } from "@/features/spaces/space-card"
import { SpaceTabs } from "@/features/spaces/space-tabs"
import { FadeIn } from "@/components/ui/fade-in"
import Link from "next/link"
import { AddCircle } from "@solar-icons/react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Spaces",
}

export default async function SpacesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: spaces }, { data: strengths }, { data: recentComments }] = await Promise.all([
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
    supabase
      .from("comments")
      .select("created_at, accountability_items!inner(space_id)")
      .order("created_at", { ascending: false })
      .limit(200),
  ])

  const strengthsBySpace = new Map<string, number>()
  strengths?.forEach((s) => {
    const spaceId = (s.accountability_items as { space_id: string } | null)
      ?.space_id
    if (spaceId) {
      strengthsBySpace.set(spaceId, (strengthsBySpace.get(spaceId) ?? 0) + 1)
    }
  })

  const latestCommentBySpace = new Map<string, string>()
  recentComments?.forEach((c) => {
    const spaceId = (c.accountability_items as { space_id: string } | null)?.space_id
    if (spaceId && !latestCommentBySpace.has(spaceId)) {
      latestCommentBySpace.set(spaceId, c.created_at)
    }
  })

  const allSpaces = spaces ?? []
  const mySpaces = allSpaces.filter((s) => s.owner_id === user?.id)
  const joinedSpaces = allSpaces.filter((s) => s.owner_id !== user?.id)
  const showTabs = mySpaces.length > 0 && joinedSpaces.length > 0

  function renderSpaceList(list: typeof allSpaces, asOwner: boolean) {
    return (
      <div className="grid gap-3">
        {list.map((space, index) => {
          const owner = space.owner as { full_name: string | null } | null
          return (
            <FadeIn key={space.id} delay={index * 60}>
              <SpaceCard
                space={space}
                strengthCount={strengthsBySpace.get(space.id) ?? 0}
                isOwner={asOwner}
                ownerName={!asOwner ? (owner?.full_name ?? undefined) : undefined}
                latestComment={latestCommentBySpace.get(space.id)}
              />
            </FadeIn>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <TopBar title="Spaces" showCreate={false} />
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
        <FadeIn>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Spaces
            </h1>
            <Button asChild size="sm" className="gap-1.5 rounded-lg">
              <Link href="/spaces/new">
                <AddCircle className="h-3.5 w-3.5" />
                New Space
              </Link>
            </Button>
          </div>
        </FadeIn>

        {allSpaces.length > 0 ? (
          showTabs ? (
            <FadeIn delay={150} className="mt-8">
              <SpaceTabs
                myCount={mySpaces.length}
                joinedCount={joinedSpaces.length}
                myContent={renderSpaceList(mySpaces, true)}
                joinedContent={
                  renderSpaceList(joinedSpaces, false)
                }
              />
            </FadeIn>
          ) : (
            <div className="mt-8">
              {renderSpaceList(
                mySpaces.length > 0 ? mySpaces : joinedSpaces,
                mySpaces.length > 0
              )}
            </div>
          )
        ) : (
          <FadeIn delay={150} className="mt-12">
            <div className="text-center py-16">
              <div className="rounded-2xl bg-muted/40 p-5 inline-block mb-4">
                <AddCircle className="h-6 w-6 text-muted-foreground" />
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
