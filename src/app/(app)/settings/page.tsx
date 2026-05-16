import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TopBar } from "@/components/layout/top-bar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { NotificationSettings } from "@/features/notifications/notification-settings"

export const metadata = {
  title: "Settings",
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <>
      <TopBar title="Settings" showCreate={false} />
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <h2 className="font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Manage how you receive notifications.
            </p>
          </CardHeader>
          <CardContent>
            <NotificationSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="font-semibold">Account</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email</span>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Member since</span>
              <span className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
