import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { generateToken, setAuthCookie } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, userType = "student" } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Special case for admin login
    if (email === process.env.EMAIL_TO) {
      // Check if admin exists, if not create one
      let admin = await db.collection("admins").findOne({ email })

      if (!admin) {
        // Create admin account if it doesn't exist
        const hashedPassword = await bcrypt.hash("Hridesh123!", 10)
        const result = await db.collection("admins").insertOne({
          email,
          password: hashedPassword,
          role: "admin",
          name: "Admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        admin = await db.collection("admins").findOne({ _id: result.insertedId })
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password)

      if (!isPasswordValid) {
        return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
      }

      // Generate token
      const token = generateToken(admin._id.toString(), "admin")

      // Set auth cookie
      const response = NextResponse.json({ success: true, role: "admin" }, { status: 200 })
      setAuthCookie(token, response)

      return response
    }

    // Determine collection based on user type
    const collection = userType === "employee" ? "employees" : "students"

    // Find user by email
    const user = await db.collection(collection).findOne({ email })

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is verified
    if (userType === "employee" && !user.verified) {
      // If user has been rejected, provide specific message
      if (user.rejected) {
        return NextResponse.json(
          {
            success: false,
            message: "Your account has been rejected. Please check your email for details or appeal the decision.",
            rejected: true,
            employeeId: user._id.toString(),
          },
          { status: 403 },
        )
      }

      // If user has verified email but is pending approval
      if (user.emailVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "Your account is pending approval. You will receive an email once approved.",
            pendingApproval: true,
          },
          { status: 403 },
        )
      }

      // If user hasn't verified email
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email before logging in.",
          unverified: true,
          email: user.email,
        },
        { status: 403 },
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Generate token
    const token = generateToken(user._id.toString(), userType)

    // Set auth cookie
    const response = NextResponse.json({ success: true, role: userType }, { status: 200 })
    setAuthCookie(token, response)

    return response
  } catch (error) {
    console.error("Error in login:", error)
    return NextResponse.json({ success: false, message: "Login failed. Please try again." }, { status: 500 })
  }
}
