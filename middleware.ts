import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define protected routes
  const employeeProtectedRoutes = ["/employee"]
  const adminProtectedRoutes = ["/admin"]
  const authRoutes = ["/auth/employee/login", "/auth/login", "/auth/employee/register", "/auth/register"]

  // Check if the current path is a protected route
  const isEmployeeProtectedRoute = employeeProtectedRoutes.some((route) => path.startsWith(route))
  const isAdminProtectedRoute = adminProtectedRoutes.some((route) => path.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => path === route)

  // Get the token from cookies
  const token = request.cookies.get("auth_token")?.value

  // If no token and trying to access protected route, redirect to login
  if (!token && (isEmployeeProtectedRoute || isAdminProtectedRoute)) {
    const loginUrl = isAdminProtectedRoute
      ? new URL("/auth/employee/login", request.url)
      : new URL("/auth/employee/login", request.url)

    return NextResponse.redirect(loginUrl)
  }

  // If token exists, verify it
  if (token) {
    const decoded = verifyToken(token)

    // If token is invalid, redirect to login
    if (!decoded) {
      const loginUrl = new URL("/auth/employee/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Check role-based access
    if (isAdminProtectedRoute && decoded.role !== "admin") {
      // If not admin, redirect to employee dashboard
      return NextResponse.redirect(new URL("/employee/dashboard", request.url))
    }

    // If authenticated and trying to access auth routes, redirect to dashboard
    if (isAuthRoute) {
      if (decoded.role === "admin") {
        return NextResponse.redirect(new URL("/admin/employees", request.url))
      } else {
        return NextResponse.redirect(new URL("/employee/dashboard", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/employee/:path*",
    "/admin/:path*",
    "/auth/employee/login",
    "/auth/login",
    "/auth/employee/register",
    "/auth/register",
  ],
}
