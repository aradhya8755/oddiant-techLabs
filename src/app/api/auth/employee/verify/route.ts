import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { generateToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP are required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee by email
    const employee = await db.collection("employees").findOne({ email })

    if (!employee) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Check if employee is already verified
    if (employee.verified) {
      return NextResponse.json({ success: false, message: "Email already verified" }, { status: 400 })
    }

    // Check if OTP is valid
    if (employee.otp !== otp) {
      return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 })
    }

    // Check if OTP is expired
    if (new Date() > new Date(employee.otpExpiry)) {
      return NextResponse.json({ success: false, message: "OTP expired" }, { status: 400 })
    }

    // Update employee as verified
    await db.collection("employees").updateOne(
      { email },
      {
        $set: {
          verified: true,
          updatedAt: new Date(),
        },
        $unset: { otp: "", otpExpiry: "" },
      },
    )

    // Generate JWT token
    const token = generateToken(employee._id.toString())

    // Set auth cookie
    setAuthCookie(token)

    return NextResponse.json({ success: true, message: "Email verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error in email verification:", error)
    return NextResponse.json({ success: false, message: "Verification failed. Please try again." }, { status: 500 })
  }
}
