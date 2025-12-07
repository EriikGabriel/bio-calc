import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Cookie-based auth protection
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("authToken")?.value

  const isPublic =
    pathname.startsWith("/login") || pathname.startsWith("/public")
  const isProtected = pathname === "/" || pathname.startsWith("/protected")

  if (isProtected && !token && !isPublic) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (isPublic && token && pathname.startsWith("/login")) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/protected/:path*", "/login"],
}
