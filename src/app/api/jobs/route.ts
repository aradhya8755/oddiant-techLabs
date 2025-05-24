import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get job data from request body
    const jobData = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee to verify
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 })
    }

    // Create new job with employee ID
    const newJob = {
      ...jobData,
      employerId: new ObjectId(userId), // Add employer ID for isolation
      companyName: employee.companyName || "Unknown Company",
      applicants: 0,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert job into database
    const result = await db.collection("jobs").insertOne(newJob)

    return NextResponse.json(
      {
        success: true,
        message: "Job created successfully",
        jobId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ success: false, message: "Failed to create job" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee to verify
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 })
    }

    // Find all jobs for this employee only
    const jobs = await db
      .collection("jobs")
      .find({ employerId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, jobs },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch jobs" }, { status: 500 })
  }
}
