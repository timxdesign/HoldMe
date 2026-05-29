import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { CircleGoalDetail } from "@/features/circles/circle-goal-detail"

interface CircleGoalPageProps {
  params: Promise<{ id: string; goalId: string }>
}

export default async function CircleGoalPage({ params }: CircleGoalPageProps) {
  const { id: circleId, goalId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const [
    { data: circle },
    { data: goal },
    { data: comments },
    { data: strengths },
    { data: members },
    { data: checkins },
  ] = await Promise.all([
    supabase.from("circles").select("*").eq("id", circleId).single(),
    supabase
      .from("circle_goals")
      .select("*")
      .eq("id", goalId)
      .eq("circle_id", circleId)
      .single(),
    supabase
      .from("circle_comments")
      .select("*, users(full_name, avatar_url)")
      .eq("goal_id", goalId)
      .order("created_at", { ascending: true }),
    supabase
      .from("circle_strengths")
      .select("id, sender_id, message, created_at, users!circle_strengths_sender_id_fkey(full_name)")
      .eq("goal_id", goalId),
    supabase
      .from("circle_members")
      .select("user_id, role, users(full_name, avatar_url)")
      .eq("circle_id", circleId),
    supabase
      .from("circle_checkins")
      .select("id, goal_id, user_id, note, checked_in_at")
      .eq("goal_id", goalId)
      .order("checked_in_at", { ascending: false }),
  ])

  if (!circle || !goal) notFound()

  const isOwner = circle.created_by === user.id
  const isGoalCreator = goal.created_by === user.id

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

  const formattedCheckins = (checkins ?? []).map((c) => ({
    id: c.id,
    userId: c.user_id,
    note: c.note,
    checkedInAt: c.checked_in_at,
  }))

  return (
    <>
      <TopBar title={goal.title} showCreate={false} showBack />
      <CircleGoalDetail
        circleId={circleId}
        circleEmoji={circle.emoji ?? "🎯"}
        circleName={circle.name}
        goalId={goalId}
        title={goal.title}
        description={goal.description}
        type={goal.type}
        frequency={goal.frequency}
        status={goal.status}
        goalCreatorId={goal.created_by}
        goalCreatorName={memberMap[goal.created_by]?.name ?? "Someone"}
        currentUserId={user.id}
        isCircleOwner={isOwner}
        isGoalCreator={isGoalCreator}
        comments={formattedComments}
        strengths={formattedStrengths}
        checkins={formattedCheckins}
        memberMap={memberMap}
      />
    </>
  )
}
