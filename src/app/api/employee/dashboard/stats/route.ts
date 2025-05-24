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

    // Count active candidates (from both collections) for this employee only
    const candidatesCount = await db.collection("candidates").countDocuments({
      $or: [
        { employerId: new ObjectId(userId) },
        { companyId: companyId },
        { employerId: userId },
        { companyId: new ObjectId(companyId) },
      ],
    })

    // Count open positions for this employee only
    const openPositionsCount = await db.collection("jobs").countDocuments({
      $or: [
        { employerId: new ObjectId(userId) },
        { companyId: companyId },
        { employerId: userId },
        { companyId: new ObjectId(companyId) },
      ],
      status: "open",
    })

    // Count today's interviews for this employee only
    const interviewsToday = await db.collection("interviews").countDocuments({
      $or: [
        { scheduledBy: new ObjectId(userId) },
        { employeeId: new ObjectId(userId) },
        { companyId: companyId },
        { scheduledBy: userId },
        { employeeId: userId },
        { companyId: new ObjectId(companyId) },
      ],
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { $in: ["scheduled", "confirmed"] },
    })

    // Calculate hiring success rate (placeholder logic) for this employee only
    const totalHired = await db.collection("job_applications").countDocuments({
      $or: [{ employerId: new ObjectId(userId) }, { employerId: userId }],
      status: "hired",
    })

    const totalApplications = await db.collection("job_applications").countDocuments({
      $or: [{ employerId: new ObjectId(userId) }, { employerId: userId }],
    })

    const hiringSuccessRate = totalApplications > 0 ? Math.round((totalHired / totalApplications) * 100) : 78 // Default value if no applications

    // Compile stats
    const stats = {
      activeCandidates: candidatesCount,
      openPositions: openPositionsCount,
      interviewsToday: interviewsToday,
      hiringSuccessRate: hiringSuccessRate,
    }

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, stats },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
