import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { sendSMS } from "@/lib/sms"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { candidateId, type, subject, content, sentAt } = body

    if (!candidateId || !type || !content) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find candidate to get contact information
    const candidate = await db.collection("candidates").findOne({ _id: new ObjectId(candidateId) })

    if (!candidate) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    // Find employee to get sender information
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 })
    }

    // Log the communication
    await db.collection("communications").insertOne({
      candidateId: new ObjectId(candidateId),
      employeeId: new ObjectId(userId),
      type,
      subject: subject || "",
      content,
      sentAt: sentAt || new Date(),
      status: "sent",
    })

    // Send the actual communication
    if (type === "email") {
      if (!candidate.email) {
        return NextResponse.json({ success: false, message: "Candidate email not found" }, { status: 400 })
      }

      try {
        await sendEmail({
          to: candidate.email,
          subject: subject || "Message from Oddiant Techlabs",
          text: content,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6d28d9;">Message from ${employee.firstName} ${employee.lastName}</h2>
            <p style="white-space: pre-line; line-height: 1.5;">${content}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 14px;">
              This email was sent from Oddiant Techlabs Recruitment Portal.
            </p>
          </div>`,
        })
      } catch (emailError) {
        console.error("Error sending email:", emailError)
        return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 })
      }
    } else if (type === "sms") {
      if (!candidate.phone) {
        return NextResponse.json({ success: false, message: "Candidate phone number not found" }, { status: 400 })
      }

      try {
        // Check if Twilio is configured
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
          // Send SMS using Twilio
          await sendSMS({
            to: candidate.phone,
            body: `Message from ${employee.firstName} ${employee.lastName} at Oddiant Techlabs: ${content}`,
          })
        } else {
          // Log the SMS that would have been sent
          console.log(`SMS would be sent to ${candidate.phone} with content: ${content}`)
        }
      } catch (smsError) {
        console.error("Error sending SMS:", smsError)
        return NextResponse.json({ success: false, message: "Failed to send SMS" }, { status: 500 })
      }
    }

    return NextResponse.json(
      { success: true, message: `${type === "email" ? "Email" : "SMS"} sent successfully` },
      { status: 200 },
    )
  } catch (error) {
    console.error(`Error sending communication:`, error)
    return NextResponse.json({ success: false, message: "Failed to send communication" }, { status: 500 })
  }
}
