import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { CircleInfo } from "@/features/circles/circle-info"

interface CircleInfoPageProps {
  params: Promise<{ id: string }>
}

export default async function CircleInfoPage({ params }: CircleInfoPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: circle }, { data: members }] = await Promise.all([
    supabase.from("circles").select("id, name, emoji, description, image_url, created_by").eq("id", id).single(),
    supabase
      .from("circle_members")
      .select("user_id, role, users(full_name, avatar_url, email)")
      .eq("circle_id", id),
  ])

  if (!circle) {
    notFound()
  }

  const isOwner = circle.created_by === user?.id

  return (
    <>
      <TopBar title="Circle Info" showCreate={false} showBack />
      <CircleInfo
        circle={circle}
        members={members ?? []}
        currentUserId={user?.id ?? ""}
        isOwner={isOwner}
      />
    </>
  )
}
