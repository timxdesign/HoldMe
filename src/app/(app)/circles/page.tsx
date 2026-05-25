import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import Link from "next/link"
import { AddCircle, Record } from "@solar-icons/react"

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

  const { data: memberCounts } = circleIds.length > 0
    ? await supabase
        .from("circle_members")
        .select("circle_id")
        .in("circle_id", circleIds)
    : { data: [] }

  const { data: goalCounts } = circleIds.length > 0
    ? await supabase
        .from("circle_goals")
        .select("circle_id")
        .in("circle_id", circleIds)
        .eq("status", "active")
    : { data: [] }

  const countMap = (arr: { circle_id: string }[] | null) => {
    const map: Record<string, number> = {}
    for (const item of arr ?? []) {
      map[item.circle_id] = (map[item.circle_id] ?? 0) + 1
    }
    return map
  }

  const members = countMap(memberCounts)
  const goals = countMap(goalCounts)

  return (
    <>
      <TopBar title="Circles" showCreate={false} />
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Your Circles</h2>
            <p className="text-sm text-muted-foreground/60 mt-0.5">Group goals, shared accountability</p>
          </div>
          <Link
            href="/circles/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          >
            <AddCircle className="h-3.5 w-3.5" />
            New circle
          </Link>
        </div>

        {circles.length > 0 ? (
          <div className="grid gap-3">
            {circles.map((circle) => (
              <Link
                key={circle.id}
                href={`/circles/${circle.id}`}
                className="group flex items-center gap-4 rounded-2xl bg-card ring-1 ring-foreground/[0.06] p-4 transition-all duration-300 hover:ring-brand/20 hover:shadow-lg hover:shadow-brand/5 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-muted/60 text-lg shrink-0 transition-transform duration-300 group-hover:scale-110">
                  {circle.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[15px] truncate group-hover:text-brand transition-colors">
                    {circle.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground/60">
                      {members[circle.id] ?? 0} member{(members[circle.id] ?? 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      {goals[circle.id] ?? 0} goal{(goals[circle.id] ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                {circle.role === "owner" && (
                  <span className="text-[10px] font-medium text-brand/60 bg-brand/8 rounded-full px-2 py-0.5">
                    Owner
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-dashed border-foreground/[0.08]">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-muted/60 mb-4">
              <Record className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm mb-1">No circles yet</p>
            <p className="text-muted-foreground/50 text-xs mb-4">
              Create a circle and invite friends to tackle goals together.
            </p>
            <Link
              href="/circles/new"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              <AddCircle className="h-4 w-4" />
              Create your first circle
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
