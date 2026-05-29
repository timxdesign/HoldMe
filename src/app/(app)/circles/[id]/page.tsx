import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { CircleView } from "@/features/circles/circle-view"

interface CirclePageProps {
  params: Promise<{ id: string }>
}

export default async function CirclePage({ params }: CirclePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: circle }, { data: goals }, { data: members }, { data: recentCheckins }] =
    await Promise.all([
      supabase.from("circles").select("id, name, emoji, image_url, created_by").eq("id", id).single(),
      supabase
        .from("circle_goals")
        .select("*")
        .eq("circle_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("circle_members")
        .select("user_id, role, users(full_name)")
        .eq("circle_id", id),
      supabase
        .from("circle_checkins")
        .select("id, goal_id, user_id, note, checked_in_at")
        .in(
          "goal_id",
          (await supabase.from("circle_goals").select("id").eq("circle_id", id)).data?.map((g) => g.id) ?? []
        )
        .order("checked_in_at", { ascending: false })
        .limit(30),
    ])

  if (!circle) {
    notFound()
  }

  const goalIds = (goals ?? []).map((g) => g.id)

  const [{ data: allComments }, { data: allStrengths }] = goalIds.length > 0
    ? await Promise.all([
        supabase
          .from("circle_comments")
          .select("goal_id, created_at")
          .in("goal_id", goalIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("circle_strengths")
          .select("goal_id")
          .in("goal_id", goalIds),
      ])
    : [{ data: [] }, { data: [] }]

  const commentCountMap: Record<string, number> = {}
  const latestCommentMap: Record<string, string> = {}
  for (const c of allComments ?? []) {
    commentCountMap[c.goal_id] = (commentCountMap[c.goal_id] ?? 0) + 1
    if (!latestCommentMap[c.goal_id]) {
      latestCommentMap[c.goal_id] = c.created_at
    }
  }

  const strengthCountMap: Record<string, number> = {}
  for (const s of allStrengths ?? []) {
    strengthCountMap[s.goal_id] = (strengthCountMap[s.goal_id] ?? 0) + 1
  }

  const isOwner = circle.created_by === user?.id
  const memberMap: Record<string, string> = {}
  for (const m of members ?? []) {
    memberMap[m.user_id] = (m.users as { full_name: string | null } | null)?.full_name ?? "Someone"
  }

  return (
    <>
      <TopBar title={circle.name} showCreate={false} showBack />
      <CircleView
        circle={circle}
        goals={goals ?? []}
        members={members ?? []}
        memberNames={memberMap}
        recentCheckins={recentCheckins ?? []}
        currentUserId={user?.id ?? ""}
        isOwner={isOwner}
        commentCounts={commentCountMap}
        strengthCounts={strengthCountMap}
        latestComments={latestCommentMap}
      />
    </>
  )
}
