import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, jobId } = await request.json()

    if (!email || !jobId) {
      return NextResponse.json({ success: false, message: "Email and jobId are required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Start a session for transaction
    const session = db.client.startSession()

    try {
      // Start transaction
      session.startTransaction()

      // Find the job
      const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) })

      if (!job) {
        await session.abortTransaction()
        return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 })
      }

      // Check if user already exists
      const existingUser = await db.collection("users").findOne({ email })

      // If user doesn't exist, check candidates collection
      let existingCandidate = null
      if (!existingUser) {
        existingCandidate = await db.collection("candidates").findOne({ email })
      }

      // If neither user nor candidate exists, return not found
      if (!existingUser && !existingCandidate) {
        await session.abortTransaction()
        return NextResponse.json({
          success: true,
          exists: false,
          message: "No existing user found with this email",
        })
      }

      // Get candidate details
      const candidate =
        existingCandidate ||
        (await db.collection("candidates").findOne({
          userId: existingUser ? existingUser._id : null,
          email,
        }))

      if (!candidate) {
        // Create a new candidate record if user exists but no candidate record
        if (existingUser) {
          const newCandidate = {
            name: existingUser.firstName + " " + existingUser.lastName,
            firstName: existingUser.firstName || "",
            lastName: existingUser.lastName || "",
            email: existingUser.email,
            phone: existingUser.phone || "",
            status: "Applied",
            role: job.jobTitle,
            location: job.jobLocation || "",
            experience: job.experienceRange || "",
            appliedDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: existingUser._id,
          }

          const candidateResult = await db.collection("candidates").insertOne(newCandidate, { session })
          var candidateId = candidateResult.insertedId
        } else {
          await session.abortTransaction()
          return NextResponse.json({
            success: true,
            exists: false,
            message: "No candidate profile found",
          })
        }
      } else {
        candidateId = candidate._id
      }

      // Check if already applied to this job
      const existingApplication = await db.collection("job_applications").findOne({
        jobId: new ObjectId(jobId),
        candidateId: candidateId,
      })

      if (existingApplication) {
        await session.abortTransaction()
        return NextResponse.json({
          success: true,
          exists: true,
          message: "You have already applied to this job",
        })
      }

      // Create job application record
      const application = {
        jobId: new ObjectId(jobId),
        candidateId: candidateId,
        status: "Applied",
        appliedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const applicationResult = await db.collection("job_applications").insertOne(application, { session })

      // Update the job's applicant count
      await db.collection("jobs").updateOne({ _id: new ObjectId(jobId) }, { $inc: { applicants: 1 } }, { session })

      // Commit the transaction
      await session.commitTransaction()

      // Send confirmation email to candidate
      try {
        await sendEmail({
          to: email,
          subject: `Application Received: ${job.jobTitle} at ${job.companyName}`,
          text: `
            Dear ${candidate?.name || "Applicant"},

            Thank you for applying for the ${job.jobTitle} position at ${job.companyName}.

            We have received your application and will review it shortly. If your qualifications match our requirements, we will contact you for the next steps.

            Best regards,
            ${job.companyName} Recruitment Team
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #333;">Application Received</h2>
              <p>Dear ${candidate?.name || "Applicant"},</p>
              <p>Thank you for applying for the <strong>${job.jobTitle}</strong> position at <strong>${job.companyName}</strong>.</p>
              <p>We have received your application and will review it shortly. If your qualifications match our requirements, we will contact you for the next steps.</p>
              <p>Best regards,<br>${job.companyName} Recruitment Team</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError)
        // Continue with the process even if email fails
      }

      return NextResponse.json(
        {
          success: true,
          exists: true,
          message: "Application submitted successfully",
          candidateId: candidateId.toString(),
        },
        { status: 201 },
      )
    } catch (error: any) {
      // Abort transaction on error
      await session.abortTransaction()
      throw error
    } finally {
      // End session
      await session.endSession()
    }
  } catch (error: any) {
    console.error("Error during sign-in:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Sign-in failed: ${error.message || "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
