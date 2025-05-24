import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request
    const userId = await getUserFromRequest(request)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Find employee to verify
    const employee = await db.collection("employees").findOne({
      $or: [{ _id: new ObjectId(userId) }, { _id: userId }],
    })

    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    // Get company ID for data isolation
    const companyId = employee.companyId || employee._id.toString()

    // Get all candidates for this employee/company only
    const candidates = await db
      .collection("candidates")
      .find({
        $or: [
          { employerId: new ObjectId(userId) },
          { companyId: companyId },
          { employerId: userId },
          { companyId: new ObjectId(companyId) },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Get all job applications for this employee only
    const applications = await db
      .collection("job_applications")
      .find({
        $or: [{ employerId: new ObjectId(userId) }, { employerId: userId }],
      })
      .toArray()

    // Create a map of candidate IDs from applications
    const applicationCandidateIds = new Set(applications.map((app) => app.candidateId.toString()))

    // Get all students who have applied to this employee's jobs
    const studentIds = Array.from(applicationCandidateIds)
      .filter((id) => !candidates.some((c) => c._id.toString() === id))
      .map((id) => {
        try {
          return new ObjectId(id)
        } catch (error) {
          console.error(`Invalid ObjectId: ${id}`)
          return null
        }
      })
      .filter(Boolean)

    // Fetch students who have applied
    const students =
      studentIds.length > 0
        ? await db
            .collection("students")
            .find({ _id: { $in: studentIds } })
            .toArray()
        : []

    // Convert students to candidate format
    const studentCandidates = students.map((student) => {
      // Find the application for this student
      const application = applications.find((app) => app.candidateId.toString() === student._id.toString())

      return {
        _id: student._id,
        name: `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unknown",
        email: student.email || "",
        phone: student.phone || "",
        role:
          student.experience && student.experience.length > 0
            ? student.experience[0].title
            : application?.position || "Not specified",
        status: application?.status || "Applied",
        createdAt: application?.createdAt || student.createdAt || new Date(),
        avatar: student.avatar || student.documents?.photograph?.url || null,
        employerId: new ObjectId(userId), // Set the current employee as the employer
        companyId: companyId,
      }
    })

    // Combine candidates from both sources
    const allCandidates = [...candidates, ...studentCandidates]

    // Sort by creation date
    allCandidates.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Add cache control headers to prevent caching
    const headers = new Headers()
    headers.append("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    headers.append("Pragma", "no-cache")
    headers.append("Expires", "0")

    return NextResponse.json(
      { success: true, candidates: allCandidates },
      {
        status: 200,
        headers: headers,
      },
    )
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch candidates" }, { status: 500 })
  }
}
