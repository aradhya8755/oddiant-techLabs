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

    // Get total tests count
    const totalTests = await db.collection("assessment_tests").countDocuments({
      createdBy: new ObjectId(userId),
    })

    // Get active tests count
    const activeTests = await db.collection("assessment_tests").countDocuments({
      createdBy: new ObjectId(userId),
      status: "Active",
    })

    // Get total candidates count (unique emails)
    const invitations = await db
      .collection("assessment_invitations")
      .find({ createdBy: new ObjectId(userId) })
      .toArray()

    // Count unique emails
    const uniqueEmails = new Set(invitations.map((inv) => inv.email))
    const totalCandidates = uniqueEmails.size

    // Get completion rate
    const completedInvitations = invitations.filter((inv) => inv.status === "Completed")
    const completionRate =
      invitations.length > 0 ? Math.round((completedInvitations.length / invitations.length) * 100) : 0

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalTests,
          activeTests,
          totalCandidates,
          completionRate,
        },
      },
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
