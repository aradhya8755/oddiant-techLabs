import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const candidateId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // If candidateId is a MongoDB ObjectId, try to find by _id
    let candidate = null

    if (ObjectId.isValid(candidateId)) {
      try {
        candidate = await db.collection("assessment_candidates").findOne({
          _id: new ObjectId(candidateId),
          createdBy: new ObjectId(userId),
        })
      } catch (error) {
        console.error("Error finding candidate by ObjectId:", error)
      }
    }

    // If not found by _id, try to find by email or other identifier
    if (!candidate) {
      // For candidate IDs like "candidate-0", extract the index
      const candidatePattern = /candidate-(\d+)/
      const match = candidateId.match(candidatePattern)

      if (match) {
        const candidateIndex = Number.parseInt(match[1])

        // Get all invitations
        const invitations = await db
          .collection("assessment_invitations")
          .find({
            createdBy: new ObjectId(userId),
          })
          .toArray()

        // Get unique emails
        const uniqueEmails = [...new Set(invitations.map((inv) => inv.email))]
        uniqueEmails.sort() // Sort to ensure consistent ordering

        // Get the email at the specified index
        const email = uniqueEmails[candidateIndex]

        if (email) {
          // Build candidate data from invitations
          const candidateInvitations = invitations.filter((inv) => inv.email === email)

          // Get results for this candidate
          const results = await db
            .collection("assessment_results")
            .find({
              candidateEmail: email,
              createdBy: new ObjectId(userId),
            })
            .sort({ completionDate: -1 })
            .toArray()

          // Get verification data if available
          const verifications = await db
            .collection("assessment_verifications")
            .find({
              candidateEmail: email,
            })
            .toArray()

          // Build candidate object
          candidate = {
            _id: `candidate-${candidateIndex}`,
            name: email.split("@")[0],
            email: email,
            testsAssigned: candidateInvitations.length,
            testsCompleted: candidateInvitations.filter((inv) => inv.status === "Completed").length,
            results: results,
            invitations: candidateInvitations,
            verifications: verifications,
            createdAt: candidateInvitations[0]?.createdAt || new Date(),
          }

          // Calculate average score
          if (results.length > 0) {
            const totalScore = results.reduce((sum, result) => sum + result.score, 0)
            candidate.averageScore = Math.round(totalScore / results.length)
          } else {
            candidate.averageScore = 0
          }

          // Determine status
          if (results.length > 0) {
            const latestResult = results[0] // Already sorted by completionDate

            if (latestResult.resultsDeclared) {
              candidate.status = latestResult.status // Passed or Failed
            } else {
              candidate.status = "Completed" // Completed but not declared
            }
          } else if (candidateInvitations.some((inv) => inv.status === "Pending")) {
            candidate.status = "Invited"
          } else {
            candidate.status = "Unknown"
          }
        }
      } else {
        // Try to find by email
        const invitations = await db
          .collection("assessment_invitations")
          .find({
            email: candidateId,
            createdBy: new ObjectId(userId),
          })
          .toArray()

        if (invitations.length > 0) {
          // Get results for this candidate
          const results = await db
            .collection("assessment_results")
            .find({
              candidateEmail: candidateId,
              createdBy: new ObjectId(userId),
            })
            .sort({ completionDate: -1 })
            .toArray()

          // Build candidate object
          candidate = {
            _id: candidateId,
            name: candidateId.split("@")[0],
            email: candidateId,
            testsAssigned: invitations.length,
            testsCompleted: invitations.filter((inv) => inv.status === "Completed").length,
            results: results,
            invitations: invitations,
            createdAt: invitations[0]?.createdAt || new Date(),
          }

          // Calculate average score
          if (results.length > 0) {
            const totalScore = results.reduce((sum, result) => sum + result.score, 0)
            candidate.averageScore = Math.round(totalScore / results.length)
          } else {
            candidate.averageScore = 0
          }

          // Determine status
          if (results.length > 0) {
            const latestResult = results[0] // Already sorted by completionDate

            if (latestResult.resultsDeclared) {
              candidate.status = latestResult.status // Passed or Failed
            } else {
              candidate.status = "Completed" // Completed but not declared
            }
          } else if (invitations.some((inv) => inv.status === "Pending")) {
            candidate.status = "Invited"
          } else {
            candidate.status = "Unknown"
          }
        }
      }
    }

    if (!candidate) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, candidate },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching candidate:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch candidate" }, { status: 500 })
  }
}
