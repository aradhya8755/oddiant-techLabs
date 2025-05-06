import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"
import ExcelJS from "exceljs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const candidateId = params.id
    if (!candidateId) {
      return NextResponse.json({ success: false, message: "Candidate ID is required" }, { status: 400 })
    }

    console.log(`Attempting to export candidate with ID: ${candidateId}`)

    // Connect to database
    const { db } = await connectToDatabase()

    // Find candidate
    let candidate
    try {
      candidate = await db.collection("candidates").findOne({
        _id: new ObjectId(candidateId),
      })
    } catch (error) {
      console.error("Error finding candidate:", error)
      return NextResponse.json({ success: false, message: "Invalid candidate ID format" }, { status: 400 })
    }

    if (!candidate) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    console.log(`Found candidate: ${candidate.name || candidate.firstName + " " + candidate.lastName}`)

    // Create a new workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Candidate Details")

    // Define columns with proper width
    worksheet.columns = [
      { header: "Field", key: "field", width: 25 },
      { header: "Value", key: "value", width: 70 },
    ]

    // Style the header row
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    }
    headerRow.commit()

    // Add personal information
    worksheet.addRow({ field: "Full Name", value: `${candidate.salutation || ""} ${candidate.firstName || ""} ${candidate.middleName || ""} ${candidate.lastName || ""}` })
    worksheet.addRow({ field: "Email", value: candidate.email || "" })
    worksheet.addRow({ field: "Phone", value: candidate.phone || "" })
    worksheet.addRow({ field: "Alternative Phone", value: candidate.alternativePhone || "" })
    worksheet.addRow({ field: "Current Position", value: candidate.currentPosition || candidate.role || "" })
    worksheet.addRow({
      field: "Location",
      value: `${candidate.location || candidate.currentCity || ""}, ${candidate.state || ""} pincode: ${candidate.pincode || ""} `,
    })
    worksheet.addRow({ field: "Gender", value: candidate.gender || "" })
    worksheet.addRow({
      field: "Date of Birth",
      value: candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toLocaleDateString() : "",
    })
    worksheet.addRow({field: "Profile Outline", value: candidate.profileOutline || "" })
    worksheet.addRow({
      field: "Total Experience",
      value: `${candidate.yearsOfExperience || candidate.totalExperience || "0/fresher"} years`,
    })

    // Add a separator row
    const separatorRow = worksheet.addRow({ field: "", value: "" })
    separatorRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF0F0F0" },
    }

    // Add skills
    worksheet.addRow({ field: "Skills", value: (candidate.skills || []).join(", ") })

    // Add another separator
    const separatorRow2 = worksheet.addRow({ field: "", value: "" })
    separatorRow2.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF0F0F0" },
    }

    // Add education
    worksheet.addRow({ field: "Education", value: "" })
    if (candidate.education) {
      const educationArray = Array.isArray(candidate.education) ? candidate.education : [candidate.education]
      educationArray.forEach((edu: any, index: number) => {
        if (typeof edu === "string") {
          worksheet.addRow({ field: `Education #${index + 1}`, value: edu })
        } else if (edu && typeof edu === "object") {
          worksheet.addRow({
            field: `Education #${index + 1}`,
            value: `${edu.degree || ""} from ${edu.institution || ""} (${edu.startYear || ""} - ${edu.endYear || "Present"})`,
          })
          if (edu.level) worksheet.addRow({ field: "Level", value: edu.level })
          if (edu.mode) worksheet.addRow({ field: "Mode", value: edu.mode })
          if (edu.percentage) worksheet.addRow({ field: "Percentage/CGPA", value: edu.percentage })
        }
      })
    }
    worksheet.addRow({field: "Certifications" , value: candidate.certifications || "No Certifications" })

    // Add another separator
    const separatorRow3 = worksheet.addRow({ field: "", value: "" })
    separatorRow3.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF0F0F0" },
    }

    // Add experience
    worksheet.addRow({ field: "Experience", value: "" })
    if (candidate.workExperience && Array.isArray(candidate.workExperience)) {
      candidate.workExperience.forEach((exp: any, index: number) => {
        worksheet.addRow({
          field: `Experience #${index + 1}`,
          value: `${exp.title || ""} at ${exp.companyName || ""} (${exp.tenure || ""})`,
        })
        if (exp.department) worksheet.addRow({ field: "Department", value: exp.department })
        if (exp.summary) worksheet.addRow({ field: "Description", value: exp.summary })
        if (exp.currentSalary) worksheet.addRow({ field: "Current Salary", value: exp.currentSalary })
        if (exp.expectedSalary) worksheet.addRow({ field: "Expected Salary", value: exp.expectedSalary })
        if (exp.noticePeriod) worksheet.addRow({ field: "Notice Period", value: `${exp.noticePeriod} days` })
      })
    } else if (candidate.experience) {
      if (typeof candidate.experience === "string") {
        worksheet.addRow({ field: "Experience", value: candidate.experience })
      } else if (Array.isArray(candidate.experience)) {
        candidate.experience.forEach((exp: any, index: number) => {
          if (typeof exp === "string") {
            worksheet.addRow({ field: `Experience #${index + 1}`, value: exp })
          } else if (exp && typeof exp === "object") {
            worksheet.addRow({
              field: `Experience #${index + 1}`,
              value: `${exp.title || ""} at ${exp.companyName || ""} (${exp.startDate || ""} - ${exp.endDate || exp.tenure || "Present"})`,
            })
            if (exp.department) worksheet.addRow({ field: "Department", value: exp.department })
            if (exp.summary || exp.description)
              worksheet.addRow({ field: "Description", value: exp.summary || exp.description || "" })
            if (exp.currentSalary) worksheet.addRow({ field: "Current Salary", value: exp.currentSalary })
            if (exp.expectedSalary) worksheet.addRow({ field: "Expected Salary", value: exp.expectedSalary })
            if (exp.noticePeriod) worksheet.addRow({ field: "Notice Period", value: `${exp.noticePeriod} days` })
          }
        })
      }
    }

    // Add another separator
    const separatorRow4 = worksheet.addRow({ field: "", value: "" })
    separatorRow4.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF0F0F0" },
    }

    // Add preferences
    worksheet.addRow({ field: "Shift Preference", value: (candidate.shiftPreference || []).join(", ") })
    worksheet.addRow({ field: "Preferred Cities", value: (candidate.preferredCities || []).join(", ") })

    // Add another separator
    const separatorRow5 = worksheet.addRow({ field: "", value: "" })
    separatorRow5.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF0F0F0" },
    }

    // Add assets and documents
    worksheet.addRow({
      field: "Available Assets",
      value: (candidate.availableAssets || []).map((asset: string) => asset.replace(/_/g, " ")).join(", "),
    })
    worksheet.addRow({
      field: "Identity Documents",
      value: (candidate.identityDocuments || []).map((doc: string) => doc.replace(/_/g, " ")).join(", "),
    })

    worksheet.addRow({field: "Portfolio Link", value: candidate.portfolioLink || "Not Provided"})
    worksheet.addRow({field: "Social Media Link", value: candidate.socialMediaLink || "Not Provided"})
    // Add URLs
    if (candidate.resumeUrl) worksheet.addRow({ field: "Resume URL", value: candidate.resumeUrl })
    if (candidate.videoResumeUrl) worksheet.addRow({ field: "Video Resume URL", value: candidate.videoResumeUrl })
    if (candidate.audioBiodataUrl) worksheet.addRow({ field: "Audio Biodata URL", value: candidate.audioBiodataUrl })
    if (candidate.photographUrl) worksheet.addRow({ field: "Photograph URL", value: candidate.photographUrl })

    // Add another separator
    const separatorRow6 = worksheet.addRow({ field: "", value: "" })
    separatorRow6.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF0F0F0" },
    }

    // Add additional information
    if (candidate.coverLetter) worksheet.addRow({ field: "Cover Letter", value: candidate.coverLetter })
    if (candidate.additionalInfo) worksheet.addRow({ field: "Additional Information", value: candidate.additionalInfo })
    if (candidate.profileOutline || candidate.summary)
      worksheet.addRow({ field: "Profile Summary", value: candidate.profileOutline || candidate.summary || "" })
    if (candidate.notes) worksheet.addRow({ field: "Notes", value: candidate.notes })

    console.log("Excel workbook created successfully, generating buffer...")

    try {
      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer()
      console.log("Excel buffer generated successfully, size:", buffer.byteLength)

      // Return the Excel file
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="candidate_${candidateId}.xlsx"`,
        },
      })
    } catch (error) {
      console.error("Error generating Excel buffer:", error)
      return NextResponse.json({ success: false, message: "Failed to generate Excel file" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error exporting candidate data:", error)
    return NextResponse.json({ success: false, message: "Failed to export candidate data" }, { status: 500 })
  }
}
