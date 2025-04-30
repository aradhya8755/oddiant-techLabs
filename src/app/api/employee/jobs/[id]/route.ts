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

    const jobId =await params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Find job by ID
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) })

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, job }, { status: 200 })
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch job" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const jobId = params.id
    const body = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Update job
    const result = await db.collection("jobs").updateOne(
      { _id: new ObjectId(jobId) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Job updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ success: false, message: "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const jobId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Delete job
    const result = await db.collection("jobs").deleteOne({ _id: new ObjectId(jobId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Job deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ success: false, message: "Failed to delete job" }, { status: 500 })
  }
}
