import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditGoalForm } from "@/features/items/edit-goal-form"

export const metadata = {
  title: "Edit Goal",
}

interface EditGoalPageProps {
  params: Promise<{ id: string; goalId: string }>
}

export default async function EditGoalPage({ params }: EditGoalPageProps) {
  const { id: spaceId, goalId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const [{ data: space }, { data: item }] = await Promise.all([
    supabase.from("spaces").select("owner_id").eq("id", spaceId).single(),
    supabase
      .from("accountability_items")
      .select("*, users(full_name)")
      .eq("id", goalId)
      .eq("space_id", spaceId)
      .single(),
  ])

  if (!space || !item) notFound()

  const isGoalOwner = item.user_id === user.id
  const isSpaceOwner = space.owner_id === user.id
  if (!isGoalOwner && !isSpaceOwner) notFound()

  const ownerName = (item.users as { full_name: string | null } | null)?.full_name ?? "Someone"

  return (
    <EditGoalForm
      spaceId={spaceId}
      goalId={goalId}
      title={item.title}
      description={item.description}
      status={item.status}
      frequency={item.frequency}
      type={item.type}
      dueDate={item.due_date}
      goalOwnerName={ownerName}
    />
  )
}
