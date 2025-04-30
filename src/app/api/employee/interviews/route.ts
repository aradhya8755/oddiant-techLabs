import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { sendEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee to get company ID
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    // Get interviews for this company
    // In a real implementation, you would filter by company ID
    const interviews = await db.collection("interviews").find({}).toArray()

    return NextResponse.json({ success: true, interviews }, { status: 200 })
  } catch (error) {
    console.error("Error fetching interviews:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch interviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { candidateId, jobId, position, date, time, duration, interviewers, meetingLink, notes } = body

    if (!candidateId || !position || !date || !time) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee to get company ID
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    // Find candidate
    const candidate = await db.collection("candidates").findOne({ _id: new ObjectId(candidateId) })

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 })
    }

    // Create new interview
    const newInterview = {
      candidateId: new ObjectId(candidateId),
      jobId: jobId ? new ObjectId(jobId) : null,
      position,
      date: new Date(date),
      time,
      duration: Number.parseInt(duration, 10),
      interviewers,
      meetingLink,
      notes,
      companyId: employee.companyId,
      scheduledBy: new ObjectId(userId),
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("interviews").insertOne(newInterview)

    // Send email notification to candidate
    try {
      await sendEmail({
        to: candidate.email,
        subject: `Interview Scheduled: ${position} at ${employee.companyName}`,
        text: `
          Dear ${candidate.name},

          Your interview for the ${position} position at ${employee.companyName} has been scheduled.

          Date: ${new Date(date).toLocaleDateString()}
          Time: ${time}
          ${meetingLink ? `Meeting Link: ${meetingLink}` : ""}

          ${notes ? `Additional Notes: ${notes}` : ""}

          Please let us know if you have any questions or need to reschedule.

          Best regards,
          ${employee.firstName} ${employee.lastName}
          ${employee.companyName}
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Interview Scheduled</h2>
            <p>Dear ${candidate.name},</p>
            <p>Your interview for the <strong>${position}</strong> position at <strong>${employee.companyName}</strong> has been scheduled.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${time}</p>
              ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
            </div>
            ${notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ""}
            <p>Please let us know if you have any questions or need to reschedule.</p>
            <p>Best regards,<br>${employee.firstName} ${employee.lastName}<br>${employee.companyName}</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("Error sending interview notification email:", emailError)
      // Continue with the process even if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Interview scheduled successfully",
        interviewId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error scheduling interview:", error)
    return NextResponse.json({ success: false, message: "Failed to schedule interview" }, { status: 500 })
  }
}
