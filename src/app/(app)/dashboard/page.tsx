import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { SpaceCard } from "@/features/spaces/space-card"
import { ActivityFeed } from "@/features/activity/activity-feed"
import { PerformanceSummary } from "@/features/dashboard/performance-summary"
import { StatCards } from "@/features/dashboard/stat-cards"
import Link from "next/link"
import { Plus, ArrowRight } from "lucide-react"

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
      .select("*, space_members(count), accountability_items(count)")
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
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-8">
        <PerformanceSummary
          firstName={firstName}
          completedCount={completedCount}
          totalCheckins={totalCheckins}
          streak={streak}
          strengthsReceived={strengthsReceived}
          activeGoals={activeGoals}
        />

        <StatCards
          streak={streak}
          completionRate={completionRate}
          activeGoals={activeGoals}
          strengthsReceived={strengthsReceived}
        />

        <div className="grid md:grid-cols-5 gap-6 md:gap-8">
          <section className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Your Spaces</h2>
              <Link
                href="/spaces/new"
                className="flex items-center gap-1 text-sm text-brand font-medium hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                New space
              </Link>
            </div>

            {spaces && spaces.length > 0 ? (
              <div className="grid gap-3">
                {spaces.map((space) => (
                  <SpaceCard key={space.id} space={space} />
                ))}
                {spaces.length >= 5 && (
                  <Link
                    href="/spaces"
                    className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground py-3 rounded-xl border border-dashed transition-colors hover:border-brand/30"
                  >
                    View all spaces
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl border border-dashed">
                <p className="text-muted-foreground mb-3 text-sm">
                  No spaces yet. Create your first accountability space!
                </p>
                <Link
                  href="/spaces/new"
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Create space
                </Link>
              </div>
            )}
          </section>

          <section className="md:col-span-2 space-y-4">
            <h2 className="text-base font-semibold">Recent Activity</h2>
            <ActivityFeed checkins={recentCheckins ?? []} />
          </section>
        </div>
      </div>
    </>
  )
}
