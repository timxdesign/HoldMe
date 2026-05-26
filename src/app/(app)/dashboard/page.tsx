import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { DashboardView } from "@/features/dashboard/dashboard-view"

export const metadata = {
  title: "Dashboard",
}

function computeStreak(
  checkins: { status: string; checked_in_at: string }[]
): number {
  if (checkins.length === 0) return 0

  const completed = checkins
    .filter((c) => c.status === "completed")
    .map((c) => {
      const d = new Date(c.checked_in_at)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    })

  const uniqueDays = [...new Set(completed)]

  let streak = 0
  const today = new Date()

  for (let i = 0; i <= uniqueDays.length; i++) {
    const check = new Date(today)
    check.setDate(check.getDate() - i)
    const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`
    if (uniqueDays.includes(key)) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [
    { data: profile },
    { data: spaces },
    { data: recentCheckins },
    { data: weeklyCheckins },
    { data: activeItems },
    { data: strengths },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("full_name, avatar_url")
      .eq("id", authUser?.id ?? "")
      .single(),
    supabase
      .from("spaces")
      .select("*, owner:users!owner_id(full_name), space_members(count), accountability_items(count)")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("item_checkins")
      .select("*, accountability_items(title, space_id)")
      .order("checked_in_at", { ascending: false })
      .limit(10),
    supabase
      .from("item_checkins")
      .select("status, checked_in_at")
      .gte("checked_in_at", weekAgo.toISOString())
      .order("checked_in_at", { ascending: false }),
    supabase
      .from("accountability_items")
      .select("id")
      .eq("status", "active"),
    supabase
      .from("strengths")
      .select("id")
      .eq("receiver_id", authUser?.id ?? "")
      .gte("created_at", weekAgo.toISOString()),
  ])

  const firstName = profile?.full_name?.split(" ")[0] ?? ""
  const completedCount =
    weeklyCheckins?.filter((c) => c.status === "completed").length ?? 0
  const totalCheckins = weeklyCheckins?.length ?? 0
  const streak = computeStreak(weeklyCheckins ?? [])
  const completionRate =
    totalCheckins > 0 ? Math.round((completedCount / totalCheckins) * 100) : 0
  const activeGoals = activeItems?.length ?? 0
  const strengthsReceived = strengths?.length ?? 0

  return (
    <>
      <TopBar title="Dashboard" showCreate={false} />
      <div className="max-w-lg mx-auto px-4 py-8 pb-24">
        <DashboardView
          firstName={firstName}
          streak={streak}
          completionRate={completionRate}
          activeGoals={activeGoals}
          strengthsReceived={strengthsReceived}
          spaces={spaces ?? []}
          recentCheckins={recentCheckins ?? []}
          userId={authUser?.id ?? ""}
        />
      </div>
    </>
  )
}
