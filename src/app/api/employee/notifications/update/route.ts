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
    const { emailNotifications, applicationUpdates, interviewReminders } = body

    // Connect to database
    const { db } = await connectToDatabase()

    // Update notification settings
    await db.collection("employees").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          notificationSettings: {
            emailNotifications,
            applicationUpdates,
            interviewReminders,
          },
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json(
      {
        success: true,
        message: "Notification settings updated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notification settings",
      },
      { status: 500 },
    )
  }
}
