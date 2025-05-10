import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find student settings
    const student = await db
      .collection("students")
      .findOne({ _id: new ObjectId(userId) }, { projection: { settings: 1 } })

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    // Return settings or default settings if not set
    const settings = student.settings || {
      profileVisibility: true,
      notifications: {
        email: true,
        jobRecommendations: true,
        applicationUpdates: true,
      },
      preferredJobTypes: [],
      preferredLocations: [],
      shiftPreference: "flexible",
    }

    return NextResponse.json({ success: true, settings }, { status: 200 })
  } catch (error) {
    console.error("Error fetching student settings:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { settings } = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Update student settings
    const result = await db
      .collection("students")
      .updateOne({ _id: new ObjectId(userId) }, { $set: { settings, updatedAt: new Date() } })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: "Failed to update settings" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Settings updated successfully", settings }, { status: 200 })
  } catch (error) {
    console.error("Error updating student settings:", error)
    return NextResponse.json({ success: false, message: "Failed to update settings" }, { status: 500 })
  }
}
