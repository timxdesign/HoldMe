import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { SpaceCard } from "@/features/spaces/space-card"
import { ActivityFeed } from "@/features/activity/activity-feed"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: spaces } = await supabase
    .from("spaces")
    .select("*, space_members(count)")
    .order("updated_at", { ascending: false })
    .limit(5)

  const { data: recentCheckins } = await supabase
    .from("item_checkins")
    .select("*, accountability_items(title, space_id)")
    .order("checked_in_at", { ascending: false })
    .limit(10)

  return (
    <>
      <TopBar />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Spaces</h2>
            <Link
              href="/spaces/new"
              className="flex items-center gap-1 text-sm text-brand font-medium hover:underline"
            >
              <Plus className="h-4 w-4" />
              New space
            </Link>
          </div>

          {spaces && spaces.length > 0 ? (
            <div className="grid gap-3">
              {spaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border border-dashed">
              <p className="text-muted-foreground mb-3">
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

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <ActivityFeed checkins={recentCheckins ?? []} />
        </section>
      </div>
    </>
  )
}
