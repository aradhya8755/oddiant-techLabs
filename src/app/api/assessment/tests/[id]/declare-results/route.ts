import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const testId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Find test by ID
    const test = await db.collection("assessment_tests").findOne({
      _id: new ObjectId(testId),
      createdBy: new ObjectId(userId),
    })

    if (!test) {
      return NextResponse.json({ success: false, message: "Test not found" }, { status: 404 })
    }

    // Get employee details
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(userId) })

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 })
    }

    // Get all completed results for this test that haven't been declared yet
    const results = await db
      .collection("assessment_results")
      .find({
        testId: new ObjectId(testId),
        createdBy: new ObjectId(userId),
        resultsDeclared: { $ne: true },
      })
      .toArray()

    if (results.length === 0) {
      return NextResponse.json({ success: false, message: "No new results to declare" }, { status: 404 })
    }

    // Update all results to mark them as declared
    await db.collection("assessment_results").updateMany(
      {
        testId: new ObjectId(testId),
        createdBy: new ObjectId(userId),
        resultsDeclared: { $ne: true },
      },
      {
        $set: {
          resultsDeclared: true,
          resultsDeclaredAt: new Date(),
        },
      },
    )

    // Update candidate statuses based on results
    for (const result of results) {
      await db.collection("assessment_candidates").updateOne(
        {
          email: result.candidateEmail,
          createdBy: new ObjectId(userId),
        },
        {
          $set: {
            status: result.status, // Now update to Passed or Failed
            updatedAt: new Date(),
          },
        },
      )
    }

    // Send email to each candidate
    const emailPromises = results.map(async (result) => {
      try {
        await sendEmail({
          to: result.candidateEmail,
          subject: `Your Assessment Results: ${test.name}`,
          text: `
            Hello ${result.candidateName},

            Your results for the ${test.name} assessment have been declared.

            Your Results:
            - Score: ${result.score}%
            - Status: ${result.status}
            - Duration: ${result.duration} minutes

            ${
              result.status === "Passed"
                ? "Congratulations on passing the assessment!"
                : "Thank you for your participation. You can try again if allowed by the assessment administrator."
            }

            Best regards,
            ${employee.firstName} ${employee.lastName}
            ${employee.companyName}
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #333;">Assessment Results Declared</h2>
              <p>Hello ${result.candidateName},</p>
              <p>Your results for the <strong>${test.name}</strong> assessment have been declared.</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Your Results:</h3>
                <p><strong>Score:</strong> ${result.score}%</p>
                <p><strong>Status:</strong> <span style="color: ${result.status === "Passed" ? "#4CAF50" : "#F44336"};">${result.status}</span></p>
                <p><strong>Duration:</strong> ${result.duration} minutes</p>
              </div>
              
              <p>${
                result.status === "Passed"
                  ? "Congratulations on passing the assessment!"
                  : "Thank you for your participation. You can try again if allowed by the assessment administrator."
              }</p>
              
              <p>Best regards,<br>${employee.firstName} ${employee.lastName}<br>${employee.companyName}</p>
            </div>
          `,
        })
        return { email: result.candidateEmail, success: true }
      } catch (error) {
        console.error(`Error sending email to ${result.candidateEmail}:`, error)
        return { email: result.candidateEmail, success: false, error: (error as Error).message }
      }
    })

    const emailResults = await Promise.all(emailPromises)
    const successfulEmails = emailResults.filter((r) => r.success).length
    const failedEmails = emailResults.filter((r) => !r.success).length

    return NextResponse.json(
      {
        success: true,
        message: `Results declared and ${successfulEmails} emails sent successfully${
          failedEmails > 0 ? `, ${failedEmails} failed` : ""
        }`,
        resultsCount: results.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error declaring results:", error)
    return NextResponse.json({ success: false, message: "Failed to declare results" }, { status: 500 })
  }
}
