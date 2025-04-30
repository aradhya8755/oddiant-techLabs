import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { firstName, lastName, phone, designation } = body

    // Connect to database
    const { db } = await connectToDatabase()

    // Update employee profile
    await db.collection("employees").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          firstName,
          lastName,
          phone,
          designation,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true, message: "Profile updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
  }
}
