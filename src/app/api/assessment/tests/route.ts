import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Get query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const type = url.searchParams.get("type")
    const duration = url.searchParams.get("duration")
    const limit = url.searchParams.get("limit") ? Number.parseInt(url.searchParams.get("limit") as string) : undefined
    const sort = url.searchParams.get("sort") || "createdAt"

    // Build query
    const query: any = { createdBy: new ObjectId(userId) }

    if (status) {
      query.status = status
    }

    if (type) {
      query.type = type
    }

    if (duration) {
      // Parse duration filter
      if (duration === "< 60") {
        query.duration = { $lt: 60 }
      } else if (duration === "60-120") {
        query.duration = { $gte: 60, $lte: 120 }
      } else if (duration === "> 120") {
        query.duration = { $gt: 120 }
      }
    }

    // Get tests from database
    let testsQuery = db.collection("assessment_tests").find(query)

    // Apply sorting
    testsQuery = testsQuery.sort({ [sort]: -1 })

    // Apply limit if specified
    if (limit) {
      testsQuery = testsQuery.limit(limit)
    }

    const tests = await testsQuery.toArray()

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, tests },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch tests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get test data from request body
    const testData = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Create new test
    const newTest = {
      ...testData,
      createdBy: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: testData.status || "Draft",
    }

    // Insert test into database
    const result = await db.collection("assessment_tests").insertOne(newTest)

    return NextResponse.json({ success: true, testId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json({ success: false, message: "Failed to create test" }, { status: 500 })
  }
}
