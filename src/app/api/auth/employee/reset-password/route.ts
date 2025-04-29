import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, resetToken, newPassword } = body

    if (!email || !resetToken || !newPassword) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee by email and reset token
    const employee = await db.collection("employees").findOne({
      email,
      resetToken,
      resetTokenExpiry: { $gt: new Date() }, // Token must not be expired
    })

    if (!employee) {
      return NextResponse.json({ success: false, message: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update employee with new password and remove reset token
    await db.collection("employees").updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        $unset: { resetToken: "", resetTokenExpiry: "" },
      },
    )

    return NextResponse.json({ success: true, message: "Password reset successful" }, { status: 200 })
  } catch (error) {
    console.error("Error in employee reset password:", error)
    return NextResponse.json(
      { success: false, message: "Failed to reset password. Please try again." },
      { status: 500 },
    )
  }
}
