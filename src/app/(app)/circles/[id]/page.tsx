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
      supabase.from("circles").select("*").eq("id", id).single(),
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
      />
    </>
  )
}
