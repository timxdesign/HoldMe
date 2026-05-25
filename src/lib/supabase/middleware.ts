import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const publicPaths = ["/", "/auth", "/invite", "/circle-invite"]

function isPublicPath(pathname: string) {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  if (!user && !isPublicPath(pathname)) {
    // Only redirect to login if there are no auth cookies at all.
    // If cookies exist but getUser() failed, this is likely a transient
    // network issue (common on mobile) — let the request through so the
    // user isn't kicked out by a flaky connection.
    const hasAuthCookies = request.cookies
      .getAll()
      .some((c) => c.name.includes("auth-token"))

    if (!hasAuthCookies) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  if (user && pathname.startsWith("/auth") && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
