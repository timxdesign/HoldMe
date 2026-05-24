import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { autoJoinPendingInvites } from "@/lib/invite-auto-join"

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ joined: 0 })
  }

  const result = await autoJoinPendingInvites(user.id, user.email)

  return NextResponse.json(result)
}
