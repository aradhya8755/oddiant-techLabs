import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /about, /api/contact)
  const path = request.nextUrl.pathname

  // Allow CORS for API routes
  if (path.startsWith("/api/")) {
    // Clone the request headers
    const requestHeaders = new Headers(request.headers)

    // Get response
    const response = NextResponse.next({
      request: {
        // Apply new request headers
        headers: requestHeaders,
      },
    })

    // Set CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.set("Content-Type", "application/json")

    // Return response
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
