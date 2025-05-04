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
    // First, get all applications for this job
    const applications = await db
      .collection("job_applications")
      .find({ jobId: new ObjectId(jobId) })
      .toArray()

    // Extract candidate IDs from applications
    const candidateIds = applications.map((app) => app.candidateId)

    // Find all candidates with these IDs
    let applicants = []
    if (candidateIds.length > 0) {
      applicants = await db
        .collection("candidates")
        .find({ _id: { $in: candidateIds } })
        .toArray()
    }

    // If no direct applications found, fall back to the previous approach
    if (applicants.length === 0) {
      applicants = await db
        .collection("candidates")
        .find({
          $or: [{ jobId: new ObjectId(jobId) }, { jobId: jobId }, { role: { $regex: new RegExp(job.jobTitle, "i") } }],
        })
        .toArray()
    }

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, applicants },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching job applicants:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch applicants" }, { status: 500 })
  }
}
