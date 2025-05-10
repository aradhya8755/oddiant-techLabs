import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find student by ID
    const student = await db.collection("students").findOne({ _id: new ObjectId(userId) })

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    // Ensure certifications are properly structured
    // If certifications exist but aren't in the expected format, transform them
    if (student.certifications) {
      // Check if certifications is an array of strings (old format) and convert to proper format
      if (Array.isArray(student.certifications) && student.certifications.length > 0 && typeof student.certifications[0] === 'string') {
        student.certifications = student.certifications.map((cert: string) => ({
          name: cert,
          issuingOrganization: "Not specified",
          issueDate: new Date().toISOString(),
        }));
      }
      
      // Ensure each certification has all required fields
      student.certifications = student.certifications.map((cert: any) => ({
        name: cert.name || "Not specified",
        issuingOrganization: cert.issuingOrganization || "Not specified",
        issueDate: cert.issueDate || new Date().toISOString(),
        expiryDate: cert.expiryDate || null,
        credentialId: cert.credentialId || null,
        credentialUrl: cert.credentialUrl || null,
      }));
    } else {
      // Initialize empty certifications array if it doesn't exist
      student.certifications = [];
    }

    // Log student data for debugging
    console.log("Student data from API:", {
      certifications: student.certifications,
      preferredCities: student.preferredCities,
    })

    // Remove sensitive information
    const { password, resetToken, resetTokenExpiry, otp, otpExpiry, ...studentData } = student

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, student: studentData },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching student profile:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch student profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const data = await request.json()

    // Connect to database
    const { db } = await connectToDatabase()

    // Find student by ID to verify
    const student = await db.collection("students").findOne({ _id: new ObjectId(userId) })

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    // Process certifications data if provided
    if (data.certifications) {
      // Ensure certifications are in the correct format
      if (Array.isArray(data.certifications)) {
        // If certifications are strings, convert them to objects
        if (data.certifications.length > 0 && typeof data.certifications[0] === 'string') {
          data.certifications = data.certifications.map((cert: string) => ({
            name: cert,
            issuingOrganization: "Not specified",
            issueDate: new Date().toISOString(),
          }));
        }
        
        // Ensure each certification has all required fields
        data.certifications = data.certifications.map((cert: any) => ({
          name: cert.name || "Not specified",
          issuingOrganization: cert.issuingOrganization || "Not specified",
          issueDate: cert.issueDate || new Date().toISOString(),
          expiryDate: cert.expiryDate || null,
          credentialId: cert.credentialId || null,
          credentialUrl: cert.credentialUrl || null,
        }));
      }
    }

    // Update student profile
    const updateData = {
      ...data,
      profileCompleted: true,
      updatedAt: new Date(),
    }

    // Don't allow updating sensitive fields
    delete updateData.password
    delete updateData.email // Email should be updated through a separate endpoint with verification
    delete updateData._id

    // Update the student document
    const result = await db.collection("students").updateOne({ _id: new ObjectId(userId) }, { $set: updateData })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
    }

    // Get updated student data
    const updatedStudent = await db.collection("students").findOne({ _id: new ObjectId(userId) })

    // Ensure certifications are properly structured in the response
    if (updatedStudent.certifications) {
      // Check if certifications is an array of strings (old format) and convert to proper format
      if (Array.isArray(updatedStudent.certifications) && updatedStudent.certifications.length > 0 && typeof updatedStudent.certifications[0] === 'string') {
        updatedStudent.certifications = updatedStudent.certifications.map((cert: string) => ({
          name: cert,
          issuingOrganization: "Not specified",
          issueDate: new Date().toISOString(),
        }));
      }
      
      // Ensure each certification has all required fields
      updatedStudent.certifications = updatedStudent.certifications.map((cert: any) => ({
        name: cert.name || "Not specified",
        issuingOrganization: cert.issuingOrganization || "Not specified",
        issueDate: cert.issueDate || new Date().toISOString(),
        expiryDate: cert.expiryDate || null,
        credentialId: cert.credentialId || null,
        credentialUrl: cert.credentialUrl || null,
      }));
    } else {
      // Initialize empty certifications array if it doesn't exist
      updatedStudent.certifications = [];
    }

    // Remove sensitive information
    const { password: pwd, resetToken, resetTokenExpiry, otp, otpExpiry, ...updatedStudentData } = updatedStudent

    return NextResponse.json(
      { success: true, message: "Profile updated successfully", student: updatedStudentData },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating student profile:", error)
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
  }
}