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

    // Get job postings for this company
    // In a real implementation, you would filter by company ID
    const jobs = await db.collection("jobs").find({}).toArray()

    return NextResponse.json({ success: true, jobs }, { status: 200 })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch jobs" }, { status: 500 })
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

    // Create new job posting
    const newJob = {
      ...body,
      companyId: employee.companyId,
      createdBy: userId,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("jobs").insertOne(newJob)

    return NextResponse.json(
      {
        success: true,
        message: "Job posting created successfully",
        jobId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating job posting:", error)
    return NextResponse.json({ success: false, message: "Failed to create job posting" }, { status: 500 })
  }
}
