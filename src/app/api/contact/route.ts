import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { generateExcel } from "@/lib/excel"
import { sendEmail } from "@/lib/email"

// Enable CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

// Handle POST requests
export async function POST(request: NextRequest) {
  console.log("Contact API route hit with POST method")

  try {
    // Parse the request body with error handling
    let body
    try {
      const text = await request.text()
      console.log("Request body text:", text)

      if (!text) {
        return NextResponse.json({ success: false, message: "Empty request body" }, { status: 400 })
      }

      try {
        body = JSON.parse(text)
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError)
        return NextResponse.json({ success: false, message: "Invalid JSON format" }, { status: 400 })
      }
    } catch (error) {
      console.error("Error reading request body:", error)
      return NextResponse.json({ success: false, message: "Failed to read request body" }, { status: 400 })
    }

    // Log the parsed body
    console.log("Parsed body:", body)

    // Validate required fields
    if (!body.name || !body.email || !body.service || !body.message) {
      return NextResponse.json({ success: false, message: "Please fill in all required fields" }, { status: 400 })
    }

    try {
      // Connect to the database
      console.log("Connecting to database...")
      const { db } = await connectToDatabase()
      console.log("Database connected successfully")

      // Create a new contact submission with timestamp
      const contactSubmission = {
        ...body,
        createdAt: new Date(),
      }

      // Insert the submission into the database
      console.log("Inserting submission into database...")
      await db.collection("contactSubmissions").insertOne(contactSubmission)
      console.log("Submission inserted successfully")

      // Skip email sending if in development mode to avoid errors
      if (process.env.NODE_ENV === "production") {
        try {
          // Generate Excel file
          console.log("Generating Excel file...")
          const excelBuffer = await generateExcel([contactSubmission])
          console.log("Excel file generated successfully")

          // Send email notification with Excel attachment
          console.log("Sending email...")
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
          console.log("Email sent successfully")
        } catch (emailError) {
          // Log but don't fail if email sending fails
          console.error("Error with email or Excel generation:", emailError)
          // Continue processing - we'll still return success since the DB entry was created
        }
      } else {
        console.log("Skipping email sending in development mode")
      }

      // Return success response
      return NextResponse.json(
        { success: true, message: "Contact form submitted successfully" },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    } catch (error) {
      console.error("Error processing contact form:", error)
      return NextResponse.json(
        { success: false, message: "Failed to process your request" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }
  } catch (error) {
    console.error("Unexpected error in contact form handler:", error)
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
