import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { autoJoinPendingInvites } from "@/lib/invite-auto-join"
import type { Database } from "@/types/database"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [...new Headers(request.headers).entries()]
              .filter(([key]) => key === "cookie")
              .flatMap(([, val]) =>
                val.split(";").map((c) => {
                  const [name, ...rest] = c.trim().split("=")
                  return { name, value: rest.join("=") }
                })
              )
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email) {
        await autoJoinPendingInvites(user.id, user.email)
      }

      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
