import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"
import ExcelJS from "exceljs"
import { Certificate } from "crypto"

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get candidate IDs from request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })
    }

    const { candidateIds } = body

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json({ success: false, message: "No candidates selected" }, { status: 400 })
    }

    console.log(`Attempting to export ${candidateIds.length} candidates`)

    // Connect to database
    const { db } = await connectToDatabase()

    // Convert string IDs to ObjectIds
    const objectIds = []
    for (const id of candidateIds) {
      try {
        objectIds.push(new ObjectId(id))
      } catch (error) {
        console.error(`Invalid ID format: ${id}`)
        // Continue with valid IDs
      }
    }

    if (objectIds.length === 0) {
      return NextResponse.json({ success: false, message: "No valid candidate IDs provided" }, { status: 400 })
    }

    console.log(`Found ${objectIds.length} valid candidate IDs`)

    // Find candidates
    const candidates = await db
      .collection("candidates")
      .find({
        _id: { $in: objectIds },
      })
      .toArray()

    if (candidates.length === 0) {
      return NextResponse.json({ success: false, message: "No candidates found" }, { status: 404 })
    }

    console.log(`Retrieved ${candidates.length} candidates from database`)

    // Create a new workbook
    const workbook = new ExcelJS.Workbook()

    // Add metadata
    workbook.creator = "ATS System"
    workbook.lastModifiedBy = "ATS System"
    workbook.created = new Date()
    workbook.modified = new Date()

    // Add a single sheet for all candidates
    const candidatesSheet = workbook.addWorksheet("All Candidates")

    // Define columns for the sheet
    candidatesSheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Alternative Phone", key: "alternativePhone", width: 20 },
      { header: "Position", key: "role", width: 25 },
      { header: "Status", key: "status", width: 15 },
      { header: "Location", key: "location", width: 25 },
      { header: "Current City", key: "currentCity", width: 20 },
      { header: "Current State", key: "currentState", width: 20 },
      { header: "Pincode", key: "pincode", width: 20 },
      { header: "Gender", key: "gender", width: 15 },
      { header: "Profile Outline", key: "profileOutline", width: 50 },
      { header: "Certifications", key: "certifications", width: 50 },
      { header: "Date of Birth", key: "dateOfBirth", width: 15 },
      { header: "Experience (Years)", key: "experience", width: 15 },
      { header: "Current Salary", key: "currentSalary", width: 15 },
      { header: "Expected Salary", key: "expectedSalary", width: 15 },
      { header: "Notice Period (Days)", key: "noticePeriod", width: 20 },
      { header: "Skills", key: "skills", width: 40 },
      { header: "Education", key: "education", width: 40 },
      { header: "Work Experience", key: "workExperience", width: 50 },
      { header: "Shift Preference", key: "shiftPreference", width: 25 },
      { header: "Preferred Cities", key: "preferredCities", width: 25 },
      { header: "Available Assets", key: "availableAssets", width: 25 },
      { header: "Identity Documents", key: "identityDocuments", width: 25 },
      { header: "Resume URL", key: "resumeUrl", width: 50 },
      { header: "Video Resume URL", key: "videoResumeUrl", width: 50 },
      { header: "Audio Biodata URL", key: "audioBiodataUrl", width: 50 },
      { header: "Photograph URL", key: "photographUrl", width: 50 },
      { header: "Cover Letter", key: "coverLetter", width: 40 },
      { header: "Portfolio Link", key: "portfolioLink", width: 20 },
      { header: "Social Media Link", key: "socialMediaLink", width: 20 },
      { header: "Profile Summary", key: "profileSummary", width: 40 },
      { header: "Additional Info", key: "additionalInfo", width: 40 },
      { header: "Applied Date", key: "appliedDate", width: 15 },
    ]

    // Style the header row
    const headerRow = candidatesSheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    }
    headerRow.alignment = { vertical: "middle", horizontal: "center" }
    headerRow.commit()

    // Add data for each candidate
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i]

      try {
        // Format education information
        let educationSummary = ""
        if (candidate.education) {
          if (Array.isArray(candidate.education)) {
            educationSummary = candidate.education
              .map((edu, index) => {
                if (typeof edu === "string") return `${index + 1}. ${edu}`
                if (edu && typeof edu === "object") {
                  let eduStr = `${index + 1}. ${edu.degree || ""} from ${edu.institution || ""}`
                  if (edu.startYear || edu.endYear) {
                    eduStr += ` (${edu.startYear || ""} - ${edu.endYear || "Present"})`
                  }
                  if (edu.level) eduStr += `, Level: ${edu.level}`
                  if (edu.mode) eduStr += `, Mode: ${edu.mode}`
                  if (edu.percentage) eduStr += `, CGPA/Percentage: ${edu.percentage}`
                  return eduStr
                }
                return ""
              })
              .filter(Boolean)
              .join("\n")
          } else if (typeof candidate.education === "string") {
            educationSummary = candidate.education
          } else if (candidate.education && typeof candidate.education === "object") {
            const edu = candidate.education
            educationSummary = `${edu.degree || ""} from ${edu.institution || ""}`
            if (edu.startYear || edu.endYear) {
              educationSummary += ` (${edu.startYear || ""} - ${edu.endYear || "Present"})`
            }
          }
        }

        // Format experience information
        let experienceSummary = ""
        if (candidate.workExperience && Array.isArray(candidate.workExperience)) {
          experienceSummary = candidate.workExperience
            .map((exp, index) => {
              let expStr = `${index + 1}. ${exp.title || ""} at ${exp.companyName || ""}`
              if (exp.tenure) expStr += ` (${exp.tenure})`
              if (exp.department) expStr += `, Dept: ${exp.department}`
              if (exp.summary) expStr += `, Summary: ${exp.summary}`
              return expStr
            })
            .join("\n")
        } else if (candidate.experience) {
          if (typeof candidate.experience === "string") {
            experienceSummary = candidate.experience
          } else if (Array.isArray(candidate.experience)) {
            experienceSummary = candidate.experience
              .map((exp, index) => {
                if (typeof exp === "string") return `${index + 1}. ${exp}`
                if (exp && typeof exp === "object") {
                  let expStr = `${index + 1}. ${exp.title || ""} at ${exp.companyName || ""}`
                  if (exp.startDate || exp.endDate || exp.tenure) {
                    expStr += ` (${exp.startDate || ""} - ${exp.endDate || exp.tenure || "Present"})`
                  }
                  if (exp.department) expStr += `, Dept: ${exp.department}`
                  if (exp.description || exp.summary) expStr += `, Desc: ${exp.description || exp.summary || ""}`
                  return expStr
                }
                return ""
              })
              .filter(Boolean)
              .join("\n")
          }
        }

        // Get current and expected salary from either top-level or from the most recent experience
        let currentSalary = candidate.currentSalary || ""
        let expectedSalary = candidate.expectedSalary || ""
        let noticePeriod = candidate.noticePeriod || ""

        if (!currentSalary && candidate.workExperience && candidate.workExperience.length > 0) {
          currentSalary = candidate.workExperience[0].currentSalary || ""
        }
        if (!expectedSalary && candidate.workExperience && candidate.workExperience.length > 0) {
          expectedSalary = candidate.workExperience[0].expectedSalary || ""
        }
        if (!noticePeriod && candidate.workExperience && candidate.workExperience.length > 0) {
          noticePeriod = candidate.workExperience[0].noticePeriod || ""
        }

        // Add row with all available information - FIX: Include middleName in the name field
        const rowData = {
          name: `${candidate.salutation || ""} ${candidate.firstName || ""} ${candidate.middleName || ""} ${candidate.lastName || candidate.name || ""}`
            .trim()
            .replace(/\s+/g, " "),
          email: candidate.email || "",
          phone: candidate.phone || "",
          alternativePhone: candidate.alternativePhone || "",
          role: candidate.role || candidate.currentPosition || "",
          status: candidate.status || "",
          location: candidate.location || "",
          currentCity: candidate.currentCity || "",
          currentState: candidate.currentState || "",
          pincode: candidate.pincode || "",
          gender: candidate.gender || "",
          profileOutline: candidate.profileOutline || "",
          certifications: candidate.certifications || "No Certifications",
          dateOfBirth: candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toLocaleDateString() : "",
          experience: `${candidate.yearsOfExperience || candidate.totalExperience || "0"}`,
          currentSalary: currentSalary,
          expectedSalary: expectedSalary,
          noticePeriod: noticePeriod,
          skills: (candidate.skills || []).join(", "),
          education: educationSummary,
          workExperience: experienceSummary,
          shiftPreference: (candidate.shiftPreference || []).join(", "),
          preferredCities: (candidate.preferredCities || []).join(", "),
          availableAssets: (candidate.availableAssets || []).map((asset) => asset.replace(/_/g, " ")).join(", "),
          identityDocuments: (candidate.identityDocuments || []).map((doc) => doc.replace(/_/g, " ")).join(", "),
          resumeUrl: candidate.resumeUrl || "",
          videoResumeUrl: candidate.videoResumeUrl || "",
          audioBiodataUrl: candidate.audioBiodataUrl || "",
          photographUrl: candidate.photographUrl || "",
          coverLetter: candidate.coverLetter || "",
          portfolioLink: candidate.portfolioLink || "",
          socialMediaLink: candidate.socialMediaLink || "",
          profileSummary: candidate.profileOutline || candidate.summary || "",
          additionalInfo: candidate.additionalInfo || "",
          appliedDate: candidate.appliedDate
            ? new Date(candidate.appliedDate).toLocaleDateString()
            : candidate.createdAt
              ? new Date(candidate.createdAt).toLocaleDateString()
              : "",
        }

        // Add the row to the sheet
        const row = candidatesSheet.addRow(rowData)

        // Set wrap text for long content cells
        row.getCell("education").alignment = { wrapText: true, vertical: "top" }
        row.getCell("workExperience").alignment = { wrapText: true, vertical: "top" }
        row.getCell("skills").alignment = { wrapText: true, vertical: "top" }
        row.getCell("profileSummary").alignment = { wrapText: true, vertical: "top" }
        row.getCell("coverLetter").alignment = { wrapText: true, vertical: "top" }

        // Set row height to accommodate content
        row.height = 100

        console.log(`Added candidate ${i + 1}/${candidates.length} to sheet: ${rowData.name}`)
      } catch (error) {
        console.error(`Error adding candidate ${candidate._id} to sheet:`, error)
        // Continue with other candidates
      }
    }

    // Auto-fit columns based on content
    candidatesSheet.columns.forEach((column) => {
      if (!column.key) return

      const maxLength = [
        column.header ? column.header.toString().length : 0,
        ...candidatesSheet
          .getColumn(column.key)
          .values.filter((value) => value !== undefined && value !== null)
          .map((value) => {
            const strValue = value.toString() || ""
            // For multiline text, get the longest line
            if (strValue.includes("\n")) {
              return Math.max(...strValue.split("\n").map((line) => line.length))
            }
            return strValue.length
          }),
      ].reduce((max, length) => Math.max(max, length), 0)

      column.width = Math.min(maxLength + 2, 100) // Cap width at 100 characters
    })

    // Add a debug sheet to verify data is being processed
    const debugSheet = workbook.addWorksheet("Debug Info")
    debugSheet.columns = [
      { header: "Info", key: "info", width: 30 },
      { header: "Value", key: "value", width: 70 },
    ]

    // Add debug info
    debugSheet.addRow({ info: "Total Candidates", value: candidates.length })
    debugSheet.addRow({ info: "Export Time", value: new Date().toISOString() })
    debugSheet.addRow({ info: "Candidate IDs", value: candidateIds.join(", ") })

    // Add sample of first candidate data if available
    if (candidates.length > 0) {
      const sampleCandidate = candidates[0]
      debugSheet.addRow({ info: "Sample Candidate ID", value: sampleCandidate._id.toString() })
      debugSheet.addRow({
        info: "Sample Candidate Name",
        value:
          `${sampleCandidate.firstName || ""} ${sampleCandidate.middleName || ""} ${sampleCandidate.lastName || sampleCandidate.name || ""}`
            .trim()
            .replace(/\s+/g, " "),
      })
      debugSheet.addRow({ info: "Sample Candidate Email", value: sampleCandidate.email || "" })
    }

    console.log("Excel workbook created successfully, generating buffer...")

    try {
      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer()
      console.log("Excel buffer generated successfully, size:", buffer.byteLength)

      // Return the Excel file
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="candidates_export_${new Date().toISOString().split("T")[0]}.xlsx"`,
        },
      })
    } catch (error) {
      console.error("Error generating Excel buffer:", error)
      return NextResponse.json({ success: false, message: "Failed to generate Excel file" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error exporting candidates data:", error)
    return NextResponse.json({ success: false, message: "Failed to export candidates data" }, { status: 500 })
  }
}
