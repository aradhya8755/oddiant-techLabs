import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest, getUserTypeFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get user ID and type from request
    const userId = await getUserFromRequest(request)
    const userType = await getUserTypeFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Verify user is admin
    if (userType !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Get all employees
    const employees = await db.collection("employees").find({}).sort({ createdAt: -1 }).toArray()

    // Remove sensitive information
    const sanitizedEmployees = employees.map((employee) => {
      const { password, ...employeeData } = employee
      return employeeData
    })

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, employees: sanitizedEmployees },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch employees" }, { status: 500 })
  }
}
