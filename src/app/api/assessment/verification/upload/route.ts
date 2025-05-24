import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const token = formData.get("token") as string
    const type = formData.get("type") as "face" | "id_card"

    if (!image || !token || !type) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: image, token, or type" },
        { status: 400 },
      )
    }

    // Log request details for debugging
    console.log(`Processing ${type} upload for token: ${token}`)
    console.log(`Image size: ${image.size} bytes, type: ${image.type}`)

    // Connect to database
    const { db } = await connectToDatabase()

    // Find invitation by token
    const invitation = await db.collection("assessment_invitations").findOne({ token })

    if (!invitation) {
      console.error(`Invalid invitation token: ${token}`)
      return NextResponse.json({ success: false, message: "Invalid invitation token" }, { status: 404 })
    }

    console.log(`Found invitation for: ${invitation.email}`)

    // Convert file to buffer
    const buffer = Buffer.from(await image.arrayBuffer())
    console.log(`Converted image to buffer: ${buffer.length} bytes`)

    // Upload to Cloudinary
    const folder = `assessment/${type === "face" ? "faces" : "id_cards"}`
    console.log(`Uploading to Cloudinary folder: ${folder}`)

    const uploadResult = await uploadToCloudinary(buffer, { folder })
    console.log(`Cloudinary upload successful: ${uploadResult.public_id}`)

    // Create or update verification record
    const verificationData = {
      invitationId: invitation._id,
      candidateEmail: invitation.email,
      [`${type}ImageUrl`]: uploadResult.url,
      [`${type}PublicId`]: uploadResult.public_id,
      updatedAt: new Date(),
    }

    // Check if verification record already exists
    const existingVerification = await db.collection("assessment_verifications").findOne({
      invitationId: invitation._id,
    })

    if (existingVerification) {
      // Update existing record
      console.log(`Updating existing verification record for: ${invitation.email}`)
      await db.collection("assessment_verifications").updateOne(
        { invitationId: invitation._id },
        {
          $set: verificationData,
        },
      )
    } else {
      // Create new record
      console.log(`Creating new verification record for: ${invitation.email}`)
      verificationData.createdAt = new Date()
      await db.collection("assessment_verifications").insertOne(verificationData)
    }

    console.log(`Verification data saved successfully for: ${invitation.email}`)
    return NextResponse.json({
      success: true,
      message: `${type === "face" ? "Face" : "ID card"} uploaded successfully`,
      imageUrl: uploadResult.url,
    })
  } catch (error) {
    console.error("Error uploading verification image:", error)
    return NextResponse.json({ success: false, message: "Failed to upload verification image" }, { status: 500 })
  }
}
