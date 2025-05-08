import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

// Get comments for a specific job application
export async function GET(request: NextRequest, { params }: { params: { id: string; candidateId: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const jobId = params.id
    const candidateId = params.candidateId

    // Connect to database
    const { db } = await connectToDatabase()

    // Find the specific job application
    const application = await db.collection("job_applications").findOne({
      jobId: new ObjectId(jobId),
      candidateId: new ObjectId(candidateId),
    })

    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }

    // Return the comments for this specific job application
    return NextResponse.json({
      success: true,
      comments: application.comments || [],
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch comments" }, { status: 500 })
  }
}

// Add a new comment to a specific job application
export async function POST(request: NextRequest, { params }: { params: { id: string; candidateId: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const jobId = params.id
    const candidateId = params.candidateId
    const { comment } = await request.json()

    if (!comment) {
      return NextResponse.json({ message: "Comment is required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Create a new comment object
    const newComment = {
      text: comment,
      createdAt: new Date(),
      createdBy: userId,
    }

    // Update the job application with the new comment
    const result = await db.collection("job_applications").updateOne(
      { jobId: new ObjectId(jobId), candidateId: new ObjectId(candidateId) },
      {
        $push: { comments: newComment },
        $set: { lastComment: comment, updatedAt: new Date() },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "Failed to add comment" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ success: false, message: "Failed to add comment" }, { status: 500 })
  }
}
