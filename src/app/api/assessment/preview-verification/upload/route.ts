import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const token = formData.get("token") as string
    const type = formData.get("type") as "face" | "id_card"
    const isPreview = formData.get("isPreview") === "true"

    if (!image || !token || !type) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: image, token, or type" },
        { status: 400 },
      )
    }

    // Get the current user (employee) for preview mode
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Log request details for debugging
    console.log(`Processing preview ${type} upload for token: ${token}`)
    console.log(`Image size: ${image.size} bytes, type: ${image.type}`)

    // Connect to database
    const { db } = await connectToDatabase()

    // Convert file to buffer
    const buffer = Buffer.from(await image.arrayBuffer())
    console.log(`Converted image to buffer: ${buffer.length} bytes`)

    // Upload to Cloudinary
    const folder = `assessment/preview/${type === "face" ? "faces" : "id_cards"}`
    console.log(`Uploading to Cloudinary folder: ${folder}`)

    const uploadResult = await uploadToCloudinary(buffer, { folder })
    console.log(`Cloudinary upload successful: ${uploadResult.public_id}`)

    // Create or update preview verification record
    const verificationData = {
      testId: token, // Using token as test ID for preview
      employeeId: userId,
      [`${type}ImageUrl`]: uploadResult.url,
      [`${type}PublicId`]: uploadResult.public_id,
      updatedAt: new Date(),
    }

    // Check if preview verification record already exists
    const existingVerification = await db.collection("assessment_preview_verifications").findOne({
      testId: token,
      employeeId: userId,
    })

    if (existingVerification) {
      // Update existing record
      console.log(`Updating existing preview verification record for employee: ${userId}`)
      await db.collection("assessment_preview_verifications").updateOne(
        { testId: token, employeeId: userId },
        {
          $set: verificationData,
        },
      )
    } else {
      // Create new record
      console.log(`Creating new preview verification record for employee: ${userId}`)
      verificationData.createdAt = new Date()
      await db.collection("assessment_preview_verifications").insertOne(verificationData)
    }

    console.log(`Preview verification data saved successfully for employee: ${userId}`)
    return NextResponse.json({
      success: true,
      message: `${type === "face" ? "Face" : "ID card"} uploaded successfully`,
      imageUrl: uploadResult.url,
    })
  } catch (error) {
    console.error("Error uploading preview verification image:", error)
    return NextResponse.json({ success: false, message: "Failed to upload verification image" }, { status: 500 })
  }
}
