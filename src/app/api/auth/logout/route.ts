import { type NextRequest, NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Clear auth cookie
    clearAuthCookie()

    return NextResponse.json({ success: true, message: "Logout successful" }, { status: 200 })
  } catch (error) {
    console.error("Error in logout:", error)
    return NextResponse.json({ success: false, message: "Logout failed. Please try again." }, { status: 500 })
  }
}
