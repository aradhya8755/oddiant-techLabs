import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const interviewId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Find interview by ID
    const interview = await db.collection("interviews").findOne({ _id: new ObjectId(interviewId) })

    if (!interview) {
      return NextResponse.json({ message: "Interview not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, interview }, { status: 200 })
  } catch (error) {
    console.error("Error fetching interview:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch interview" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const interviewId = params.id
    const body = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Update interview
    const result = await db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Interview not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Interview updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating interview:", error)
    return NextResponse.json({ success: false, message: "Failed to update interview" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const interviewId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Delete interview
    const result = await db.collection("interviews").deleteOne({ _id: new ObjectId(interviewId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Interview not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Interview deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting interview:", error)
    return NextResponse.json({ success: false, message: "Failed to delete interview" }, { status: 500 })
  }
}
