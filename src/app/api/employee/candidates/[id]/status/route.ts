import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const candidateId = params.id
    const { status, jobId } = await request.json()

    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Update candidate status
    const result = await db.collection("candidates").updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    // If jobId is provided, update the job application status as well
    if (jobId) {
      await db.collection("job_applications").updateOne(
        {
          jobId: new ObjectId(jobId),
          candidateId: new ObjectId(candidateId),
        },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true },
      )
    }

    return NextResponse.json({ success: true, message: "Candidate status updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating candidate status:", error)
    return NextResponse.json({ success: false, message: "Failed to update candidate status" }, { status: 500 })
  }
}
