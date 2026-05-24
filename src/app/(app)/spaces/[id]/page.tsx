import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SpaceHeader } from "@/features/spaces/space-header"
import { ItemList } from "@/features/items/item-list"
import { AddItemForm } from "@/features/items/add-item-form"
import { StrengthBanner } from "@/features/spaces/strength-banner"

interface SpacePageProps {
  params: Promise<{ id: string }>
}

export default async function SpacePage({ params }: SpacePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: space }, { data: items }, { data: members }, { data: strengths }] =
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
    ])

  if (!space) {
    notFound()
  }

  const isOwner = space.owner_id === user?.id
  const memberCount = members?.length ?? 0
  const itemCount = items?.length ?? 0

  const memberNameMap = new Map(
    (members ?? []).map((m) => [m.user_id, (m.users as { full_name: string | null } | null)?.full_name ?? "Someone"])
  )

  const strengthsWithItems = (strengths ?? []).map((s) => ({
    id: s.id,
    senderName: memberNameMap.get(s.sender_id) ?? "Someone",
    itemTitle: (s.accountability_items as { title: string; space_id: string })?.title ?? "",
    message: s.message,
    createdAt: s.created_at,
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <SpaceHeader
        spaceId={id}
        name={space.name}
        description={space.description}
        memberCount={memberCount}
        itemCount={itemCount}
        isOwner={isOwner}
      />

      {strengthsWithItems.length > 0 && (
        <StrengthBanner strengths={strengthsWithItems} />
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Goals</h2>
          {isOwner && <AddItemForm spaceId={id} />}
        </div>
        <ItemList
          items={items ?? []}
          currentUserId={user?.id ?? ""}
          spaceStrengths={strengths ?? []}
          spaceId={id}
        />
      </section>
    </div>
  )
}
