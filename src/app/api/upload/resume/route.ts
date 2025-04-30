import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "resumes",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            resolve(NextResponse.json({ success: false, message: "Failed to upload file" }, { status: 500 }))
          } else {
            resolve(
              NextResponse.json({
                success: true,
                url: result?.secure_url,
                publicId: result?.public_id,
              }),
            )
          }
        },
      )

      // Write buffer to stream
      const Readable = require("stream").Readable
      const readableInstanceStream = new Readable({
        read() {
          this.push(buffer)
          this.push(null)
        },
      })

      readableInstanceStream.pipe(uploadStream)
    })
  } catch (error) {
    console.error("Resume upload error:", error)
    return NextResponse.json({ success: false, message: "Failed to process upload" }, { status: 500 })
  }
}
