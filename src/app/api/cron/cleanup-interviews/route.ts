import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    // Connect to database
    const { db } = await connectToDatabase()

    // Get current date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find all past interviews that are still scheduled
    const pastInterviews = await db
      .collection("interviews")
      .find({
        date: { $lt: today },
        status: "scheduled",
      })
      .toArray()

    console.log(`Found ${pastInterviews.length} past interviews to mark as expired`)

    if (pastInterviews.length > 0) {
      // Update all past interviews to expired status
      const bulkOps = pastInterviews.map((interview) => ({
        updateOne: {
          filter: { _id: interview._id },
          update: {
            $set: {
              status: "expired",
              updatedAt: new Date(),
            },
          },
        },
      }))

      const result = await db.collection("interviews").bulkWrite(bulkOps)
      console.log(`Updated ${result.modifiedCount} interviews to expired status`)
    }

    return NextResponse.json(
      {
        success: true,
        message: `Processed ${pastInterviews.length} past interviews`,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error cleaning up interviews:", error)
    return NextResponse.json({ success: false, message: "Failed to clean up interviews" }, { status: 500 })
  }
}
