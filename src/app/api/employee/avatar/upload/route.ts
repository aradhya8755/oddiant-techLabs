import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { ObjectId } from "mongodb"

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the form data
    const formData = await req.formData()
    const avatarFile = formData.get("avatar") as File
    const employeeId = formData.get("employeeId") as string

    if (!avatarFile) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Verify the employee ID matches the authenticated user
    if (session.user._id.toString() !== employeeId) {
      return NextResponse.json({ message: "Unauthorized to update this profile" }, { status: 403 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await avatarFile.arrayBuffer())

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, {
      folder: "employee_avatars",
    })

    // Connect to database
    const { db } = await connectToDatabase()

    // Update the employee record with the new avatar URL
    await db.collection("employees").updateOne(
      { _id: new ObjectId(employeeId) },
      {
        $set: {
          avatar: result.url,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatarUrl: result.url,
    })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to upload avatar" },
      { status: 500 },
    )
  }
}
