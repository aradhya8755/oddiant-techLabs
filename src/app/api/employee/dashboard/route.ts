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

    // Find employee to verify
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    // Get company ID for data isolation
    const companyId = employee.companyId || employee._id.toString()

    // Get current date for filtering
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all jobs posted by this employee
    const jobs = await db
      .collection("jobs")
      .find({ employerId: new ObjectId(userId) })
      .toArray()

    // Get job IDs for this employee
    const jobIds = jobs.map((job) => job._id)

    // Count active candidates (from both collections)
    const candidatesCount = await db.collection("candidates").countDocuments({
      employerId: new ObjectId(userId),
    })

    // Count open positions
    const openPositionsCount = await db.collection("jobs").countDocuments({
      employerId: new ObjectId(userId),
      status: "open",
    })

    // Count today's interviews
    const interviewsToday = await db.collection("interviews").countDocuments({
      $or: [{ scheduledBy: new ObjectId(userId) }, { employeeId: new ObjectId(userId) }, { companyId: companyId }],
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { $in: ["scheduled", "confirmed"] },
    })

    // Calculate hiring success rate (placeholder logic)
    const totalHired = await db.collection("job_applications").countDocuments({
      employerId: new ObjectId(userId),
      status: "hired",
    })

    const totalApplications = await db.collection("job_applications").countDocuments({
      employerId: new ObjectId(userId),
    })

    const hiringSuccessRate = totalApplications > 0 ? Math.round((totalHired / totalApplications) * 100) : 78 // Default value if no applications

    // Compile dashboard data
    const dashboardData = {
      activeCandidates: candidatesCount,
      openPositions: openPositionsCount,
      interviewsToday: interviewsToday,
      hiringSuccessRate: hiringSuccessRate,
      recentJobs: jobs.slice(0, 5).map((job) => ({
        _id: job._id,
        jobTitle: job.jobTitle,
        department: job.department,
        jobType: job.jobType,
        jobLocation: job.jobLocation,
        applicants: job.applicants || 0,
        daysLeft: calculateDaysLeft(job.createdAt, job.duration || 30),
        interviews: job.interviews || 0,
        createdAt: job.createdAt,
      })),
    }

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, ...dashboardData },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

// Helper function to calculate days left
function calculateDaysLeft(createdAtStr: string | Date, durationDays: number): number {
  const createdDate = new Date(createdAtStr)
  const expiryDate = new Date(createdDate)
  expiryDate.setDate(createdDate.getDate() + durationDays)

  const today = new Date()
  return Math.max(0, Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
}
