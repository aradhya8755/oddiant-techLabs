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

    // Get test ID from request body
    const { testId } = await request.json()

    if (!testId) {
      return NextResponse.json({ success: false, message: "Test ID is required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find test
    const test = await db.collection("assessment_tests").findOne({ _id: new ObjectId(testId) })

    if (!test) {
      return NextResponse.json({ success: false, message: "Test not found" }, { status: 404 })
    }

    // Generate a unique token for this link
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Set expiry date (7 days from now)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)

    // Create link record
    const link = {
      testId: new ObjectId(testId),
      token,
      createdBy: new ObjectId(userId),
      createdAt: new Date(),
      expiresAt: expiryDate,
    }

    const result = await db.collection("assessment_links").insertOne(link)

    // Generate link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const linkUrl = `${baseUrl}/assessment/take/${token}`

    return NextResponse.json(
      {
        success: true,
        linkId: result.insertedId.toString(),
        link: linkUrl,
        expiresAt: expiryDate,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error generating link:", error)
    return NextResponse.json({ success: false, message: "Failed to generate link" }, { status: 500 })
  }
}
