import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /about, /api/contact)
  const path = request.nextUrl.pathname

  // Allow CORS for API routes
  if (path.startsWith("/api/")) {
    // For OPTIONS requests, return a response immediately with CORS headers
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      })
    }

    // For other requests, add CORS headers to the response
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return response
  }

  // Continue with the request
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
  ],
}
