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

    const jobId = await params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Find job to verify it exists
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) })

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    // Find all candidates who have applied to this job
    // In a real implementation, you would have a job_applications collection
    // For now, we'll simulate by returning candidates with a matching role
    const applicants = await db
      .collection("candidates")
      .find({
        $or: [{ jobId: new ObjectId(jobId) }, { jobId: jobId }, { role: { $regex: new RegExp(job.jobTitle, "i") } }],
      })
      .toArray()

    return NextResponse.json({ success: true, applicants }, { status: 200 })
  } catch (error) {
    console.error("Error fetching job applicants:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch applicants" }, { status: 500 })
  }
}
