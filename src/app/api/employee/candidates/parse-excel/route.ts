import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { authMiddleware } from "@/lib/auth"

export async function POST(req: NextRequest) {
  // Check authentication
  const authResponse = await authMiddleware(req)
  if (authResponse) return authResponse

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read the file buffer
    const buffer = await file.arrayBuffer()

    // Parse the Excel file
    const workbook = XLSX.read(buffer, { type: "array" })

    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 })

    // Extract emails from the first column
    const emails: string[] = []

    data.forEach((row) => {
      if (Array.isArray(row) && row.length > 0) {
        const potentialEmail = String(row[0]).trim()

        // Basic email validation
        if (potentialEmail && potentialEmail.includes("@") && potentialEmail.includes(".")) {
          emails.push(potentialEmail)
        }
      }
    })

    return NextResponse.json({ emails })
  } catch (error) {
    console.error("Error parsing Excel file:", error)
    return NextResponse.json({ error: "Failed to parse Excel file" }, { status: 500 })
  }
}
