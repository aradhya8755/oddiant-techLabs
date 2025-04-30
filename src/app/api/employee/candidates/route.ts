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

    // Find employee to get company ID
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    // Get candidates for this company
    // In a real implementation, you would filter by company ID
    const candidates = await db.collection("candidates").find({}).toArray()

    return NextResponse.json({ success: true, candidates }, { status: 200 })
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch candidates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee to get company ID
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    // Create new candidate
    const newCandidate = {
      ...body,
      companyId: employee.companyId,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("candidates").insertOne(newCandidate)

    return NextResponse.json(
      {
        success: true,
        message: "Candidate added successfully",
        candidateId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding candidate:", error)
    return NextResponse.json({ success: false, message: "Failed to add candidate" }, { status: 500 })
  }
}
