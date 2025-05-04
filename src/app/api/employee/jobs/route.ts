import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee to get company ID
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    // Get job postings for this company
    const jobs = await db.collection("jobs").find({}).toArray()

    // For each job, calculate real-time stats
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        // Count applicants
        const applicantsCount = await db.collection("job_applications").countDocuments({ jobId: job._id })

        // Count interviews
        const interviewsCount = await db.collection("interviews").countDocuments({ jobId: job._id })

        // Calculate days left (30 days from creation by default)
        const creationDate = job.createdAt ? new Date(job.createdAt) : new Date()
        const expiryDate = new Date(creationDate)
        expiryDate.setDate(expiryDate.getDate() + 30)
        const today = new Date()
        const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

        return {
          ...job,
          applicants: applicantsCount,
          interviews: interviewsCount,
          daysLeft: daysLeft,
        }
      }),
    )

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, jobs: jobsWithStats },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee to get company ID
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    // Get job data from request body
    const jobData = await request.json()

    // Add additional fields - explicitly set status to "open"
    const newJob = {
      ...jobData,
      employeeId: new ObjectId(userId),
      companyId: employee.companyId,
      status: "open", // Explicitly set status to "open"
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert job into database
    const result = await db.collection("jobs").insertOne(newJob)

    return NextResponse.json({ success: true, jobId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ success: false, message: "Failed to create job" }, { status: 500 })
  }
}
