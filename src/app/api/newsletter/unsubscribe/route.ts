import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    const { email } = body

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if email exists
    const existingSubscriber = await db.collection("newsletters").findOne({ email })

    if (!existingSubscriber) {
      return NextResponse.json({ message: "Email not found in our subscribers list" }, { status: 404 })
    }

    // Update subscriber to inactive
    await db.collection("newsletters").updateOne(
      { email },
      {
        $set: {
          active: false,
          unsubscribedDate: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ message: "Successfully unsubscribed from newsletter" }, { status: 200 })
  } catch (error) {
    console.error("Newsletter unsubscription error:", error)
    return NextResponse.json({ message: "An error occurred while processing your unsubscription" }, { status: 500 })
  }
}
