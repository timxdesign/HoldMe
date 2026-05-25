import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { ProfileView } from "@/features/profile/profile-view"

export const metadata = {
  title: "Profile",
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/dashboard")
  }

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [
    { data: profile },
    { count: spacesOwned },
    { count: spacesJoined },
    { count: totalGoals },
    { count: completedCheckins },
    { count: totalCheckins },
    { count: strengthsSent },
    { count: strengthsReceived },
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase
      .from("spaces")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id),
    supabase
      .from("space_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("accountability_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("item_checkins")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("item_checkins")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("strengths")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", user.id),
    supabase
      .from("strengths")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", user.id),
  ])

  const stats = {
    spacesOwned: spacesOwned ?? 0,
    spacesJoined: spacesJoined ?? 0,
    totalGoals: totalGoals ?? 0,
    completedCheckins: completedCheckins ?? 0,
    totalCheckins: totalCheckins ?? 0,
    strengthsSent: strengthsSent ?? 0,
    strengthsReceived: strengthsReceived ?? 0,
    memberSince: user.created_at,
  }

  return (
    <>
      <TopBar title="Profile" showCreate={false} />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <ProfileView
          profile={profile}
          userId={user.id}
          email={user.email ?? ""}
          stats={stats}
        />
      </div>
    </>
  )
}
