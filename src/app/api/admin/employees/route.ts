import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    const { db } = await connectToDatabase()

    // Get all employees
    const employees = await db.collection("employees").find({}).sort({ createdAt: -1 }).toArray()

    // Remove sensitive information
    const sanitizedEmployees = employees.map((employee) => {
      const { password, ...employeeData } = employee
      return employeeData
    })

    return NextResponse.json({ success: true, employees: sanitizedEmployees }, { status: 200 })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch employees" }, { status: 500 })
  }
}
