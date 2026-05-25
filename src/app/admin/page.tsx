import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { UsersGroupTwoRounded, Widget, CheckCircle, Heart } from "@solar-icons/react"

export const metadata = {
  title: "Admin Dashboard",
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: spaceCount },
    { count: checkinCount },
    { count: strengthCount },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("spaces").select("*", { count: "exact", head: true }),
    supabase.from("item_checkins").select("*", { count: "exact", head: true }),
    supabase.from("strengths").select("*", { count: "exact", head: true }),
  ])

  const stats = [
    { label: "Total Users", value: userCount ?? 0, icon: UsersGroupTwoRounded },
    { label: "Active Spaces", value: spaceCount ?? 0, icon: Widget },
    { label: "Check-ins", value: checkinCount ?? 0, icon: CheckCircle },
    { label: "Strengths Sent", value: strengthCount ?? 0, icon: Heart },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <stat.icon className="h-4 w-4" />
                {stat.label}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
