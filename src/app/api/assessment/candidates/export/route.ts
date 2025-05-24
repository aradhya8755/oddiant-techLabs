import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"
import ExcelJS from "exceljs"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Get query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const score = url.searchParams.get("score")
    const search = url.searchParams.get("search")

    // First, get all invitations to find candidates
    const invitations = await db
      .collection("assessment_invitations")
      .find({
        createdBy: new ObjectId(userId),
      })
      .toArray()

    // Create a map of email to candidate data
    const candidateMap = new Map()

    // Process invitations to build candidate data
    for (const invitation of invitations) {
      const email = invitation.email

      if (!candidateMap.has(email)) {
        // Initialize candidate data
        candidateMap.set(email, {
          email,
          name: email.split("@")[0], // Simple name extraction
          testsAssigned: 0,
          testsCompleted: 0,
          totalScore: 0,
          averageScore: 0,
          status: "Invited",
          createdAt: invitation.createdAt,
        })
      }

      const candidateData = candidateMap.get(email)
      candidateData.testsAssigned++

      if (invitation.status === "Completed") {
        candidateData.testsCompleted++
      }
    }

    // Get all results to calculate scores and status
    const results = await db
      .collection("assessment_results")
      .find({
        createdBy: new ObjectId(userId),
      })
      .toArray()

    // Update candidate data with results
    for (const result of results) {
      const email = result.candidateEmail
      if (candidateMap.has(email)) {
        const candidateData = candidateMap.get(email)
        candidateData.totalScore += result.score
        candidateData.averageScore = Math.round(candidateData.totalScore / candidateData.testsCompleted)

        // Update status based on most recent completion
        if (result.resultsDeclared) {
          if (result.status === "Passed") {
            candidateData.status = "Passed"
          } else {
            candidateData.status = "Failed"
          }
        } else {
          candidateData.status = "Completed"
        }
      }
    }

    // Convert map to array
    let candidates = Array.from(candidateMap.values())

    // Apply filters
    if (status) {
      candidates = candidates.filter((candidate) => candidate.status === status)
    }

    if (score) {
      candidates = candidates.filter((candidate) => {
        const avgScore = candidate.averageScore
        if (score === "> 90%" && avgScore > 90) return true
        if (score === "80-90%" && avgScore >= 80 && avgScore <= 90) return true
        if (score === "70-80%" && avgScore >= 70 && avgScore < 80) return true
        if (score === "< 70%" && avgScore < 70) return true
        return false
      })
    }

    if (search) {
      const searchLower = search.toLowerCase()
      candidates = candidates.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchLower) || candidate.email.toLowerCase().includes(searchLower),
      )
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Assessment Platform"
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet("Candidates")

    // Add headers
    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Tests Assigned", key: "testsAssigned", width: 15 },
      { header: "Tests Completed", key: "testsCompleted", width: 15 },
      { header: "Average Score", key: "averageScore", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Created Date", key: "createdAt", width: 20 },
    ]

    // Style the header row
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    }
    headerRow.alignment = { vertical: "middle", horizontal: "center" }
    headerRow.commit()

    // Add data
    candidates.forEach((candidate) => {
      worksheet.addRow({
        name: candidate.name || "N/A",
        email: candidate.email || "N/A",
        testsAssigned: candidate.testsAssigned || 0,
        testsCompleted: candidate.testsCompleted || 0,
        averageScore: candidate.averageScore ? `${candidate.averageScore}%` : "N/A",
        status: candidate.status || "N/A",
        createdAt: candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : "N/A",
      })
    })

    // Apply some styling to all cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle" }
        })
      }
    })

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Return Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="candidates-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error exporting candidates:", error)
    return NextResponse.json({ success: false, message: "Failed to export candidates" }, { status: 500 })
  }
}
