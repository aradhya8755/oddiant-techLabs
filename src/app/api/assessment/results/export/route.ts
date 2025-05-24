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
    const test = url.searchParams.get("test")
    const status = url.searchParams.get("status")
    const score = url.searchParams.get("score")
    const date = url.searchParams.get("date")

    // Build query
    const query: any = { createdBy: new ObjectId(userId) }

    if (test) {
      query.testId = new ObjectId(test)
    }

    if (status) {
      query.status = status
    }

    if (score) {
      // Parse score filter
      if (score === "> 90%") {
        query.score = { $gt: 90 }
      } else if (score === "80-90%") {
        query.score = { $gte: 80, $lte: 90 }
      } else if (score === "70-80%") {
        query.score = { $gte: 70, $lt: 80 }
      } else if (score === "< 70%") {
        query.score = { $lt: 70 }
      }
    }

    if (date) {
      // Parse date filter
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (date === "Today") {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        query.completionDate = { $gte: today, $lt: tomorrow }
      } else if (date === "This week") {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 7)
        query.completionDate = { $gte: startOfWeek, $lt: endOfWeek }
      } else if (date === "This month") {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        query.completionDate = { $gte: startOfMonth, $lte: endOfMonth }
      } else if (date === "Older") {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        query.completionDate = { $lt: startOfMonth }
      }
    }

    // Get results from database
    const results = await db.collection("assessment_results").find(query).sort({ completionDate: -1 }).toArray()

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Assessment Platform"
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet("Assessment Results")

    // Add headers
    worksheet.columns = [
      { header: "Candidate", key: "candidateName", width: 25 },
      { header: "Email", key: "candidateEmail", width: 30 },
      { header: "Test", key: "testName", width: 25 },
      { header: "Score", key: "score", width: 10 },
      { header: "Status", key: "status", width: 10 },
      { header: "Duration (min)", key: "duration", width: 15 },
      { header: "Completion Date", key: "completionDate", width: 20 },
      { header: "Results Declared", key: "resultsDeclared", width: 15 },
      { header: "Tab Switches", key: "tabSwitchCount", width: 12 },
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
    results.forEach((result) => {
      worksheet.addRow({
        candidateName: result.candidateName || "N/A",
        candidateEmail: result.candidateEmail || "N/A",
        testName: result.testName || "N/A",
        score: `${result.score}%`,
        status: result.status || "N/A",
        duration: result.duration || "N/A",
        completionDate: result.completionDate ? new Date(result.completionDate).toLocaleDateString() : "N/A",
        resultsDeclared: result.resultsDeclared ? "Yes" : "No",
        tabSwitchCount: result.tabSwitchCount || 0,
      })
    })

    // Apply some styling to all cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle" }

          // Color the status cell based on value
          if (cell.col === 5) {
            // Status column
            if (cell.value === "Passed") {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFE6F4EA" }, // Light green
              }
            } else if (cell.value === "Failed") {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFCE8E6" }, // Light red
              }
            }
          }
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
        "Content-Disposition": `attachment; filename="assessment-results-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error exporting results:", error)
    return NextResponse.json({ success: false, message: "Failed to export results" }, { status: 500 })
  }
}
