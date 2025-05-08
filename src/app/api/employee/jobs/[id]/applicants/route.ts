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

    // Find all applications for this specific job
    const applications = await db
      .collection("job_applications")
      .find({ jobId: new ObjectId(jobId) })
      .toArray()

    // If no applications found, return empty array
    if (applications.length === 0) {
      return NextResponse.json(
        { success: true, applicants: [] },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )
    }

    // Extract candidate IDs from applications
    const candidateIds = applications.map((app) => app.candidateId)

    // Find all candidates with these IDs
    const candidates = await db
      .collection("candidates")
      .find({ _id: { $in: candidateIds } })
      .toArray()

    // Create a map of candidate ID to candidate data for quick lookup
    const candidateMap = new Map()
    candidates.forEach((candidate) => {
      candidateMap.set(candidate._id.toString(), candidate)
    })

    // Create a map of application data by candidate ID
    const applicationMap = new Map()
    applications.forEach((app) => {
      applicationMap.set(app.candidateId.toString(), {
        status: app.status,
        appliedDate: app.appliedDate,
        lastComment: app.lastComment || null,
      })
    })

    // Combine candidate and application data
    const applicants = candidates.map((candidate) => {
      const candidateId = candidate._id.toString()
      const applicationData = applicationMap.get(candidateId) || {}

      return {
        ...candidate,
        // Override with job-specific application data
        status: applicationData.status || candidate.status,
        appliedDate: applicationData.appliedDate ? new Date(applicationData.appliedDate).toISOString() : null,
        lastComment: applicationData.lastComment || candidate.lastComment,
      }
    })

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
