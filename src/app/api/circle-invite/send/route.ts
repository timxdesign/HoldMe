import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { circleId, emails } = await request.json()

  if (!circleId || !emails || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json(
      { error: "Circle ID and at least one email are required" },
      { status: 400 }
    )
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: circle } = await serviceClient
    .from("circles")
    .select("name")
    .eq("id", circleId)
    .single()

  if (!circle) {
    return NextResponse.json({ error: "Circle not found" }, { status: 404 })
  }

  const { data: membership } = await serviceClient
    .from("circle_members")
    .select("id")
    .eq("circle_id", circleId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const origin = request.headers.get("origin") ?? ""
  const inviterName = user.user_metadata?.full_name ?? user.email ?? "Someone"
  const results: { email: string; success: boolean; error?: string }[] = []

  for (const email of emails) {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) continue

    const { data: existingUser } = await serviceClient
      .from("users")
      .select("id")
      .eq("email", trimmed)
      .maybeSingle()

    if (existingUser) {
      const { data: existingMember } = await serviceClient
        .from("circle_members")
        .select("id")
        .eq("circle_id", circleId)
        .eq("user_id", existingUser.id)
        .maybeSingle()

      if (existingMember) {
        results.push({ email: trimmed, success: false, error: "Already a member" })
        continue
      }
    }

    const { data: invite, error: inviteError } = await serviceClient
      .from("circle_invites")
      .insert({ circle_id: circleId, inviter_id: user.id })
      .select()
      .single()

    if (inviteError) {
      results.push({ email: trimmed, success: false, error: inviteError.message })
      continue
    }

    if (existingUser) {
      await serviceClient.from("notifications").insert({
        user_id: existingUser.id,
        type: "invite",
        title: `${inviterName} invited you to ${circle.name}`,
        body: `You've been invited to join the circle "${circle.name}".`,
        data: {
          invite_id: invite.id,
          circle_id: circleId,
          circle_name: circle.name,
          inviter_name: inviterName,
          token: invite.token,
        },
      })
    } else {
      try {
        const emailPromise = serviceClient.auth.admin.inviteUserByEmail(trimmed, {
          redirectTo: `${origin}/auth/callback?next=/circle-invite/${invite.token}`,
          data: { invited_to_circle: circle.name },
        })
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 8000)
        )
        await Promise.race([emailPromise, timeout])
      } catch {
        // Invite link still works even if email fails
      }
    }

    results.push({
      email: trimmed,
      success: true,
    })
  }

  const successCount = results.filter((r) => r.success).length
  return NextResponse.json({ results, successCount })
}
