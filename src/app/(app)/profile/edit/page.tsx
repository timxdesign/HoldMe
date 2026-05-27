import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditProfileForm } from "@/features/profile/edit-profile-form"

export const metadata = {
  title: "Edit Profile",
}

export default async function EditProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, avatar_url, bio, interests")
    .eq("id", user.id)
    .single()

  return (
    <EditProfileForm
      userId={user.id}
      profile={profile ?? { full_name: null, avatar_url: null, bio: null, interests: null }}
    />
  )
}
