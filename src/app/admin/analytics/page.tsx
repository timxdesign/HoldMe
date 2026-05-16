import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const metadata = {
  title: "Analytics — Admin",
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    { count: weeklyCheckins },
    { count: weeklyStrengths },
    { count: weeklySignups },
  ] = await Promise.all([
    supabase
      .from("item_checkins")
      .select("*", { count: "exact", head: true })
      .gte("checked_in_at", weekAgo.toISOString()),
    supabase
      .from("strengths")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString()),
  ])

  const metrics = [
    { label: "Check-ins this week", value: weeklyCheckins ?? 0 },
    { label: "Strengths sent this week", value: weeklyStrengths ?? 0 },
    { label: "New signups this week", value: weeklySignups ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <span className="text-sm text-muted-foreground">
                {metric.label}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {metric.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Engagement Overview</h2>
          <p className="text-sm text-muted-foreground">
            Weekly engagement metrics for the platform.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Detailed charts and analytics will be added in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
