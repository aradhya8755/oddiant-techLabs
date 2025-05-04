import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Find job by ID - IMPORTANT: Removed the status filter to fix the sharing issue
    const job = await db.collection("jobs").findOne({
      _id: new ObjectId(jobId),
    })

    if (!job) {
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 })
    }

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, job },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Validate the job ID format
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ success: false, message: "Invalid job ID format" }, { status: 400 })
    }

    // Delete job from database (actual deletion instead of status update)
    const result = await db.collection("jobs").deleteOne({ _id: new ObjectId(jobId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Job deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ success: false, message: "Failed to delete job" }, { status: 500 })
  }
}
