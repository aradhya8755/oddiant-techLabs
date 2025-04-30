"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin, Clock, Calendar, ArrowLeft } from "lucide-react"
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
  createdAt: string
}

export default function PublicJobPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const jobId = use(params).id
  const [job, setJob] = useState<JobPosting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/jobs/${jobId}`)

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

  const handleApply = () => {
    setIsApplying(true)
    // Redirect to application form
    router.push(`/jobs/${jobId}/apply`)
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
          <Button variant="ghost" className="mb-6" onClick={() => router.push("/jobs")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Job Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The job posting you are looking for does not exist or has been removed.
              </p>
              <Button onClick={() => router.push("/")}>Go to Home</Button>
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
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{job.jobTitle}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-sm">
                    {job.companyName}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
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
                      <span className="font-medium mr-2">Department:</span>
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
              </CardContent>
            </Card>

            {job.aboutCompany && (
              <Card>
                <CardHeader>
                  <CardTitle>About {job.companyName}</CardTitle>
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
                <CardTitle>Apply Now</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Interested in this position? Submit your application now.</p>
                <Button className="w-full" onClick={handleApply} disabled={isApplying}>
                  {isApplying ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Apply for this Job
                    </>
                  )}
                </Button>
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 inline-block mr-1" />
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Share This Job</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success("Job URL copied to clipboard")
                  }}
                >
                  Copy Job Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
