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

  const { data: authUsers } = await serviceClient.auth.admin.listUsers()
  const userExists = authUsers?.users?.some((u) => u.email === email)

  if (!userExists) {
    await serviceClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/invite/${invite.token}`,
      data: {
        invited_to_space: space.name,
      },
    })
  }

  return NextResponse.json({
    inviteLink,
    emailSent: true,
    isNewUser: !userExists,
  })
}
