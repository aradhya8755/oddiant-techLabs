import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { sendEmail } from "@/lib/email"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const interviewId = await params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Find interview by ID
    const interview = await db.collection("interviews").findOne({ _id: new ObjectId(interviewId) })

    if (!interview) {
      return NextResponse.json({ success: false, message: "Interview not found" }, { status: 404 })
    }

    // Get candidate details
    const candidate = await db.collection("candidates").findOne({ _id: new ObjectId(interview.candidateId) })

    if (!candidate) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    // Get job details if jobId exists
    let job = null
    if (interview.jobId) {
      job = await db.collection("jobs").findOne({ _id: new ObjectId(interview.jobId) })
    }

    // Format the response
    const formattedInterview = {
      ...interview,
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone || "",
        role: candidate.role || "",
        status: candidate.status || "Applied",
        avatar: candidate.avatar || null,
      },
      job: job
        ? {
            _id: job._id,
            jobTitle: job.jobTitle,
          }
        : null,
    }

    return NextResponse.json({ success: true, interview: formattedInterview }, { status: 200 })
  } catch (error) {
    console.error("Error fetching interview:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch interview" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const interviewId = params.id
    const body = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Find the interview to get candidate info
    const interview = await db.collection("interviews").findOne({ _id: new ObjectId(interviewId) })

    if (!interview) {
      return NextResponse.json({ success: false, message: "Interview not found" }, { status: 404 })
    }

    // Find candidate
    const candidate = await db.collection("candidates").findOne({ _id: new ObjectId(interview.candidateId) })

    if (!candidate) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    // Find employee
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 })
    }

    // Update interview
    const result = await db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          ...body,
          date: body.date ? new Date(body.date) : interview.date,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Interview not found" }, { status: 404 })
    }

    // Send email notification to candidate about rescheduled interview
    if (body.status === "rescheduled") {
      try {
        await sendEmail({
          to: candidate.email,
          subject: `Interview Rescheduled: ${interview.position} at ${employee.companyName}`,
          text: `
            Dear ${candidate.name},

            Your interview for the ${interview.position} position at ${employee.companyName} has been rescheduled.

            New Date: ${new Date(body.date).toLocaleDateString()}
            New Time: ${body.time}
            ${body.meetingLink ? `Meeting Link: ${body.meetingLink}` : ""}

            ${body.notes ? `Additional Notes: ${body.notes}` : ""}

            Please let us know if you have any questions.

            Best regards,
            ${employee.firstName} ${employee.lastName}
            ${employee.companyName}
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #333;">Interview Rescheduled</h2>
              <p>Dear ${candidate.name},</p>
              <p>Your interview for the <strong>${interview.position}</strong> position at <strong>${employee.companyName}</strong> has been rescheduled.</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>New Date:</strong> ${new Date(body.date).toLocaleDateString()}</p>
                <p><strong>New Time:</strong> ${body.time}</p>
                ${body.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${body.meetingLink}">${body.meetingLink}</a></p>` : ""}
              </div>
              ${body.notes ? `<p><strong>Additional Notes:</strong> ${body.notes}</p>` : ""}
              <p>Please let us know if you have any questions.</p>
              <p>Best regards,<br>${employee.firstName} ${employee.lastName}<br>${employee.companyName}</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("Error sending interview rescheduling email:", emailError)
        // Continue with the process even if email fails
      }
    }

    return NextResponse.json({ success: true, message: "Interview updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error updating interview:", error)
    return NextResponse.json({ success: false, message: "Failed to update interview" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const interviewId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Delete interview
    const result = await db.collection("interviews").deleteOne({ _id: new ObjectId(interviewId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Interview not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Interview deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting interview:", error)
    return NextResponse.json({ success: false, message: "Failed to delete interview" }, { status: 500 })
  }
}
