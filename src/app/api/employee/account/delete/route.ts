import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest, clearAuthCookie } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Delete employee account
    const result = await db.collection("employees").deleteOne({ _id: new ObjectId(userId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Account not found" }, { status: 404 })
    }

    // Clear auth cookie
    await clearAuthCookie()

    return NextResponse.json({ success: true, message: "Account deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ success: false, message: "Failed to delete account" }, { status: 500 })
  }
}
