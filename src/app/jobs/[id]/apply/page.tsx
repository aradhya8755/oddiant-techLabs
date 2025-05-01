"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Briefcase } from "lucide-react"
import { toast, Toaster } from "sonner"
import { use } from "react"

export default function JobApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const jobId = resolvedParams.id
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [job, setJob] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    resumeUrl: "",
    coverLetter: "",
    additionalInfo: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/jobs/${jobId}`)
        if (response.ok) {
          const data = await response.json()
          setJob(data.job)
        }
      } catch (error) {
        console.error("Error fetching job:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      // Reset the uploaded URL when a new file is selected
      setUploadedResumeUrl("")
    }
  }

  const uploadResume = async (file: File): Promise<string> => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Upload error response:", errorData)
        throw new Error(`Failed to upload resume: ${errorData}`)
      }

      const data = await response.json()
      console.log("Upload response data:", data) // Debug log

      // Check if the response contains the expected URL
      if (!data.success || !data.url) {
        console.error("Invalid upload response:", data)
        throw new Error(data.message || "No URL returned from upload")
      }

      return data.url
    } catch (error) {
      console.error("Error uploading resume:", error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadResume = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first")
      return
    }

    try {
      const url = await uploadResume(selectedFile)
      setUploadedResumeUrl(url)
      setFormData((prev) => ({ ...prev, resumeUrl: url }))
      toast.success("Resume uploaded successfully")
    } catch (error) {
      console.error("Resume upload failed:", error)
      toast.error(`Resume upload failed: ${error instanceof Error ? error.message : "Please try again"}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.fullName || !formData.email) {
      toast.error("Please fill in all required fields")
      return
    }

    // Check if resume is uploaded or needs to be uploaded
    let resumeUrl = formData.resumeUrl || uploadedResumeUrl

    if (!resumeUrl && selectedFile) {
      try {
        toast.info("Uploading resume...")
        resumeUrl = await uploadResume(selectedFile)
        setFormData((prev) => ({ ...prev, resumeUrl: resumeUrl }))
      } catch (error) {
        console.error("Resume upload failed:", error)
        toast.error(`Resume upload failed: ${error instanceof Error ? error.message : "Please try again"}`)
        return
      }
    }

    if (!resumeUrl) {
      toast.error("Please upload your resume")
      return
    }

    setIsSubmitting(true)

    try {
      // Submit application with the resume URL
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          resumeUrl,
          jobId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit application")
      }

      const responseData = await response.json()
      console.log("Application submission response:", responseData)

      toast.success("Application submitted successfully!")

      // Redirect to success page after a short delay
      setTimeout(() => {
        router.push(`/jobs/${jobId}/apply/success`)
      }, 2000)
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error(`Failed to submit application: ${error instanceof Error ? error.message : "Unknown error"}`)
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Toaster position="top-center" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Apply for {job?.jobTitle || "Position"}</CardTitle>
            <CardDescription>
              Complete the form below to apply for this position at {job?.companyName || "the company"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name*</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address*</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                  <Input
                    id="linkedIn"
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleChange}
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>

                <div>
                  <Label htmlFor="resume">Resume*</Label>
                  <div className="mt-1">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          ref={fileInputRef}
                          id="resume"
                          name="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="flex-1"
                        />
                        <Button type="button" onClick={handleUploadResume} disabled={!selectedFile || isUploading}>
                          {isUploading ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                      {uploadedResumeUrl && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Resume uploaded successfully! ✓
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    placeholder="Tell us why you're interested in this position..."
                    rows={5}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    placeholder="Any other information you'd like to share..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
