import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { generateExcel } from "@/lib/excel"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    // Parse the request body with error handling
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ success: false, message: "Invalid request format" }, { status: 400 })
    }

    // Validate required fields
    if (!body.name || !body.email || !body.service || !body.message) {
      return NextResponse.json({ success: false, message: "Please fill in all required fields" }, { status: 400 })
    }

    try {
      // Connect to the database
      const { db } = await connectToDatabase()

      // Create a new contact submission with timestamp
      const contactSubmission = {
        ...body,
        createdAt: new Date(),
      }

      // Insert the submission into the database
      await db.collection("contactSubmissions").insertOne(contactSubmission)

      // Generate Excel file
      const excelBuffer = await generateExcel([contactSubmission])

      // Send email notification with Excel attachment
      await sendEmail({
        subject: `New Contact Form Submission from ${body.name}`,
        text: `You have received a new contact form submission from ${body.name} (${body.email}).\n\nService: ${body.service}\nMessage: ${body.message}`,
        attachments: [
          {
            filename: `contact_submission_${new Date().toISOString().split("T")[0]}.xlsx`,
            content: excelBuffer,
          },
        ],
      })

      return NextResponse.json({ success: true, message: "Contact form submitted successfully" }, { status: 200 })
    } catch (error) {
      console.error("Error processing contact form:", error)
      return NextResponse.json({ success: false, message: "Failed to process your request" }, { status: 500 })
    }
  } catch (error) {
    console.error("Unexpected error in contact form handler:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
