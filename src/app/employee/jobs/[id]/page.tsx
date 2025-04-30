"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Briefcase, MapPin, Clock, Users, Edit, Trash2 } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { use } from "react"

interface JobPosting {
  _id: string
  jobTitle: string
  jobLocation: string
  experienceRange: string
  jobType: string
  salaryRange: string
  industry: string
  department: string
  skills: string[]
  jobDescription: string
  educationalPreference: string
  shiftPreference: string[]
  assetsRequirement: {
    wifi: boolean
    laptop: boolean
    vehicle: boolean
  }
  companyName: string
  aboutCompany: string
  websiteLink: string
  questions: string[]
  answers: string[]
  applicants?: number
  daysLeft?: number
  interviews?: number
  createdAt: string
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  // Unwrap the params object using React.use()
  const unwrappedParams = use(params)
  const jobId = unwrappedParams.id

  const [job, setJob] = useState<JobPosting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDeleteJob = async () => {
    if (!confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/employee/jobs/${jobId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete job posting")
      }

      toast.success("Job posting deleted successfully")
      router.push("/employee/dashboard?tab=jobs")
    } catch (error) {
      console.error("Error deleting job posting:", error)
      toast.error("Failed to delete job posting")
    } finally {
      setIsDeleting(false)
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Job Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The job posting you are looking for does not exist or has been removed.
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{job.jobTitle}</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/employee/jobs/${jobId}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDeleteJob} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span>{job.jobLocation}</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span>{job.jobType}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span>{job.experienceRange} years</span>
                  </div>
                  {job.department && (
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <span>{job.department}</span>
                    </div>
                  )}
                  {job.salaryRange && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Salary:</span>
                      <span>{job.salaryRange}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">Job Description</h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line">{job.jobDescription}</p>
                  </div>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {job.educationalPreference && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-3">Educational Requirements</h3>
                      <p>
                        {job.educationalPreference === "high_school"
                          ? "High School"
                          : job.educationalPreference === "associates"
                            ? "Associate's Degree"
                            : job.educationalPreference === "bachelors"
                              ? "Bachelor's Degree"
                              : job.educationalPreference === "masters"
                                ? "Master's Degree"
                                : job.educationalPreference === "phd"
                                  ? "PhD"
                                  : "No specific educational requirements"}
                      </p>
                    </div>
                  </>
                )}

                {job.shiftPreference && job.shiftPreference.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-3">Shift Preference</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.shiftPreference.map((shift, index) => (
                          <Badge key={index} variant="outline">
                            {shift.charAt(0).toUpperCase() + shift.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {(job.assetsRequirement?.wifi || job.assetsRequirement?.laptop || job.assetsRequirement?.vehicle) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-3">Required Assets</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.assetsRequirement.wifi && <Badge variant="outline">WiFi</Badge>}
                        {job.assetsRequirement.laptop && <Badge variant="outline">Laptop</Badge>}
                        {job.assetsRequirement.vehicle && <Badge variant="outline">Vehicle</Badge>}
                      </div>
                    </div>
                  </>
                )}

                {job.questions && job.questions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-3">Screening Questions</h3>
                      <div className="space-y-4">
                        {job.questions.map((question, index) => (
                          <div key={index} className="border p-4 rounded-md dark:border-gray-700">
                            <p className="font-medium mb-2">Q: {question}</p>
                            {job.answers && job.answers[index] && (
                              <p className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium">A:</span> {job.answers[index]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {job.aboutCompany && (
              <Card>
                <CardHeader>
                  <CardTitle>About the Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{job.aboutCompany}</p>
                  {job.websiteLink && (
                    <Button variant="link" className="p-0 h-auto mt-2" asChild>
                      <a href={job.websiteLink} target="_blank" rel="noopener noreferrer">
                        Visit Website
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Posted on</span>
                  <span className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Applicants</span>
                  <span className="font-medium">{job.applicants || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Interviews</span>
                  <span className="font-medium">{job.interviews || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Days Left</span>
                  <span className="font-medium">{job.daysLeft || 30}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => router.push(`/employee/jobs/${jobId}/applicants`)}>
                  <Users className="h-4 w-4 mr-2" />
                  View Applicants
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/employee/jobs/${jobId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Copy job URL to clipboard
                    const jobUrl = `${window.location.origin}/jobs/${jobId}`
                    navigator.clipboard.writeText(jobUrl)
                    toast.success("Job URL copied to clipboard")
                  }}
                >
                  Share Job
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
