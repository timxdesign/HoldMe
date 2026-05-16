import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { NotificationList } from "@/features/notifications/notification-list"

export const metadata = {
  title: "Notifications",
}

export default async function NotificationsPage() {
  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <>
      <TopBar title="Notifications" showCreate={false} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <NotificationList notifications={notifications ?? []} />
      </div>
    </>
  )
}
