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

    // Get company ID for data isolation
    const companyId = employee.companyId || employee._id.toString()

    // Get interviews for this employee only - proper data isolation
    const interviews = await db
      .collection("interviews")
      .find({
        $or: [{ scheduledBy: new ObjectId(userId) }, { employeeId: new ObjectId(userId) }, { companyId: companyId }],
      })
      .toArray()

    // Get current date for filtering
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Automatically delete or mark expired interviews
    const pastInterviews = interviews.filter((interview) => {
      const interviewDate = new Date(interview.date)
      interviewDate.setHours(0, 0, 0, 0)
      return interviewDate < today && interview.status === "scheduled"
    })

    if (pastInterviews.length > 0) {
      console.log(`Updating ${pastInterviews.length} past interviews to "expired" status`)

      // Update expired interviews in the database
      const bulkOps = pastInterviews.map((interview) => ({
        updateOne: {
          filter: { _id: interview._id },
          update: {
            $set: {
              status: "expired",
              updatedAt: new Date(),
            },
          },
        },
      }))

      await db.collection("interviews").bulkWrite(bulkOps)

      // Update the interview objects in memory as well
      for (const interview of interviews) {
        const interviewDate = new Date(interview.date)
        interviewDate.setHours(0, 0, 0, 0)

        if (interviewDate < today && interview.status === "scheduled") {
          interview.status = "expired"
        }
      }
    }

    // Format interviews with candidate details
    const formattedInterviews = await Promise.all(
      interviews.map(async (interview) => {
        // Try to get candidate details
        let candidateName = "Unknown Candidate"
        let candidateEmail = ""

        try {
          if (interview.candidateId) {
            // Try candidates collection first
            let candidate = await db.collection("candidates").findOne({ _id: new ObjectId(interview.candidateId) })

            // If not found, try students collection
            if (!candidate) {
              candidate = await db.collection("students").findOne({ _id: new ObjectId(interview.candidateId) })
            }

            if (candidate) {
              candidateName =
                candidate.name ||
                `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() ||
                "Unknown Candidate"
              candidateEmail = candidate.email || ""
            }
          }
        } catch (error) {
          console.error("Error fetching candidate details:", error)
        }

        return {
          _id: interview._id,
          candidateId: interview.candidateId,
          candidate: {
            name: candidateName,
            email: candidateEmail,
          },
          position: interview.position,
          date: new Date(interview.date).toISOString(),
          time: interview.time,
          status: interview.status,
          jobId: interview.jobId || undefined,
          meetingLink: interview.meetingLink,
          notes: interview.notes,
          duration: interview.duration,
        }
      }),
    )

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, interviews: formattedInterviews },
      {
        status: 200,
        headers: headers,
      },
    )
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

    // Get company ID for data isolation
    const companyId = employee.companyId || employee._id.toString()

    // Find candidate (check both collections)
    let candidate = null

    try {
      // Try candidates collection first
      candidate = await db.collection("candidates").findOne({ _id: new ObjectId(candidateId) })

      // If not found, try students collection
      if (!candidate) {
        candidate = await db.collection("students").findOne({ _id: new ObjectId(candidateId) })
      }
    } catch (error) {
      console.error("Error finding candidate:", error)
    }

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
      duration: Number.parseInt(duration, 10) || 60,
      interviewers,
      meetingLink,
      notes,
      companyId: companyId,
      scheduledBy: new ObjectId(userId),
      employeeId: new ObjectId(userId), // Added for proper data isolation
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("interviews").insertOne(newInterview)

    // If jobId is provided, update the job's interview count
    if (jobId) {
      await db.collection("jobs").updateOne({ _id: new ObjectId(jobId) }, { $inc: { interviews: 1 } })
    }

    // Update candidate status to "Interview" if applicable
    if (candidate) {
      // Try to update in candidates collection
      await db.collection("candidates").updateOne({ _id: new ObjectId(candidateId) }, { $set: { status: "Interview" } })

      // Try to update in students collection
      await db.collection("students").updateOne({ _id: new ObjectId(candidateId) }, { $set: { status: "Interview" } })

      // Update job application status
      if (jobId) {
        await db.collection("job_applications").updateOne(
          {
            candidateId: new ObjectId(candidateId),
            jobId: new ObjectId(jobId),
          },
          {
            $set: {
              status: "Interview",
              updatedAt: new Date(),
            },
            $push: {
              history: {
                status: "Interview",
                date: new Date(),
                note: "Interview scheduled",
              },
            },
          },
        )
      }
    }

    // Send email notification to candidate
    try {
      // Get candidate email - handle different collection schemas
      const candidateEmail = candidate.email
      const candidateName =
        candidate.name || `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() || "Candidate"

      if (candidateEmail) {
        await sendEmail({
          to: candidateEmail,
          subject: `Interview Scheduled: ${position} at ${employee.companyName}`,
          text: `
            Dear ${candidateName},

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
              <p>Dear ${candidateName},</p>
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
      }
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
