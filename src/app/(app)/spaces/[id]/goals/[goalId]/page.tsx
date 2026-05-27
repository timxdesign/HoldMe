import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GoalDetail } from "@/features/items/goal-detail"

interface GoalPageProps {
  params: Promise<{ id: string; goalId: string }>
}

export default async function GoalPage({ params }: GoalPageProps) {
  const { id: spaceId, goalId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const [
    { data: space },
    { data: item },
    { data: comments },
    { data: strengths },
    { data: members },
  ] = await Promise.all([
    supabase.from("spaces").select("*").eq("id", spaceId).single(),
    supabase
      .from("accountability_items")
      .select("*")
      .eq("id", goalId)
      .eq("space_id", spaceId)
      .single(),
    supabase
      .from("comments")
      .select("*, users(full_name, avatar_url)")
      .eq("item_id", goalId)
      .order("created_at", { ascending: true }),
    supabase
      .from("strengths")
      .select("id, sender_id, receiver_id, message, created_at, users!strengths_sender_id_fkey(full_name)")
      .eq("item_id", goalId),
    supabase
      .from("space_members")
      .select("user_id, role, users(full_name, avatar_url)")
      .eq("space_id", spaceId),
  ])

  if (!space || !item) notFound()

  const isOwner = space.owner_id === user.id
  const isGoalOwner = item.user_id === user.id

  const memberMap: Record<string, { name: string; avatarUrl: string | null }> = {}
  for (const m of members ?? []) {
    const u = m.users as { full_name: string | null; avatar_url: string | null } | null
    memberMap[m.user_id] = {
      name: u?.full_name ?? "Someone",
      avatarUrl: u?.avatar_url ?? null,
    }
  }

  const formattedComments = (comments ?? []).map((c) => {
    const u = c.users as { full_name: string | null; avatar_url: string | null } | null
    return {
      id: c.id,
      userId: c.user_id,
      content: c.content,
      parentId: c.parent_id,
      createdAt: c.created_at,
      userName: u?.full_name ?? "Someone",
      avatarUrl: u?.avatar_url ?? null,
    }
  })

  const formattedStrengths = (strengths ?? []).map((s) => {
    const u = s.users as { full_name: string | null } | null
    return {
      id: s.id,
      senderId: s.sender_id,
      senderName: u?.full_name ?? "Someone",
      message: s.message,
      createdAt: s.created_at,
    }
  })

  return (
    <GoalDetail
      spaceId={spaceId}
      goalId={goalId}
      title={item.title}
      description={item.description}
      status={item.status}
      frequency={item.frequency}
      goalOwnerId={item.user_id}
      goalOwnerName={memberMap[item.user_id]?.name ?? "Someone"}
      currentUserId={user.id}
      isSpaceOwner={isOwner}
      isGoalOwner={isGoalOwner}
      comments={formattedComments}
      strengths={formattedStrengths}
      memberMap={memberMap}
    />
  )
}
