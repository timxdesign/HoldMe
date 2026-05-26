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
    .select("id, type, title, body, read, created_at, data")
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <>
      <TopBar title="Notifications" showCreate={false} showBack />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <NotificationList notifications={notifications ?? []} />
      </div>
    </>
  )
}
