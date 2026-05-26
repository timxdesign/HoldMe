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

  const { spaceId, email } = await request.json()

  if (!spaceId || !email) {
    return NextResponse.json(
      { error: "Space ID and email are required" },
      { status: 400 }
    )
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: space } = await serviceClient
    .from("spaces")
    .select("name")
    .eq("id", spaceId)
    .single()

  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 })
  }

  const { data: existingUserRecord } = await serviceClient
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (existingUserRecord) {
    const { data: existingMember } = await serviceClient
      .from("space_members")
      .select("id")
      .eq("space_id", spaceId)
      .eq("user_id", existingUserRecord.id)
      .maybeSingle()

    if (existingMember) {
      return NextResponse.json(
        { error: "This person is already a member of this space" },
        { status: 409 }
      )
    }
  }

  const { data: invite, error: inviteError } = await serviceClient
    .from("invites")
    .insert({
      space_id: spaceId,
      inviter_id: user.id,
      email,
    })
    .select()
    .single()

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  const origin = request.headers.get("origin") ?? ""
  const inviteLink = `${origin}/invite/${invite.token}`

  const userExists = !!existingUserRecord

  if (userExists && existingUserRecord) {
    const inviterName = user.user_metadata?.full_name ?? user.email ?? "Someone"
    await serviceClient.from("notifications").insert({
      user_id: existingUserRecord.id,
      type: "invite",
      title: `${inviterName} invited you to ${space.name}`,
      body: `You've been invited to join the space "${space.name}".`,
      data: {
        invite_id: invite.id,
        space_id: spaceId,
        space_name: space.name,
        inviter_name: inviterName,
        token: invite.token,
      },
    })
  }

  let emailSent = false

  if (!userExists) {
    try {
      const emailPromise = serviceClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/invite/${invite.token}`,
        data: {
          invited_to_space: space.name,
        },
      })

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000)
      )

      const result = await Promise.race([emailPromise, timeout]) as { error?: unknown }
      emailSent = !result?.error
    } catch {
      emailSent = false
    }
  }

  return NextResponse.json({
    inviteLink,
    emailSent,
    isNewUser: !userExists,
  })
}
