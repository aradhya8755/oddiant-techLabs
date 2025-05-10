import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { cookies } from "next/headers"

export async function DELETE(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find student by ID to verify
    const student = await db.collection("students").findOne({ _id: new ObjectId(userId) })

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    // Delete student's applications
    await db.collection("job_applications").deleteMany({ candidateId: new ObjectId(userId) })

    // Delete student account
    const result = await db.collection("students").deleteOne({ _id: new ObjectId(userId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Failed to delete account" }, { status: 500 })
    }

    // Clear auth cookie
    cookies().delete("auth_token")

    return NextResponse.json({ success: true, message: "Account deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ success: false, message: "Failed to delete account" }, { status: 500 })
  }
}
