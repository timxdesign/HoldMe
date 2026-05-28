import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SpaceHeader } from "@/features/spaces/space-header"
import { ItemList } from "@/features/items/item-list"
import { InviteButton } from "@/features/spaces/invite-button"
import { StrengthBanner } from "@/features/spaces/strength-banner"
import { FadeIn } from "@/components/ui/fade-in"
import { Button } from "@/components/ui/button"
import { AddCircle } from "@solar-icons/react"

interface SpacePageProps {
  params: Promise<{ id: string }>
}

export default async function SpacePage({ params }: SpacePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: space }, { data: items }, { data: members }, { data: strengths }, { data: checkins }] =
    await Promise.all([
      supabase.from("spaces").select("*").eq("id", id).single(),
      supabase
        .from("accountability_items")
        .select("*")
        .eq("space_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("space_members")
        .select("user_id, users(full_name)")
        .eq("space_id", id),
      supabase
        .from("strengths")
        .select("id, sender_id, message, created_at, accountability_items!inner(space_id, title)")
        .eq("accountability_items.space_id", id)
        .eq("receiver_id", user?.id ?? "")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("item_checkins")
        .select("item_id, checked_in_at")
        .eq("user_id", user?.id ?? "")
        .eq("status", "completed")
        .order("checked_in_at", { ascending: false }),
    ])

  if (!space) {
    notFound()
  }

  const itemIds = (items ?? []).map((i) => i.id)

  const [{ data: allComments }, { data: allStrengths }] = itemIds.length > 0
    ? await Promise.all([
        supabase
          .from("comments")
          .select("item_id, created_at")
          .in("item_id", itemIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("strengths")
          .select("item_id")
          .in("item_id", itemIds),
      ])
    : [{ data: [] }, { data: [] }]

  const commentCountMap: Record<string, number> = {}
  const latestCommentMap: Record<string, string> = {}
  for (const c of allComments ?? []) {
    commentCountMap[c.item_id] = (commentCountMap[c.item_id] ?? 0) + 1
    if (!latestCommentMap[c.item_id]) {
      latestCommentMap[c.item_id] = c.created_at
    }
  }

  const strengthCountMap: Record<string, number> = {}
  for (const s of allStrengths ?? []) {
    strengthCountMap[s.item_id] = (strengthCountMap[s.item_id] ?? 0) + 1
  }

  const isOwner = space.owner_id === user?.id
  const memberCount = members?.length ?? 0

  const memberNameMap = Object.fromEntries(
    (members ?? []).map((m) => [m.user_id, (m.users as { full_name: string | null } | null)?.full_name ?? "Someone"])
  )
  const ownerName = !isOwner ? memberNameMap[space.owner_id] ?? undefined : undefined
  const memberNameLookup = new Map(Object.entries(memberNameMap))

  const lastCheckinMap: Record<string, string> = {}
  for (const c of checkins ?? []) {
    if (!lastCheckinMap[c.item_id]) {
      lastCheckinMap[c.item_id] = c.checked_in_at
    }
  }

  const strengthsWithItems = (strengths ?? []).map((s) => ({
    id: s.id,
    senderName: memberNameLookup.get(s.sender_id) ?? "Someone",
    itemTitle: (s.accountability_items as { title: string; space_id: string })?.title ?? "",
    message: s.message,
    createdAt: s.created_at,
  }))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
      <SpaceHeader
        spaceId={id}
        name={space.name}
        description={space.description}
        memberCount={memberCount}
        isOwner={isOwner}
        ownerName={ownerName}
      />

      {isOwner && (
        <FadeIn delay={250} className="mt-5">
          <div className="flex items-center gap-2">
            <InviteButton spaceId={id} />
            <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" asChild>
              <Link href={`/create?space=${id}`}>
                <AddCircle className="h-3.5 w-3.5" />
                Add
              </Link>
            </Button>
          </div>
        </FadeIn>
      )}

      {strengthsWithItems.length > 0 && (
        <FadeIn delay={300} className="mt-6">
          <StrengthBanner strengths={strengthsWithItems} />
        </FadeIn>
      )}

      <FadeIn delay={350} className="mt-8">
        <ItemList
          items={items ?? []}
          currentUserId={user?.id ?? ""}
          spaceStrengths={strengths ?? []}
          spaceId={id}
          memberNames={memberNameMap as Record<string, string>}
          lastCheckins={lastCheckinMap}
          commentCounts={commentCountMap}
          strengthCounts={strengthCountMap}
          latestComments={latestCommentMap}
        />
      </FadeIn>
    </div>
  )
}
