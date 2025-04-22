import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, resetToken, newPassword, userType } = body

    if (!email || !resetToken || !newPassword) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Determine collection based on user type
    const collection = userType === "employee" ? "employees" : "students"

    // Find user by email and reset token
    const user = await db.collection(collection).findOne({
      email,
      resetToken,
      resetTokenExpiry: { $gt: new Date() }, // Token must not be expired
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user with new password and remove reset token
    await db.collection(collection).updateOne(
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
    console.error("Error in reset password:", error)
    return NextResponse.json(
      { success: false, message: "Failed to reset password. Please try again." },
      { status: 500 },
    )
  }
}
