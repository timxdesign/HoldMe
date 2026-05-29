import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { autoJoinPendingInvites } from "@/lib/invite-auto-join"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return NextResponse.redirect(`${origin}/auth/login?error=config`)
  }

  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("Auth callback error:", error.message)
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email) {
      await autoJoinPendingInvites(user.id, user.email)
    }
  } catch (e) {
    console.error("Auto-join error:", e)
  }

  return response
}
