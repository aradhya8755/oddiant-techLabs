import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const candidateId = params.id
    const { comment, jobId } = await request.json()

    if (!comment) {
      return NextResponse.json({ success: false, message: "Comment is required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee to get name
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    const employeeName = `${employee.firstName} ${employee.lastName}`

    // Create comment
    const commentData = {
      candidateId: new ObjectId(candidateId),
      jobId: jobId ? new ObjectId(jobId) : null,
      comment,
      createdBy: new ObjectId(userId),
      createdByName: employeeName,
      createdAt: new Date(),
    }

    await db.collection("candidate_comments").insertOne(commentData)

    // Update candidate with last comment
    await db.collection("candidates").updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $set: {
          lastComment: comment,
          lastCommentBy: employeeName,
          lastCommentAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true, message: "Comment added successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ success: false, message: "Failed to add comment" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const candidateId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Get comments for this candidate
    const comments = await db
      .collection("candidate_comments")
      .find({ candidateId: new ObjectId(candidateId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ success: true, comments }, { status: 200 })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch comments" }, { status: 500 })
  }
}
