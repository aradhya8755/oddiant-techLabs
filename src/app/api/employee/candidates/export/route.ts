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

    // Prepare data for Excel export with all the detailed fields
    const candidatesData = candidates.map((candidate) => {
      // Extract salary and notice period data directly from work experience if available
      let currentSalary = "";
      let expectedSalary = "";
      let noticePeriod = "";
      
      // Try to get salary and notice period from multiple possible locations in the data
      if (candidate.currentSalary) {
        currentSalary = candidate.currentSalary;
      } else if (candidate.workExperience && candidate.workExperience.length > 0 && candidate.workExperience[0].currentSalary) {
        currentSalary = candidate.workExperience[0].currentSalary;
      }
      
      if (candidate.expectedSalary) {
        expectedSalary = candidate.expectedSalary;
      } else if (candidate.workExperience && candidate.workExperience.length > 0 && candidate.workExperience[0].expectedSalary) {
        expectedSalary = candidate.workExperience[0].expectedSalary;
      }
      
      if (candidate.noticePeriod) {
        noticePeriod = typeof candidate.noticePeriod === 'number' ? 
          `${candidate.noticePeriod} days` : candidate.noticePeriod;
      } else if (candidate.workExperience && candidate.workExperience.length > 0 && candidate.workExperience[0].noticePeriod) {
        noticePeriod = typeof candidate.workExperience[0].noticePeriod === 'number' ? 
          `${candidate.workExperience[0].noticePeriod} days` : candidate.workExperience[0].noticePeriod;
      }
      
      // Format certifications properly
      let certifications = "";
      if (candidate.certifications) {
        if (Array.isArray(candidate.certifications)) {
          certifications = candidate.certifications
            .map((cert, index) => {
              if (typeof cert === 'string') {
                return `${index + 1}. ${cert}`;
              } else if (typeof cert === 'object' && cert !== null) {
                const name = cert.name || cert.title || '';
                const issuer = cert.issuer || cert.organization || '';
                const date = cert.date || cert.issueDate || cert.year || '';
                return `${index + 1}. ${name}${issuer ? ` from ${issuer}` : ''}${date ? ` (${date})` : ''}`;
              }
              return '';
            })
            .filter(Boolean)
            .join("\n");
        } else if (typeof candidate.certifications === 'string') {
          certifications = candidate.certifications;
        } else if (typeof candidate.certifications === 'object' && candidate.certifications !== null) {
          certifications = Object.entries(candidate.certifications)
            .map(([key, value], index) => `${index + 1}. ${key}: ${value}`)
            .join("\n");
        }
      }
      
      if (!certifications) {
        certifications = "No Certifications";
      }

      return {
        // Personal Information
        "Full Name":
          `${candidate.salutation || ""} ${candidate.firstName || ""} ${candidate.middleName || ""} ${candidate.lastName || ""}`.trim(),
        Email: candidate.email || "",
        Phone: candidate.phone || "",
        "Alternative Phone": candidate.alternativePhone || "",
        "Current Position": candidate.currentPosition || candidate.role || "",
        Location: candidate.location || candidate.currentCity || "",
        // State: candidate.state || "",
        Pincode: candidate.pincode || "",
        "Full Address":
          `${candidate.location || candidate.currentCity || ""}, ${candidate.state || ""} ${candidate.pincode ? `pincode: ${candidate.pincode}` : ""}`.trim(),
        Gender: candidate.gender || "",
        "Date of Birth": candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toLocaleDateString() : "",
        "Profile Outline": candidate.profileOutline || candidate.summary || "",
        "Total Experience": `${candidate.yearsOfExperience || candidate.totalExperience || "0/fresher"} years`,

        // Skills
        Skills: Array.isArray(candidate.skills) ? candidate.skills.join(", ") : "",

        // Education
        Education: formatEducation(candidate.education),
        Certifications: certifications,

        // Experience
        Experience: formatExperience(candidate.workExperience || candidate.experience),
        "Current Salary": currentSalary,
        "Expected Salary": expectedSalary,
        "Notice Period": noticePeriod,

        // Preferences
        "Shift Preference": Array.isArray(candidate.shiftPreference)
          ? candidate.shiftPreference.join(", ")
          : candidate.shiftPreference || "",
        "Preferred Cities": Array.isArray(candidate.preferredCities)
          ? candidate.preferredCities.join(", ")
          : candidate.preferredCities || "",

        // Assets and Documents
        "Available Assets": Array.isArray(candidate.availableAssets)
          ? candidate.availableAssets.map((asset: string) => asset.replace(/_/g, " ")).join(", ")
          : "",
        "Identity Documents": Array.isArray(candidate.identityDocuments)
          ? candidate.identityDocuments.map((doc: string) => doc.replace(/_/g, " ")).join(", ")
          : "",

        // URLs and Links
        "Portfolio Link": candidate.portfolioLink || "",
        "Social Media Link": candidate.socialMediaLink || "",
        "Resume URL": candidate.resumeUrl || "",
        "Video Resume URL": candidate.videoResumeUrl || "",
        "Audio Biodata URL": candidate.audioBiodataUrl || "",
        "Photograph URL": candidate.photographUrl || "",

        // Additional Information
        "Cover Letter": candidate.coverLetter || "",
        "Additional Information": candidate.additionalInfo || "",
        Notes: candidate.notes || "",

        // Status Information
        Status: candidate.status || "",
        "Applied Date": candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : "",
        "Last Updated": candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleDateString() : "",
      };
    });

    // Create workbook
    const wb = XLSX.utils.book_new()

    // Add candidates sheet
    const ws = XLSX.utils.json_to_sheet(candidatesData)

    // Set column widths (approximate as XLSX doesn't directly support column width)
    const colWidths = [
      { wch: 20 }, // Salutation
      { wch: 20 }, // First Name
      { wch: 20 }, // Middle Name
      { wch: 20 }, // Last Name
      { wch: 30 }, // Full Name
      { wch: 30 }, // Email
      { wch: 20 }, // Phone
      { wch: 20 }, // Alternative Phone
      { wch: 30 }, // Current Position
      { wch: 25 }, // Location
      { wch: 15 }, // Pincode
      { wch: 40 }, // Full Address
      { wch: 15 }, // Gender
      { wch: 20 }, // Date of Birth
      { wch: 10 }, // Age
      { wch: 50 }, // Profile Outline
      { wch: 20 }, // Total Experience
      { wch: 50 }, // Skills
      { wch: 50 }, // Education
      { wch: 40 }, // Certifications
      { wch: 50 }, // Experience
      { wch: 20 }, // Current Salary
      { wch: 20 }, // Expected Salary
      { wch: 20 }, // Notice Period
      { wch: 30 }, // Shift Preference
      { wch: 30 }, // Preferred Cities
      { wch: 40 }, // Available Assets
      { wch: 40 }, // Identity Documents
      { wch: 40 }, // Portfolio Link
      { wch: 40 }, // Social Media Link
      { wch: 40 }, // Resume URL
      { wch: 40 }, // Video Resume URL
      { wch: 40 }, // Audio Biodata URL
      { wch: 40 }, // Photograph URL
      { wch: 50 }, // Cover Letter
      { wch: 50 }, // Additional Information
      { wch: 50 }, // Notes
      { wch: 20 }, // Status
      { wch: 20 }, // Applied Date
      { wch: 20 }, // Last Updated
    ]

    ws["!cols"] = colWidths

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

// Helper function to format education data
function formatEducation(education: any): string {
  if (!education) return ""

  const educationArray = Array.isArray(education) ? education : [education]

  return educationArray
    .map((edu: any, index: number) => {
      if (typeof edu === "string") {
        return edu
      } else if (edu && typeof edu === "object") {
        let eduStr = `${index + 1}. ${edu.degree || ""} from ${edu.institution || ""} (${edu.startYear || ""} - ${edu.endYear || "Present"})`

        if (edu.level) eduStr += `, Level: ${edu.level}`
        if (edu.mode) eduStr += `, Mode: ${edu.mode}`
        if (edu.percentage) eduStr += `, Percentage/CGPA: ${edu.percentage}`

        return eduStr
      }
      return ""
    })
    .filter(Boolean)
    .join("\n")
}

// Helper function to format experience data
function formatExperience(experience: any): string {
  if (!experience) return ""

  if (typeof experience === "string") {
    return experience
  }

  const expArray = Array.isArray(experience) ? experience : [experience]

  return expArray
    .map((exp: any, index: number) => {
      if (typeof exp === "string") {
        return exp
      } else if (exp && typeof exp === "object") {
        let expStr = `${index + 1}. ${exp.title || ""} at ${exp.companyName || ""} (${exp.startDate || ""} - ${exp.endDate || exp.tenure || "Present"})`

        if (exp.department) expStr += `, Department: ${exp.department}`
        if (exp.summary || exp.description) expStr += `, Description: ${exp.summary || exp.description || ""}`
        
        // Include salary and notice period information in the experience string
        if (exp.currentSalary) expStr += `, Current Salary: ${exp.currentSalary}`
        if (exp.expectedSalary) expStr += `, Expected Salary: ${exp.expectedSalary}`
        if (exp.noticePeriod) expStr += `, Notice Period: ${exp.noticePeriod} days`

        return expStr
      }
      return ""
    })
    .filter(Boolean)
    .join("\n")
}