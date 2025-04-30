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

    const candidateId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Find candidate by ID
    const candidate = await db.collection("candidates").findOne({ _id: new ObjectId(candidateId) })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, candidate }, { status: 200 })
  } catch (error) {
    console.error("Error fetching candidate:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch candidate" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const candidateId = params.id
    const body = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Update candidate
    const result = await db.collection("candidates").updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Candidate updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating candidate:", error)
    return NextResponse.json({ success: false, message: "Failed to update candidate" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const candidateId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Delete candidate
    const result = await db.collection("candidates").deleteOne({ _id: new ObjectId(candidateId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Candidate deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting candidate:", error)
    return NextResponse.json({ success: false, message: "Failed to delete candidate" }, { status: 500 })
  }
}
 