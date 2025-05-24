import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get form data with the file
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 })
    }

    // Check file type
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json(
        { success: false, message: "Invalid file format. Please upload an Excel file (.xlsx or .xls)" },
        { status: 400 },
      )
    }

    // Read the file
    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)

    // Parse Excel file
    const workbook = XLSX.read(data, { type: "array" })

    // Assume the first sheet contains emails
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    // Extract emails from the data
    const extractedEmails: string[] = []
    const invalidEmails: string[] = []

    jsonData.forEach((row: any) => {
      // Look for email in any field of the row
      Object.values(row).forEach((value) => {
        if (typeof value === "string") {
          const email = value.trim()
          if (isValidEmail(email)) {
            extractedEmails.push(email)
          } else if (email.includes("@")) {
            // If it has @ but isn't valid, it might be an attempted email
            invalidEmails.push(email)
          }
        }
      })
    })

    if (extractedEmails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid email addresses found in the file",
          invalidEmails: invalidEmails.length > 0 ? invalidEmails : undefined,
        },
        { status: 400 },
      )
    }

    // Return unique emails
    const uniqueEmails = [...new Set(extractedEmails)]

    return NextResponse.json(
      {
        success: true,
        emails: uniqueEmails,
        count: uniqueEmails.length,
        invalidEmails: invalidEmails.length > 0 ? invalidEmails : undefined,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error processing Excel file:", error)
    return NextResponse.json({ success: false, message: "Failed to process the Excel file" }, { status: 500 })
  }
}

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}
