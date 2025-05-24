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
    const test = url.searchParams.get("test")
    const status = url.searchParams.get("status")
    const score = url.searchParams.get("score")
    const date = url.searchParams.get("date")
    const limit = url.searchParams.get("limit") ? Number.parseInt(url.searchParams.get("limit") as string) : undefined
    const sort = url.searchParams.get("sort") || "completionDate"

    // Build query
    const query: any = { createdBy: new ObjectId(userId) }

    if (test) {
      query.testId = new ObjectId(test)
    }

    if (status) {
      query.status = status
    }

    if (score) {
      // Parse score filter
      if (score === "> 90%") {
        query.score = { $gt: 90 }
      } else if (score === "80-90%") {
        query.score = { $gte: 80, $lte: 90 }
      } else if (score === "70-80%") {
        query.score = { $gte: 70, $lt: 80 }
      } else if (score === "< 70%") {
        query.score = { $lt: 70 }
      }
    }

    if (date) {
      // Parse date filter
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (date === "Today") {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        query.completionDate = { $gte: today, $lt: tomorrow }
      } else if (date === "This week") {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 7)
        query.completionDate = { $gte: startOfWeek, $lt: endOfWeek }
      } else if (date === "This month") {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        query.completionDate = { $gte: startOfMonth, $lte: endOfMonth }
      } else if (date === "Older") {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        query.completionDate = { $lt: startOfMonth }
      }
    }

    // Get results from database
    let resultsQuery = db.collection("assessment_results").find(query)

    // Apply sorting
    resultsQuery = resultsQuery.sort({ [sort]: -1 })

    // Apply limit if specified
    if (limit) {
      resultsQuery = resultsQuery.limit(limit)
    }

    const results = await resultsQuery.toArray()

    // Calculate stats
    let averageScore = 0
    let passRate = 0

    if (results.length > 0) {
      // Calculate average score
      const totalScore = results.reduce((sum, result) => sum + result.score, 0)
      averageScore = Math.round(totalScore / results.length)

      // Calculate pass rate
      const passedCount = results.filter((result) => result.status === "Passed").length
      passRate = Math.round((passedCount / results.length) * 100)
    }

    // Get completion rate (completed tests / assigned tests)
    const completedTests = await db.collection("assessment_invitations").countDocuments({
      createdBy: new ObjectId(userId),
      status: "Completed",
    })

    const totalInvitations = await db.collection("assessment_invitations").countDocuments({
      createdBy: new ObjectId(userId),
    })

    const completionRate = totalInvitations > 0 ? Math.round((completedTests / totalInvitations) * 100) : 0

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      {
        success: true,
        results,
        stats: {
          averageScore,
          passRate,
          completionRate,
        },
      },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch results" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get result data from request body
    const resultData = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Get the invitation to determine the creator
    const invitation = await db.collection("assessment_invitations").findOne({
      _id: new ObjectId(resultData.invitationId),
    })

    if (!invitation) {
      return NextResponse.json({ success: false, message: "Invitation not found" }, { status: 404 })
    }

    // Create new result
    const newResult = {
      ...resultData,
      createdBy: invitation.createdBy,
      createdAt: new Date(),
      completionDate: new Date(),
      resultsDeclared: false, // Default to false - results not declared yet
    }

    // Insert result into database
    const result = await db.collection("assessment_results").insertOne(newResult)

    // Update invitation status
    await db.collection("assessment_invitations").updateOne(
      { _id: new ObjectId(resultData.invitationId) },
      {
        $set: {
          status: "Completed",
          completedAt: new Date(),
        },
      },
    )

    // Update candidate record if it exists
    const candidateEmail = resultData.candidateEmail
    if (candidateEmail) {
      const candidate = await db.collection("assessment_candidates").findOne({
        email: candidateEmail,
        createdBy: invitation.createdBy,
      })

      if (candidate) {
        // Update existing candidate
        await db.collection("assessment_candidates").updateOne(
          { _id: candidate._id },
          {
            $inc: { testsCompleted: 1 },
            $set: {
              status: "Completed", // Just mark as completed, not pass/fail until declared
              lastCompletedAt: new Date(),
              updatedAt: new Date(),
            },
          },
        )
      } else {
        // Create new candidate record
        await db.collection("assessment_candidates").insertOne({
          name: resultData.candidateName || candidateEmail.split("@")[0],
          email: candidateEmail,
          testsAssigned: 1,
          testsCompleted: 1,
          averageScore: resultData.score,
          status: "Completed", // Just mark as completed, not pass/fail until declared
          createdBy: invitation.createdBy,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }

    // Do NOT send result email here - it will be sent when results are declared

    return NextResponse.json({ success: true, resultId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating result:", error)
    return NextResponse.json({ success: false, message: "Failed to create result" }, { status: 500 })
  }
}
