import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import * as XLSX from "xlsx"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body to get candidate IDs to export
    const body = await request.json()
    const { candidateIds } = body

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json({ success: false, message: "At least one candidate ID is required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Convert string IDs to ObjectIds and prepare query
    const objectIds = candidateIds
      .map((id) => {
        try {
          return { _id: new ObjectId(id) }
        } catch (error) {
          console.warn(`Invalid ObjectId format: ${id}`)
          return null
        }
      })
      .filter(Boolean)

    if (objectIds.length === 0) {
      return NextResponse.json({ success: false, message: "No valid candidate IDs provided" }, { status: 400 })
    }

    // Find candidates
    const candidates = await db.collection("candidates").find({ $or: objectIds }).toArray()

    if (candidates.length === 0) {
      return NextResponse.json({ success: false, message: "No candidates found" }, { status: 404 })
    }

    // Prepare data for Excel export
    const candidatesData = candidates.map((candidate) => ({
      "First Name": candidate.firstName || "",
      "Last Name": candidate.lastName || "",
      Email: candidate.email || "",
      Phone: candidate.phone || "",
      "Current Position": candidate.role || candidate.currentPosition || "",
      Location: candidate.location || "",
      State: candidate.state || "",
      Gender: candidate.gender || "",
      "Years of Experience": candidate.yearsOfExperience || 0,
      "Current Salary": candidate.currentSalary || "",
      Skills: Array.isArray(candidate.skills) ? candidate.skills.join(", ") : "",
      Status: candidate.status || "",
      "Applied Date": candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : "",
    }))

    // Create workbook
    const wb = XLSX.utils.book_new()

    // Add candidates sheet
    const ws = XLSX.utils.json_to_sheet(candidatesData)
    XLSX.utils.book_append_sheet(wb, ws, "Candidates")

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" })

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="candidates_export_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error exporting candidates data:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to export candidates data",
      },
      { status: 500 },
    )
  }
}
