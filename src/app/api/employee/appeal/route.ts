import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import { ObjectId } from "mongodb"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const employeeId = formData.get("employeeId") as string
    const documentType = formData.get("documentType") as string
    const documentNumber = formData.get("documentNumber") as string
    const appealReason = formData.get("appealReason") as string
    const document = formData.get("document") as File | null

    if (!employeeId || !documentType || !documentNumber) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee by ID
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(employeeId) })

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 })
    }

    // Upload document to Cloudinary if provided
    let documentUrl = null
    let documentPublicId = null
    let documentFilename = null

    if (document) {
      const buffer = Buffer.from(await document.arrayBuffer())
      const result = await uploadToCloudinary(buffer, document.name, "employees/documents")

      if (result) {
        documentUrl = result.secure_url
        documentPublicId = result.public_id
        documentFilename = document.name
      }
    }

    // Update employee record
    const updateData: any = {
      documentType,
      documentNumber,
      appealReason,
      appealed: true,
      appealedAt: new Date(),
      emailVerified: true,
      updatedAt: new Date(),
      rejected: false, // Remove rejected status
      rejectedAt: null,
    }

    // Add document info if uploaded
    if (documentUrl && documentPublicId) {
      updateData.documents = {
        ...employee.documents,
        kyc: {
          url: documentUrl,
          publicId: documentPublicId,
          filename: documentFilename,
          uploadedAt: new Date(),
        },
      }
    }

    await db.collection("employees").updateOne({ _id: new ObjectId(employeeId) }, { $set: updateData })

    // Send notification email to admin
    try {
      await sendEmail({
        subject: `Appeal Received: ${employee.firstName} ${employee.lastName}`,
        text: `An employee has appealed their rejection:
        
Name: ${employee.firstName} ${employee.middleName || ""} ${employee.lastName}
Email: ${employee.email}
Company: ${employee.companyName}

Appeal Reason: ${appealReason || "No reason provided"}

Please review and approve/reject this account by visiting:
${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/verify-employee/${employee._id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Appeal Received</h2>
            <p>An employee has appealed their rejection:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Name:</strong> ${employee.firstName} ${employee.middleName || ""} ${employee.lastName}</p>
              <p><strong>Email:</strong> ${employee.email}</p>
              <p><strong>Company:</strong> ${employee.companyName}</p>
              <p><strong>Appeal Reason:</strong> ${appealReason || "No reason provided"}</p>
            </div>
            <p>Please review and approve/reject this account by clicking the button below:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/verify-employee/${employee._id}" 
                 style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Review Appeal
              </a>
            </div>
            <p>Or copy and paste this URL into your browser:</p>
            <p>${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/verify-employee/${employee._id}</p>
            <p>Best regards,<br>Oddiant Techlabs System</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError)
      // Continue with the process even if email fails
    }

    return NextResponse.json({ success: true, message: "Appeal submitted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error submitting appeal:", error)
    return NextResponse.json({ success: false, message: "Failed to submit appeal" }, { status: 500 })
  }
}
