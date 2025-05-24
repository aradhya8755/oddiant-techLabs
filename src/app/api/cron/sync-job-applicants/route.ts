import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    // Connect to database
    const { db } = await connectToDatabase()

    // Get all jobs
    const jobs = await db.collection("jobs").find({}).toArray()

    console.log(`Found ${jobs.length} jobs to sync applicant counts`)

    let updatedCount = 0

    // Process each job
    for (const job of jobs) {
      // Count applications for this job
      const applicationsCount = await db.collection("job_applications").countDocuments({
        jobId: new ObjectId(job._id),
      })

      // If count doesn't match, update the job
      if (job.applicants !== applicationsCount) {
        await db.collection("jobs").updateOne({ _id: job._id }, { $set: { applicants: applicationsCount } })
        updatedCount++
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Synced applicant counts for ${updatedCount} jobs`,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error syncing job applicants:", error)
    return NextResponse.json({ success: false, message: "Failed to sync job applicants" }, { status: 500 })
  }
}
