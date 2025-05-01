import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = await params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Find job by ID
    const job = await db.collection("jobs").findOne({
      _id: new ObjectId(jobId),
      status: "active", // Only return active jobs
    })

    if (!job) {
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, job }, { status: 200 })
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch job" }, { status: 500 })
  }
}
