import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"

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

        const uploadResult = await uploadToCloudinary(
          buffer,
          `employee_kyc_${employeeId}_${Date.now()}`,
          documentFile.type,
        )

        documentUrl = uploadResult.secure_url
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
