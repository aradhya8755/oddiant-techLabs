import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    // Also check for x-user-id header (used by middleware)
    const headerUserId = request.headers.get("x-user-id")

    // Use either the cookie-based userId or the header-based one
    const finalUserId = userId || headerUserId

    if (!finalUserId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check in students collection
    let user = await db.collection("students").findOne({ _id: new ObjectId(finalUserId) })
    let userType = "student"

    // If not found in students, check in employees
    if (!user) {
      user = await db.collection("employees").findOne({ _id: new ObjectId(finalUserId) })
      userType = "employee"

      // If not found in employees, check in admins
      if (!user) {
        user = await db.collection("admins").findOne({ _id: new ObjectId(finalUserId) })
        userType = "admin"

        // If not found anywhere, return unauthorized
        if (!user) {
          return NextResponse.json({ success: false, message: "User not found" }, { status: 401 })
        }
      }
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      userType,
    })
  } catch (error) {
    console.error("Error checking authentication:", error)
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 })
  }
}
