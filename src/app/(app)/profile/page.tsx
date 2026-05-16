import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { ProfileForm } from "@/features/profile/profile-form"

export const metadata = {
  title: "Profile",
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <>
      <TopBar title="Profile" showCreate={false} />
      <div className="max-w-lg mx-auto px-4 py-6">
        <ProfileForm profile={profile} userId={user.id} />
      </div>
    </>
  )
}
