"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast, Toaster } from "sonner"
import JobPostingForm from "@/components/job-posting-form"
import { use } from "react"

export default function EditJobPage({ params }: { params: { id: string } }) {
  // Unwrap the params object using React.use()
  const unwrappedParams = use(params)
  const jobId = unwrappedParams.id

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [job, setJob] = useState<any>(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/employee/jobs/${jobId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch job details")
        }

        const data = await response.json()
        setJob(data.job)
      } catch (error) {
        console.error("Error fetching job:", error)
        toast.error("Failed to load job details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  const handleSubmit = async (jobData: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/employee/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error("Failed to update job posting")
      }

      toast.success("Job posting updated successfully!")

      // Navigate back to the job details page after successful submission
      setTimeout(() => {
        router.push(`/employee/jobs/${jobId}`)
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error updating job posting:", error)
      toast.error("Failed to update job posting")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Job Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The job posting you are trying to edit does not exist or has been removed.
              </p>
              <Button onClick={() => router.push("/employee/dashboard?tab=jobs")}>View All Jobs</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Details
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Job Posting</CardTitle>
            <CardDescription>Update the details of your job posting</CardDescription>
          </CardHeader>
          <CardContent>
            <JobPostingForm jobId={jobId} isEditing={true} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
