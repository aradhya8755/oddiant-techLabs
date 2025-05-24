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

    // Get query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const score = url.searchParams.get("score")
    const testId = url.searchParams.get("testId")

    // Build query
    const query: any = { createdBy: new ObjectId(userId) }

    if (status) {
      query.status = status
    }

    if (score) {
      // Parse score filter
      if (score === "> 90%") {
        query.averageScore = { $gt: 90 }
      } else if (score === "80-90%") {
        query.averageScore = { $gte: 80, $lte: 90 }
      } else if (score === "70-80%") {
        query.averageScore = { $gte: 70, $lt: 80 }
      } else if (score === "< 70%") {
        query.averageScore = { $lt: 70 }
      }
    }

    if (testId) {
      query.testId = new ObjectId(testId)
    }

    // Get candidates from database
    let candidates = []

    // First, get all invitations to find candidates
    const invitations = await db
      .collection("assessment_invitations")
      .find({
        createdBy: new ObjectId(userId),
      })
      .toArray()

    // Create a map of email to candidate data
    const candidateMap = new Map()

    // Process invitations to build candidate data
    for (const invitation of invitations) {
      const email = invitation.email

      if (!candidateMap.has(email)) {
        // Initialize candidate data
        candidateMap.set(email, {
          email,
          name: email.split("@")[0], // Simple name extraction
          testsAssigned: 0,
          testsCompleted: 0,
          totalScore: 0,
          averageScore: 0,
          status: "Invited",
        })
      }

      const candidateData = candidateMap.get(email)
      candidateData.testsAssigned++

      if (invitation.status === "Completed") {
        candidateData.testsCompleted++

        // Get the result for this invitation
        const result = await db.collection("assessment_results").findOne({
          invitationId: invitation._id,
        })

        if (result) {
          candidateData.totalScore += result.score
          candidateData.averageScore = Math.round(candidateData.totalScore / candidateData.testsCompleted)

          // Update status based on most recent completion
          if (result.status === "Passed") {
            candidateData.status = "Completed"
          } else {
            candidateData.status = "Failed"
          }
        }
      } else if (
        invitation.status === "Pending" &&
        candidateData.status !== "Completed" &&
        candidateData.status !== "Failed"
      ) {
        candidateData.status = "Invited"
      }
    }

    // Convert map to array and add IDs
    candidates = Array.from(candidateMap.values()).map((candidate, index) => ({
      ...candidate,
      _id: `candidate-${index}`,
    }))

    // Apply filters from query
    if (status) {
      candidates = candidates.filter((candidate) => candidate.status === status)
    }

    if (score) {
      candidates = candidates.filter((candidate) => {
        const avgScore = candidate.averageScore
        if (score === "> 90%" && avgScore > 90) return true
        if (score === "80-90%" && avgScore >= 80 && avgScore <= 90) return true
        if (score === "70-80%" && avgScore >= 70 && avgScore < 80) return true
        if (score === "< 70%" && avgScore < 70) return true
        return false
      })
    }

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, candidates },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch candidates" }, { status: 500 })
  }
}
