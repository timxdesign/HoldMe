import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { FadeIn } from "@/components/ui/fade-in"
import Link from "next/link"
import { AddCircle, Record } from "@solar-icons/react"
import { Button } from "@/components/ui/button"
import { CircleCard } from "@/features/circles/circle-card"

export const metadata = {
  title: "Circles",
}

export default async function CirclesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: memberships } = await supabase
    .from("circle_members")
    .select("circle_id, role, circles(id, name, emoji, created_by), circle_id")
    .eq("user_id", user?.id ?? "")
    .order("joined_at", { ascending: false })

  const circles = (memberships ?? []).map((m) => ({
    ...(m.circles as { id: string; name: string; emoji: string; created_by: string }),
    role: m.role,
  }))

  const circleIds = circles.map((c) => c.id)

  const [{ data: memberCounts }, { data: goalCounts }, { data: recentComments }] = circleIds.length > 0
    ? await Promise.all([
        supabase.from("circle_members").select("circle_id").in("circle_id", circleIds),
        supabase.from("circle_goals").select("circle_id").in("circle_id", circleIds).eq("status", "active"),
        supabase
          .from("circle_comments")
          .select("created_at, circle_goals!inner(circle_id)")
          .order("created_at", { ascending: false })
          .limit(200),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  const countMap = (arr: { circle_id: string }[] | null) => {
    const map: Record<string, number> = {}
    for (const item of arr ?? []) {
      map[item.circle_id] = (map[item.circle_id] ?? 0) + 1
    }
    return map
  }

  const members = countMap(memberCounts)
  const goals = countMap(goalCounts)

  const latestCommentByCircle = new Map<string, string>()
  recentComments?.forEach((c) => {
    const circleId = (c.circle_goals as { circle_id: string } | null)?.circle_id
    if (circleId && !latestCommentByCircle.has(circleId)) {
      latestCommentByCircle.set(circleId, c.created_at)
    }
  })

  return (
    <>
      <TopBar title="Circles" showCreate={false} />
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
        <FadeIn>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Circles
            </h1>
            <Button asChild size="sm" className="gap-1.5 rounded-lg">
              <Link href="/circles/new">
                <AddCircle className="h-3.5 w-3.5" />
                New Circle
              </Link>
            </Button>
          </div>
        </FadeIn>

        {circles.length > 0 ? (
          <div className="mt-8 grid gap-3">
            {circles.map((circle, index) => (
              <FadeIn key={circle.id} delay={index * 60}>
                <CircleCard
                  circle={circle}
                  memberCount={members[circle.id] ?? 0}
                  goalCount={goals[circle.id] ?? 0}
                  latestComment={latestCommentByCircle.get(circle.id)}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn delay={150} className="mt-12">
            <div className="text-center py-16">
              <div className="rounded-2xl bg-muted/40 p-5 inline-block mb-4">
                <Record className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No circles yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Create a circle and invite friends to tackle goals together.
              </p>
              <Button asChild className="gap-2">
                <Link href="/circles/new">
                  <AddCircle className="h-4 w-4" />
                  Create Your First Circle
                </Link>
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </>
  )
}
