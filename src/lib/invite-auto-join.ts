import { createClient as createServiceClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

export async function autoJoinPendingInvites(userId: string, email: string) {
  const supabase = createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: pendingInvites } = await supabase
    .from("invites")
    .select("id, space_id")
    .eq("email", email)
    .eq("status", "pending")

  if (!pendingInvites || pendingInvites.length === 0) {
    return { joined: 0, spaceIds: [] }
  }

  const spaceIds: string[] = []

  for (const invite of pendingInvites) {
    const { error: memberError } = await supabase
      .from("space_members")
      .insert({
        space_id: invite.space_id,
        user_id: userId,
        role: "partner",
      })

    if (!memberError || memberError.message.includes("duplicate")) {
      await supabase
        .from("invites")
        .update({ status: "accepted" })
        .eq("id", invite.id)

      spaceIds.push(invite.space_id)
    }
  }

  return { joined: spaceIds.length, spaceIds }
}
