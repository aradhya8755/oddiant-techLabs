import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const testId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Find test by ID
    const test = await db.collection("assessment_tests").findOne({
      _id: new ObjectId(testId),
      createdBy: new ObjectId(userId),
    })

    if (!test) {
      return NextResponse.json({ success: false, message: "Test not found" }, { status: 404 })
    }

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, test },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching test:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch test" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const testId = params.id

    // Get test data from request body
    const testData = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Validate test data
    if (!testData.name) {
      return NextResponse.json({ success: false, message: "Test name is required" }, { status: 400 })
    }

    if (testData.duration <= 0) {
      return NextResponse.json({ success: false, message: "Test duration must be greater than 0" }, { status: 400 })
    }

    if (testData.passingScore < 0 || testData.passingScore > 100) {
      return NextResponse.json({ success: false, message: "Passing score must be between 0 and 100" }, { status: 400 })
    }

    // Prepare test data for update
    const updateData = {
      name: testData.name,
      description: testData.description,
      duration: testData.duration,
      passingScore: testData.passingScore,
      instructions: testData.instructions,
      type: testData.type,
      settings: {
        shuffleQuestions: testData.settings.shuffleQuestions,
        preventTabSwitching: testData.settings.preventTabSwitching,
        allowCalculator: testData.settings.allowCalculator,
        autoSubmit: testData.settings.autoSubmit,
      },
      sections: testData.sections,
      updatedAt: new Date(),
    }

    // Update test in database
    const result = await db
      .collection("assessment_tests")
      .updateOne({ _id: new ObjectId(testId), createdBy: new ObjectId(userId) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Test not found or you don't have permission to update it" },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, message: "Test updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating test:", error)
    return NextResponse.json({ success: false, message: "Failed to update test" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const testId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Delete test from database
    const result = await db.collection("assessment_tests").deleteOne({
      _id: new ObjectId(testId),
      createdBy: new ObjectId(userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Test not found or you don't have permission to delete it" },
        { status: 404 },
      )
    }

    // Also delete related invitations and results
    await db.collection("assessment_invitations").deleteMany({
      testId: new ObjectId(testId),
      createdBy: new ObjectId(userId),
    })

    await db.collection("assessment_results").deleteMany({
      testId: new ObjectId(testId),
      createdBy: new ObjectId(userId),
    })

    return NextResponse.json({ success: true, message: "Test deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting test:", error)
    return NextResponse.json({ success: false, message: "Failed to delete test" }, { status: 500 })
  }
}
