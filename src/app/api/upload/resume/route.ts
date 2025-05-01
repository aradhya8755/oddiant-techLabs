import { type NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 })
    }

    // Log file details for debugging
    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Cloudinary using the utility function
    try {
      const result = await uploadToCloudinary(buffer, {
        folder: "resumes",
        resource_type: "auto",
      })

      console.log("Cloudinary upload successful:", result)

      if (!result || !result.url) {
        console.error("Invalid Cloudinary result:", result)
        return NextResponse.json(
          {
            success: false,
            message: "Cloudinary upload failed: No URL returned",
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        url: result.url,
        publicId: result.public_id,
      })
    } catch (cloudinaryError: any) {
      console.error("Cloudinary upload error:", cloudinaryError)
      return NextResponse.json(
        {
          success: false,
          message: `Failed to upload to Cloudinary: ${cloudinaryError.message || "Unknown error"}`,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Resume upload error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to process upload: ${error.message || "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
