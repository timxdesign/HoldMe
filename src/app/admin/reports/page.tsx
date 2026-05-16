import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Reports — Admin",
}

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from("reports")
    .select("*, users!reports_reporter_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      {reports && reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{report.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Reported by {report.users?.full_name ?? "Unknown"} &middot;{" "}
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      report.status === "pending"
                        ? "destructive"
                        : report.status === "reviewed"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {report.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <p className="text-muted-foreground">No reports yet.</p>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
