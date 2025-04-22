import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { comparePassword, generateToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee by email
    const employee = await db.collection("employees").findOne({ email })

    if (!employee) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Check if employee is verified
    if (!employee.verified) {
      return NextResponse.json(
        { success: false, message: "Please verify your email before logging in" },
        { status: 401 },
      )
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, employee.password)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken(employee._id.toString())

    // Set auth cookie
    setAuthCookie(token)

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: employee._id.toString(),
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
          userType: "employee",
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in employee login:", error)
    return NextResponse.json({ success: false, message: "Login failed. Please try again." }, { status: 500 })
  }
}
