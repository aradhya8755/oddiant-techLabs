import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { sendEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    // Use getUserFromRequest instead of auth()
    const userId = await getUserFromRequest(req)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const formData = await req.formData()

    // Extract all form fields
    const firstName = formData.get("firstName") as string
    const middleName = (formData.get("middleName") as string) || null
    const lastName = formData.get("lastName") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const designation = formData.get("designation") as string
    const linkedinProfile = (formData.get("linkedinProfile") as string) || null
    const companyName = formData.get("companyName") as string
    const companyLocation = formData.get("companyLocation") as string
    const companyIndustry = formData.get("companyIndustry") as string
    const teamSize = formData.get("teamSize") as string
    const documentType = formData.get("documentType") as string
    const documentNumber = formData.get("documentNumber") as string
    const reason = formData.get("reason") as string
    const employeeId = formData.get("employeeId") as string
    const documentFile = formData.get("documentFile") as File | null
    const companyWebsite = (formData.get("companyWebsite") as string) || null
    const companyLinkedin = (formData.get("companyLinkedin") as string) || null
    const socialMediaLinksStr = (formData.get("socialMediaLinks") as string) || ""
    const socialMediaLinks = socialMediaLinksStr ? socialMediaLinksStr.split(",").map((link) => link.trim()) : []

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !designation ||
      !companyName ||
      !companyLocation ||
      !companyIndustry ||
      !teamSize ||
      !documentType ||
      !documentNumber ||
      !reason ||
      !employeeId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if employee exists
    const employee = await db.collection("employees").findOne({
      _id: new ObjectId(employeeId),
    })

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 },
      )
    }

    // Upload document to Cloudinary if provided
    let documentUrl = null
    if (documentFile) {
      try {
        const arrayBuffer = await documentFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const uploadResult = await uploadToCloudinary(buffer, {
          folder: "employee-documents/kyc",
          resource_type: "auto",
        })

        documentUrl = uploadResult.url
      } catch (uploadError) {
        console.error("Error uploading document:", uploadError)
        return NextResponse.json(
          {
            success: false,
            message: "Failed to upload document",
          },
          { status: 500 },
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      firstName,
      lastName,
      email,
      phone,
      designation,
      companyName,
      companyLocation,
      companyIndustry,
      teamSize,
      status: "pending", // Reset status to pending
      updatedAt: new Date(),
      appealedAt: new Date(),
      appealReason: reason,
      kycDetails: {
        documentType,
        kycNumber: documentNumber,
      },
      rejected: false, // Remove rejected status
      companyWebsite,
      companyLinkedin,
      socialMediaLinks,
    }

    // Add optional fields if they exist
    if (middleName) updateData.middleName = middleName
    if (linkedinProfile) updateData.linkedinProfile = linkedinProfile

    // Add document URL if uploaded
    if (documentUrl) {
      updateData.documents = {
        ...employee.documents,
        kyc: {
          url: documentUrl,
          uploadedAt: new Date(),
        },
      }
    }

    // Update employee record - Fixed the update operation
    const result = await db.collection("employees").updateOne(
      { _id: new ObjectId(employeeId) },
      {
        $set: updateData,
        $unset: { rejectedAt: "", rejectionReason: "", rejectionComments: "" },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update employee record",
        },
        { status: 500 },
      )
    }

    // Create appeal record
    const appeal = await db.collection("appeals").insertOne({
      employeeId: new ObjectId(employeeId),
      userId: new ObjectId(userId),
      reason,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      documentUrl: documentUrl || employee.documents?.kyc?.url || null,
    })

    // Send email notification to admin
    try {
      await sendEmail({
        to: process.env.EMAIL_TO || "hi@oddiant.com", // Make sure this is the super admin email
        subject: `Employee Appeal Submitted: ${firstName} ${lastName}`,
        text: `
An employee has submitted an appeal:

Name: ${firstName} ${middleName || ""} ${lastName}
Email: ${email}
Company: ${companyName}
Appeal Reason: ${reason}

Please review their appeal by visiting:
${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/verify-employee/${employeeId}
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Employee Appeal Notification</h2>
            <p>An employee has submitted an appeal:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Name:</strong> ${firstName} ${middleName || ""} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Appeal Reason:</strong> ${reason}</p>
            </div>
            <p>Please review their appeal by clicking the button below:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/verify-employee/${employeeId}" 
                 style="background-color: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Review Appeal
              </a>
            </div>
            <p>Best regards,<br>Oddiant Techlabs System</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError)
      // Continue with the process even if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Appeal submitted successfully",
        appealId: appeal.insertedId,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("APPEAL_POST error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 },
    )
  }
}
