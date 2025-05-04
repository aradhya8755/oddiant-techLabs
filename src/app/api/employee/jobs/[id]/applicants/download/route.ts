import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"
import ExcelJS from "exceljs"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const jobId = params.id
    const { applicantIds } = await request.json()

    if (!applicantIds || !Array.isArray(applicantIds) || applicantIds.length === 0) {
      return NextResponse.json({ message: "No applicants selected" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find job to verify it exists
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) })

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    // Convert string IDs to ObjectIds
    const objectIds = applicantIds.map((id) => new ObjectId(id))

    // Find all selected candidates with explicit projection to ensure all fields are fetched
    const candidates = await db
      .collection("candidates")
      .find({ _id: { $in: objectIds } })
      .project({}) // Empty projection to ensure all fields are returned
      .toArray()

    console.log("Found candidates:", candidates.length)

    if (candidates.length === 0) {
      return NextResponse.json({ message: "No candidates found" }, { status: 404 })
    }

    // Log the first candidate's structure to debug
    if (candidates.length > 0) {
      console.log(
        "First candidate workExperience structure:",
        typeof candidates[0].workExperience,
        Array.isArray(candidates[0].workExperience)
          ? `Array length: ${candidates[0].workExperience.length}`
          : "Not an array",
      )

      console.log(
        "First candidate certifications structure:",
        typeof candidates[0].certifications,
        Array.isArray(candidates[0].certifications)
          ? `Array length: ${candidates[0].certifications.length}`
          : "Not an array",
      )

      // Log the keys of the first candidate to see all available fields
      console.log("First candidate keys:", Object.keys(candidates[0]))
    }

    // Create a new workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Applicants")

    // Define columns - Personal Information
    worksheet.columns = [
      // Personal Information
      { header: "Salutation", key: "salutation", width: 10 },
      { header: "Name", key: "name", width: 25 },
      { header: "First Name", key: "firstName", width: 15 },
      { header: "Middle Name", key: "middleName", width: 15 },
      { header: "Last Name", key: "lastName", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Alternative Phone", key: "alternativePhone", width: 20 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Date of Birth", key: "dateOfBirth", width: 15 },
      { header: "Location", key: "location", width: 25 },
      { header: "Current City", key: "currentCity", width: 20 },
      { header: "Current State", key: "currentState", width: 20 },
      { header: "Pincode", key: "pincode", width: 15 },

      // Professional Information
      { header: "Role", key: "role", width: 25 },
      { header: "Status", key: "status", width: 15 },
      { header: "Experience", key: "experience", width: 15 },
      { header: "Total Experience (years)", key: "totalExperience", width: 15 },
      { header: "Applied Date", key: "appliedDate", width: 15 },
      { header: "Profile Outline", key: "profileOutline", width: 40 },

      // Work Experience - Added to main sheet
      { header: "Work Experience", key: "workExperienceText", width: 60 },

      // Certifications - Added to main sheet
      { header: "Certifications", key: "certificationsText", width: 60 },

      // Education
      { header: "Education", key: "education", width: 40 },

      // Skills and Preferences
      { header: "Skills", key: "skills", width: 40 },
      { header: "Shift Preference", key: "shiftPreference", width: 20 },
      { header: "Preferred Cities", key: "preferredCities", width: 30 },

      // Assets and Documents
      { header: "Available Assets", key: "availableAssets", width: 30 },
      { header: "Identity Documents", key: "identityDocuments", width: 30 },

      // Online Presence
      { header: "Portfolio Link", key: "portfolioLink", width: 30 },
      { header: "Social Media Link", key: "socialMediaLink", width: 30 },
      { header: "LinkedIn", key: "linkedIn", width: 30 },

      // Media URLs
      { header: "Resume URL", key: "resumeUrl", width: 40 },
      { header: "Video Resume URL", key: "videoResumeUrl", width: 40 },
      { header: "Audio Biodata URL", key: "audioBiodataUrl", width: 40 },
      { header: "Photograph URL", key: "photographUrl", width: 40 },

      // Additional Information
      { header: "Cover Letter", key: "coverLetter", width: 40 },
      { header: "Notes", key: "notes", width: 40 },
      { header: "Additional Info", key: "additionalInfo", width: 40 },
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

    // Add data to worksheet
    candidates.forEach((candidate) => {
      // Format education data
      let educationText = ""
      if (candidate.education) {
        if (Array.isArray(candidate.education)) {
          educationText = candidate.education
            .map((edu) => {
              if (typeof edu === "string") return edu
              return `${edu.degree || ""} from ${edu.institution || ""} (${edu.startYear || ""}-${edu.endYear || ""})${
                edu.level ? `, Level: ${edu.level}` : ""
              }${edu.mode ? `, Mode: ${edu.mode}` : ""}${edu.percentage ? `, Percentage/CGPA: ${edu.percentage}` : ""}`
            })
            .join("; ")
        } else if (typeof candidate.education === "object") {
          const edu = candidate.education
          educationText = `${edu.degree || ""} from ${edu.institution || ""} (${edu.startYear || ""}-${
            edu.endYear || ""
          })${edu.level ? `, Level: ${edu.level}` : ""}${edu.mode ? `, Mode: ${edu.mode}` : ""}${
            edu.percentage ? `, Percentage/CGPA: ${edu.percentage}` : ""
          }`
        } else {
          educationText = candidate.education.toString()
        }
      }

      // Format certifications for main sheet
      let certificationsText = ""
      if (candidate.certifications) {
        if (Array.isArray(candidate.certifications)) {
          certificationsText = candidate.certifications
            .map((cert) => {
              if (typeof cert === "string") return cert
              return `${cert.name || ""} from ${cert.issuer || ""}${
                cert.date ? ` (${new Date(cert.date).toLocaleDateString()})` : ""
              }${cert.credentialId ? `, ID: ${cert.credentialId}` : ""}`
            })
            .join("; ")
        } else if (typeof candidate.certifications === "object") {
          const cert = candidate.certifications
          certificationsText = `${cert.name || ""} from ${cert.issuer || ""}${
            cert.date ? ` (${new Date(cert.date).toLocaleDateString()})` : ""
          }${cert.credentialId ? `, ID: ${cert.credentialId}` : ""}`
        } else if (typeof candidate.certifications === "string") {
          certificationsText = candidate.certifications
        }
      }

      // Format work experience for main sheet - IMPROVED VERSION
      let workExperienceText = ""
      if (candidate.workExperience) {
        if (Array.isArray(candidate.workExperience)) {
          workExperienceText = candidate.workExperience
            .map((exp) => {
              if (typeof exp !== "object") return String(exp)
              return `${exp.title || ""} at ${exp.companyName || ""}${exp.department ? `, ${exp.department}` : ""}${
                exp.tenure ? ` (${exp.tenure})` : ""
              }${exp.currentSalary ? `, Current Salary: ${exp.currentSalary}` : ""}${
                exp.expectedSalary ? `, Expected Salary: ${exp.expectedSalary}` : ""
              }${exp.noticePeriod ? `, Notice Period: ${exp.noticePeriod} days` : ""}`
            })
            .join("; ")
        } else if (typeof candidate.workExperience === "object") {
          const exp = candidate.workExperience
          workExperienceText = `${exp.title || ""} at ${exp.companyName || ""}${exp.department ? `, ${exp.department}` : ""}${
            exp.tenure ? ` (${exp.tenure})` : ""
          }${exp.currentSalary ? `, Current Salary: ${exp.currentSalary}` : ""}${
            exp.expectedSalary ? `, Expected Salary: ${exp.expectedSalary}` : ""
          }${exp.noticePeriod ? `, Notice Period: ${exp.noticePeriod} days` : ""}`
        } else if (typeof candidate.workExperience === "string") {
          workExperienceText = candidate.workExperience
        }
      }

      // Format arrays
      const skillsText = Array.isArray(candidate.skills) ? candidate.skills.join(", ") : candidate.skills || ""
      const shiftPreferenceText = Array.isArray(candidate.shiftPreference)
        ? candidate.shiftPreference.join(", ")
        : candidate.shiftPreference || ""
      const preferredCitiesText = Array.isArray(candidate.preferredCities)
        ? candidate.preferredCities.join(", ")
        : candidate.preferredCities || ""
      const availableAssetsText = Array.isArray(candidate.availableAssets)
        ? candidate.availableAssets.join(", ")
        : candidate.availableAssets || ""
      const identityDocumentsText = Array.isArray(candidate.identityDocuments)
        ? candidate.identityDocuments.join(", ")
        : candidate.identityDocuments || ""

      // Format dates
      const formatDate = (dateString) => {
        if (!dateString) return ""
        try {
          return new Date(dateString).toLocaleDateString()
        } catch (e) {
          return dateString
        }
      }

      // Add row to worksheet
      worksheet.addRow({
        // Personal Information
        salutation: candidate.salutation || "",
        name: candidate.name || "",
        firstName: candidate.firstName || "",
        middleName: candidate.middleName || "",
        lastName: candidate.lastName || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        alternativePhone: candidate.alternativePhone || "",
        gender: candidate.gender || "",
        dateOfBirth: formatDate(candidate.dateOfBirth),
        location: candidate.location || "",
        currentCity: candidate.currentCity || "",
        currentState: candidate.currentState || "",
        pincode: candidate.pincode || "",

        // Professional Information
        role: candidate.role || "",
        status: candidate.status || "",
        experience: candidate.experience || "",
        totalExperience: candidate.totalExperience || "",
        appliedDate: formatDate(candidate.appliedDate || candidate.createdAt),
        profileOutline: candidate.profileOutline || "",

        // Work Experience - Added to main sheet with all details
        workExperienceText: workExperienceText,

        // Certifications - Added to main sheet
        certificationsText: certificationsText,

        // Education
        education: educationText,

        // Skills and Preferences
        skills: skillsText,
        shiftPreference: shiftPreferenceText,
        preferredCities: preferredCitiesText,

        // Assets and Documents
        availableAssets: availableAssetsText,
        identityDocuments: identityDocumentsText,

        // Online Presence
        portfolioLink: candidate.portfolioLink || "",
        socialMediaLink: candidate.socialMediaLink || "",
        linkedIn: candidate.linkedIn || "",

        // Media URLs
        resumeUrl: candidate.resumeUrl || "",
        videoResumeUrl: candidate.videoResumeUrl || "",
        audioBiodataUrl: candidate.audioBiodataUrl || "",
        photographUrl: candidate.photographUrl || "",

        // Additional Information
        coverLetter: candidate.coverLetter || "",
        notes: candidate.notes || "",
        additionalInfo: candidate.additionalInfo || "",
      })
    })

    // Add certifications as a separate sheet
    const certificationsSheet = workbook.addWorksheet("Certifications")
    certificationsSheet.columns = [
      { header: "Candidate Name", key: "candidateName", width: 25 },
      { header: "Certification Name", key: "name", width: 30 },
      { header: "Issuer", key: "issuer", width: 25 },
      { header: "Date", key: "date", width: 15 },
      { header: "Expiry Date", key: "expiryDate", width: 15 },
      { header: "Credential ID", key: "credentialId", width: 25 },
      { header: "Credential URL", key: "credentialUrl", width: 40 },
    ]

    const headerRowCert = certificationsSheet.getRow(1)
    headerRowCert.font = { bold: true }
    headerRowCert.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    }
    headerRowCert.commit()

    // Add certifications data
    candidates.forEach((candidate) => {
      if (candidate.certifications) {
        if (Array.isArray(candidate.certifications)) {
          candidate.certifications.forEach((cert) => {
            if (typeof cert === "object") {
              certificationsSheet.addRow({
                candidateName: candidate.name,
                name: cert.name || "",
                issuer: cert.issuer || "",
                date: cert.date ? new Date(cert.date).toLocaleDateString() : "",
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : "",
                credentialId: cert.credentialId || "",
                credentialUrl: cert.credentialUrl || "",
              })
            } else if (typeof cert === "string") {
              certificationsSheet.addRow({
                candidateName: candidate.name,
                name: cert,
                issuer: "",
                date: "",
                expiryDate: "",
                credentialId: "",
                credentialUrl: "",
              })
            }
          })
        } else if (typeof candidate.certifications === "object") {
          const cert = candidate.certifications
          certificationsSheet.addRow({
            candidateName: candidate.name,
            name: cert.name || "",
            issuer: cert.issuer || "",
            date: cert.date ? new Date(cert.date).toLocaleDateString() : "",
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : "",
            credentialId: cert.credentialId || "",
            credentialUrl: cert.credentialUrl || "",
          })
        } else if (typeof candidate.certifications === "string") {
          certificationsSheet.addRow({
            candidateName: candidate.name,
            name: candidate.certifications,
            issuer: "",
            date: "",
            expiryDate: "",
            credentialId: "",
            credentialUrl: "",
          })
        }
      }
    })

    // Add work experience as a separate sheet
    const workExperienceSheet = workbook.addWorksheet("Work Experience")
    workExperienceSheet.columns = [
      { header: "Candidate Name", key: "candidateName", width: 25 },
      { header: "Title/Designation", key: "title", width: 25 },
      { header: "Department", key: "department", width: 25 },
      { header: "Company Name", key: "companyName", width: 30 },
      { header: "Tenure", key: "tenure", width: 20 },
      { header: "Professional Summary", key: "summary", width: 40 },
      { header: "Current Salary", key: "currentSalary", width: 20 },
      { header: "Expected Salary", key: "expectedSalary", width: 20 },
      { header: "Notice Period", key: "noticePeriod", width: 20 },
    ]

    const headerRowWork = workExperienceSheet.getRow(1)
    headerRowWork.font = { bold: true }
    headerRowWork.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    }
    headerRowWork.commit()

    // Add work experience data - IMPROVED VERSION
    candidates.forEach((candidate) => {
      console.log(`Adding work experience for ${candidate.name} to separate sheet`)

      // Check if workExperience exists
      if (candidate.workExperience) {
        // Handle different data structures
        if (Array.isArray(candidate.workExperience)) {
          // If it's an array, process each experience entry
          candidate.workExperience.forEach((exp) => {
            console.log("Work experience entry:", exp)

            if (exp && typeof exp === "object") {
              workExperienceSheet.addRow({
                candidateName: candidate.name || "",
                title: exp.title || "",
                department: exp.department || "",
                companyName: exp.companyName || "",
                tenure: exp.tenure || "",
                summary: exp.summary || "",
                currentSalary: exp.currentSalary || "",
                expectedSalary: exp.expectedSalary || "",
                noticePeriod: exp.noticePeriod || "",
              })
            } else if (exp) {
              // Handle case where exp is not an object but some other value
              workExperienceSheet.addRow({
                candidateName: candidate.name || "",
                title: String(exp),
                department: "",
                companyName: "",
                tenure: "",
                summary: "",
                currentSalary: "",
                expectedSalary: "",
                noticePeriod: "",
              })
            }
          })
        } else if (typeof candidate.workExperience === "object") {
          // If it's a single object, add it directly
          const exp = candidate.workExperience
          workExperienceSheet.addRow({
            candidateName: candidate.name || "",
            title: exp.title || "",
            department: exp.department || "",
            companyName: exp.companyName || "",
            tenure: exp.tenure || "",
            summary: exp.summary || "",
            currentSalary: exp.currentSalary || "",
            expectedSalary: exp.expectedSalary || "",
            noticePeriod: exp.noticePeriod || "",
          })
        } else if (candidate.workExperience) {
          // If it's any other type, convert to string
          workExperienceSheet.addRow({
            candidateName: candidate.name || "",
            title: String(candidate.workExperience),
            department: "",
            companyName: "",
            tenure: "",
            summary: "",
            currentSalary: "",
            expectedSalary: "",
            noticePeriod: "",
          })
        }
      } else {
        console.log(`No work experience found for ${candidate.name}`)
        // Add an empty row with just the candidate name to show they have no experience
        workExperienceSheet.addRow({
          candidateName: candidate.name || "",
          title: "No work experience data",
          department: "",
          companyName: "",
          tenure: "",
          summary: "",
          currentSalary: "",
          expectedSalary: "",
          noticePeriod: "",
        })
      }
    })

    // Add a Media Links sheet
    const mediaLinksSheet = workbook.addWorksheet("Media Links")
    mediaLinksSheet.columns = [
      { header: "Candidate Name", key: "candidateName", width: 25 },
      { header: "Resume URL", key: "resumeUrl", width: 60 },
      { header: "Video Resume URL", key: "videoResumeUrl", width: 60 },
      { header: "Audio Biodata URL", key: "audioBiodataUrl", width: 60 },
      { header: "Photograph URL", key: "photographUrl", width: 60 },
      { header: "Portfolio Link", key: "portfolioLink", width: 40 },
      { header: "Social Media Link", key: "socialMediaLink", width: 40 },
      { header: "LinkedIn", key: "linkedIn", width: 40 },
    ]

    const headerRowMedia = mediaLinksSheet.getRow(1)
    headerRowMedia.font = { bold: true }
    headerRowMedia.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    }
    headerRowMedia.commit()

    // Add media links data
    candidates.forEach((candidate) => {
      mediaLinksSheet.addRow({
        candidateName: candidate.name,
        resumeUrl: candidate.resumeUrl || "",
        videoResumeUrl: candidate.videoResumeUrl || "",
        audioBiodataUrl: candidate.audioBiodataUrl || "",
        photographUrl: candidate.photographUrl || "",
        portfolioLink: candidate.portfolioLink || "",
        socialMediaLink: candidate.socialMediaLink || "",
        linkedIn: candidate.linkedIn || "",
      })
    })

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Return the Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="applicants-${job.jobTitle}-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error generating Excel file:", error)
    return NextResponse.json(
      { success: false, message: "Failed to generate Excel file", error: String(error) },
      { status: 500 },
    )
  }
}
