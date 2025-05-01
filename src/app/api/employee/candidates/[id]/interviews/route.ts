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

    const candidateId = await params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee to get company ID
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    // Get interviews for this candidate
    const interviews = await db
      .collection("interviews")
      .find({ candidateId: new ObjectId(candidateId) })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json({ success: true, interviews }, { status: 200 })
  } catch (error) {
    console.error("Error fetching candidate interviews:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch interviews" }, { status: 500 })
  }
}
