import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, action, rejectionReason, rejectionComments } = body

    if (!employeeId || !action) {
      return NextResponse.json({ success: false, message: "Employee ID and action are required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee by ID
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(employeeId) })

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 })
    }

    if (action === "approve") {
      // Update employee as verified
      await db.collection("employees").updateOne(
        { _id: new ObjectId(employeeId) },
        {
          $set: {
            verified: true,
            verifiedAt: new Date(),
            updatedAt: new Date(),
          },
          $unset: { rejected: "", rejectedAt: "", rejectionReason: "", rejectionComments: "" },
        },
      )

      // Send approval email to employee
      try {
        await sendEmail({
          to: employee.email,
          subject: "Your Account Has Been Approved - Oddiant Techlabs",
          text: `Dear ${employee.firstName},

Your account has been approved by our team. You can now sign in to access your dashboard.

Sign in at: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/employee/login

Thank you for joining Oddiant Techlabs!

Best regards,
The Oddiant Techlabs Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #333;">Your Account Has Been Approved</h2>
              <p>Dear ${employee.firstName},</p>
              <p>We're pleased to inform you that your account has been approved by our team. You can now sign in to access your dashboard.</p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/employee/login" 
                   style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Sign In Now
                </a>
              </div>
              <p>Thank you for joining Oddiant Techlabs!</p>
              <p>Best regards,<br>The Oddiant Techlabs Team</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("Error sending approval email:", emailError)
        // Continue with the process even if email fails
      }

      return NextResponse.json({ success: true, message: "Employee approved successfully" }, { status: 200 })
    } else if (action === "reject") {
      // Validate rejection reason if provided
      if (!rejectionReason) {
        return NextResponse.json({ success: false, message: "Rejection reason is required" }, { status: 400 })
      }

      // Update employee as rejected
      await db.collection("employees").updateOne(
        { _id: new ObjectId(employeeId) },
        {
          $set: {
            rejected: true,
            rejectedAt: new Date(),
            rejectionReason,
            rejectionComments: rejectionComments || "",
            updatedAt: new Date(),
          },
        },
      )

      // Get readable rejection reason
      const rejectionReasonMap = {
        incomplete_information: "Incomplete Information",
        document_error: "Document Error or Invalid Documents",
        company_verification_failed: "Company Verification Failed",
        duplicate_account: "Duplicate Account",
        suspicious_activity: "Suspicious Activity",
        not_eligible: "Not Eligible for the Platform",
        other: "Other",
      }

      const readableReason = rejectionReasonMap[rejectionReason] || rejectionReason

      // Send rejection email to employee
      try {
        await sendEmail({
          to: employee.email,
          subject: "Regarding Your Account Application - Oddiant Techlabs",
          text: `Dear ${employee.firstName},

Thank you for your interest in Oddiant Techlabs. After reviewing your application, we regret to inform you that we are unable to approve your account at this time.

Reason: ${readableReason}
${rejectionComments ? `Additional Comments: ${rejectionComments}` : ""}

If you would like to appeal this decision, you can update your information and resubmit your application by clicking the link below:

${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/employee/appeal/${employeeId}

If you have any questions, please contact our support team at support@oddiant.com.

Best regards,
The Oddiant Techlabs Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #333;">Regarding Your Account Application</h2>
              <p>Dear ${employee.firstName},</p>
              <p>Thank you for your interest in Oddiant Techlabs. After reviewing your application, we regret to inform you that we are unable to approve your account at this time.</p>
              
              <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Reason:</strong> ${readableReason}</p>
                ${rejectionComments ? `<p><strong>Additional Comments:</strong> ${rejectionComments}</p>` : ""}
              </div>
              
              <p>If you would like to appeal this decision, you can update your information and resubmit your application by clicking the button below:</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/employee/appeal/${employeeId}" 
                   style="background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Appeal and Update Information
                </a>
              </div>
              
              <p>If you have any questions, please contact our support team at <a href="mailto:support@oddiant.com">support@oddiant.com</a>.</p>
              <p>Best regards,<br>The Oddiant Techlabs Team</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError)
        // Continue with the process even if email fails
      }

      return NextResponse.json({ success: true, message: "Employee rejected successfully" }, { status: 200 })
    } else {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in employee verification:", error)
    return NextResponse.json({ success: false, message: "Verification failed. Please try again." }, { status: 500 })
  }
}
