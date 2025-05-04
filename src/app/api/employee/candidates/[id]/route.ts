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

    const candidateId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Find candidate by ID
    const candidate = await db.collection("candidates").findOne({ _id: new ObjectId(candidateId) })

    if (!candidate) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    // Format the education field properly if it exists and is an object or array
    if (candidate.education) {
      // If education is an array of objects, format each one
      if (Array.isArray(candidate.education)) {
        candidate.education = candidate.education.map((edu) => {
          if (typeof edu === "object" && edu !== null) {
            // Format each education entry properly
            const degree = edu.degree || "N/A"
            const institution = edu.institution || "N/A"
            const startYear = edu.startYear || "N/A"
            const endYear = edu.endYear || "N/A"

            // Create a formatted string representation
            edu.formattedEducation = `${degree} in ${institution} (${startYear}-${endYear})`
          }
          return edu
        })
      }
      // If education is a single object, format it
      else if (typeof candidate.education === "object" && candidate.education !== null) {
        const edu = candidate.education
        const degree = edu.degree || "N/A"
        const institution = edu.institution || "N/A"
        const startYear = edu.startYear || "N/A"
        const endYear = edu.endYear || "N/A"

        candidate.formattedEducation = `${degree} in ${institution} (${startYear}-${endYear})`
      }
    }

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, candidate },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching candidate:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch candidate" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const candidateId = params.id
    const candidateData = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Update candidate in database
    const result = await db.collection("candidates").updateOne(
      { _id: new ObjectId(candidateId) },
      {
        $set: {
          ...candidateData,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Candidate updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating candidate:", error)
    return NextResponse.json({ success: false, message: "Failed to update candidate" }, { status: 500 })
  }
}
