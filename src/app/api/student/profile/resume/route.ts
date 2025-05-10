import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse the form data
    const formData = await request.formData()
    const resumeFile = formData.get("resume") as File

    if (!resumeFile) {
      return NextResponse.json({ success: false, message: "No resume file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await resumeFile.arrayBuffer())

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: "student_resumes",
      resource_type: "raw",
    })

    // Connect to database
    const { db } = await connectToDatabase()

    // Update student document with new resume URL
    const result = await db.collection("students").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          resumeUrl: uploadResult.url,
          "documents.resume": {
            url: uploadResult.url,
            uploadDate: new Date(),
            name: resumeFile.name,
          },
          updatedAt: new Date(),
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: "Failed to update resume" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: uploadResult.url,
    })
  } catch (error) {
    console.error("Error uploading resume:", error)
    return NextResponse.json({ success: false, message: "Failed to upload resume" }, { status: 500 })
  }
}
