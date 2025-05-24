import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request (employee/admin)
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const data = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Get employee details
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 })
    }

    // Prepare preview result data
    const previewResultData = {
      testId: data.testId,
      testName: data.testName,
      employeeId: new ObjectId(userId),
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeEmail: employee.email,
      score: data.score,
      status: data.status,
      duration: data.duration,
      answers: data.answers,
      tabSwitchCount: data.tabSwitchCount,
      resultsDeclared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert preview result
    const result = await db.collection("assessment_preview_results").insertOne(previewResultData)

    if (!result.acknowledged) {
      throw new Error("Failed to save preview result")
    }

    return NextResponse.json({
      success: true,
      message: "Preview test result saved successfully",
      resultId: result.insertedId,
    })
  } catch (error) {
    console.error("Error saving preview result:", error)
    return NextResponse.json({ success: false, message: "Failed to save preview result" }, { status: 500 })
  }
}
