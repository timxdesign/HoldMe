import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditSpaceForm } from "@/features/spaces/edit-space-form"

export const metadata = {
  title: "Edit Space",
}

interface EditSpacePageProps {
  params: Promise<{ id: string }>
}

export default async function EditSpacePage({ params }: EditSpacePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: space } = await supabase
    .from("spaces")
    .select("*")
    .eq("id", id)
    .single()

  if (!space) notFound()
  if (space.owner_id !== user.id) notFound()

  return (
    <EditSpaceForm
      spaceId={id}
      name={space.name}
      description={space.description}
      visibility={space.visibility}
    />
  )
}
