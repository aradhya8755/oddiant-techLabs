import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params object before accessing its properties
    const { id: employeeId } = await params

    if (!employeeId) {
      return NextResponse.json({ success: false, message: "Employee ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const employee = await db.collection("employees").findOne({ _id: new ObjectId(employeeId) })

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 })
    }

    const { password, ...employeeData } = employee

    return NextResponse.json({ success: true, employee: employeeData }, { status: 200 })
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch employee" }, { status: 500 })
  }
}