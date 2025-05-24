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

    // Find student to verify
    const student = await db.collection("students").findOne({ _id: new ObjectId(userId) })

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    // Get all open jobs
    const jobs = await db.collection("jobs").find({ status: "open" }).sort({ createdAt: -1 }).toArray()

    // For each job, calculate days left and check if student has already applied
    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        // Calculate days left (30 days from creation by default)
        const creationDate = job.createdAt ? new Date(job.createdAt) : new Date()
        const expiryDate = new Date(creationDate)
        expiryDate.setDate(expiryDate.getDate() + 30)
        const today = new Date()
        const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

        // Check if student has already applied
        const application = await db.collection("job_applications").findOne({
          candidateId: new ObjectId(userId),
          jobId: new ObjectId(job._id.toString()),
        })

        return {
          ...job,
          daysLeft,
          hasApplied: !!application,
        }
      }),
    )

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, jobs: jobsWithDetails },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching available jobs:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch available jobs" }, { status: 500 })
  }
}
