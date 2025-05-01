import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

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

    // Find candidate by ID
    const candidate = await db.collection("candidates").findOne({ _id: new ObjectId(candidateId) })

    if (!candidate) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    // Format the response to ensure all fields are included
    const formattedCandidate = {
      ...candidate,
      _id: candidate._id.toString(),
      // Ensure these fields are always present in the response
      name: candidate.name || "",
      email: candidate.email || "",
      phone: candidate.phone || "",
      role: candidate.role || "",
      status: candidate.status || "Applied",
      location: candidate.location || "",
      experience: candidate.experience || "",
      education: candidate.education || "",
      skills: candidate.skills || [],
      notes: candidate.notes || "",
      resumeUrl: candidate.resumeUrl || "",
      appliedDate: candidate.appliedDate || candidate.createdAt || new Date(),
      createdAt: candidate.createdAt || new Date(),
      updatedAt: candidate.updatedAt || new Date(),
    }

    return NextResponse.json({ success: true, candidate: formattedCandidate }, { status: 200 })
  } catch (error) {
    console.error("Error fetching candidate:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch candidate" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const candidateId = params.id
    const body = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Update candidate
    const result = await db.collection("candidates").updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Candidate updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating candidate:", error)
    return NextResponse.json({ success: false, message: "Failed to update candidate" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const candidateId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Delete candidate
    const result = await db.collection("candidates").deleteOne({ _id: new ObjectId(candidateId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    // Delete related records
    await db.collection("job_applications").deleteMany({ candidateId: new ObjectId(candidateId) })
    await db.collection("interviews").deleteMany({ candidateId: new ObjectId(candidateId) })
    await db.collection("candidate_comments").deleteMany({ candidateId: new ObjectId(candidateId) })

    return NextResponse.json({ success: true, message: "Candidate deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting candidate:", error)
    return NextResponse.json({ success: false, message: "Failed to delete candidate" }, { status: 500 })
  }
}
