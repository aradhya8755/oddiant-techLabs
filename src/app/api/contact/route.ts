import type { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { generateExcel } from "@/lib/excel"
import { sendEmail } from "@/lib/email"

// Use Node.js runtime instead of Edge since we're using MongoDB and nodemailer
// Edge runtime doesn't fully support these libraries
export const runtime = "nodejs"

// Enable CORS with OPTIONS method
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
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
      body = await request.json()
      console.log("Request body parsed successfully:", body)
    } catch (error) {
      console.error("Error parsing request body:", error)
      return new Response(JSON.stringify({ success: false, message: "Invalid request format" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      })
    }

    // Validate required fields
    if (!body.name || !body.email || !body.service || !body.message) {
      console.error("Missing required fields:", body)
      return new Response(JSON.stringify({ success: false, message: "Please fill in all required fields" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      })
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

      // Return success response with explicit headers
      return new Response(JSON.stringify({ success: true, message: "Contact form submitted successfully" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      })
    } catch (error) {
      console.error("Error processing contact form:", error)
      return new Response(JSON.stringify({ success: false, message: "Failed to process your request" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      })
    }
  } catch (error) {
    console.error("Unexpected error in contact form handler:", error)
    return new Response(JSON.stringify({ success: false, message: "An unexpected error occurred" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }
}
