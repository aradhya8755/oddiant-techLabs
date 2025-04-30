"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Candidate {
  _id: string
  name: string
  role: string
}

interface JobPosting {
  _id: string
  jobTitle: string
}

export default function ScheduleInterviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const candidateIdParam = searchParams.get("candidateId")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    candidateId: candidateIdParam || "",
    candidate: "",
    jobId: "",
    position: "",
    date: "",
    time: "",
    duration: "60",
    interviewers: "",
    notes: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch candidates
        const candidatesResponse = await fetch("/api/employee/candidates")
        if (!candidatesResponse.ok) {
          throw new Error("Failed to fetch candidates")
        }
        const candidatesData = await candidatesResponse.json()

        // Fetch jobs
        const jobsResponse = await fetch("/api/employee/jobs")
        if (!jobsResponse.ok) {
          throw new Error("Failed to fetch jobs")
        }
        const jobsData = await jobsResponse.json()

        setCandidates(candidatesData.candidates || [])
        setJobs(jobsData.jobs || [])

        // If candidateId is provided in URL, set the candidate name and position
        if (candidateIdParam) {
          const selectedCandidate = candidatesData.candidates.find((c: any) => c._id === candidateIdParam)
          if (selectedCandidate) {
            setFormData((prev) => ({
              ...prev,
              candidateId: candidateIdParam,
              candidate: selectedCandidate.name,
              position: selectedCandidate.role,
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [candidateIdParam])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCandidateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const candidateId = e.target.value
    setFormData((prev) => ({ ...prev, candidateId }))

    // Update candidate name and position
    const selectedCandidate = candidates.find((c) => c._id === candidateId)
    if (selectedCandidate) {
      setFormData((prev) => ({
        ...prev,
        candidate: selectedCandidate.name,
        position: selectedCandidate.role,
      }))
    }
  }

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jobId = e.target.value
    setFormData((prev) => ({ ...prev, jobId }))

    // Update position if job is selected
    const selectedJob = jobs.find((j) => j._id === jobId)
    if (selectedJob) {
      setFormData((prev) => ({ ...prev, position: selectedJob.jobTitle }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.candidate || !formData.position || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)

      // Format interviewers as an array
      const interviewersArray = formData.interviewers ? formData.interviewers.split(",").map((item) => item.trim()) : []

      const interviewData = {
        ...formData,
        interviewers: interviewersArray,
      }

      const response = await fetch("/api/employee/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(interviewData),
      })

      if (!response.ok) {
        throw new Error("Failed to schedule interview")
      }

      toast.success("Interview scheduled successfully!")

      // Navigate back to the dashboard after successful submission
      setTimeout(() => {
        router.push("/employee/dashboard?tab=interviews")
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error scheduling interview:", error)
      toast.error("Failed to schedule interview")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]

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
        <Button variant="ghost" className="mb-6" onClick={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Interview</CardTitle>
            <CardDescription>Fill in the details to schedule a new interview</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidateId">Select Candidate*</Label>
                    <select
                      id="candidateId"
                      name="candidateId"
                      value={formData.candidateId}
                      onChange={handleCandidateChange}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
                      required
                    >
                      <option value="">Select a candidate</option>
                      {candidates.length > 0 ? (
                        candidates.map((candidate) => (
                          <option key={candidate._id} value={candidate._id}>
                            {candidate.name} - {candidate.role}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No candidates available
                        </option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobId">Select Job (Optional)</Label>
                    <select
                      id="jobId"
                      name="jobId"
                      value={formData.jobId}
                      onChange={handleJobChange}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
                    >
                      <option value="">Select a job</option>
                      {jobs.length > 0 ? (
                        jobs.map((job) => (
                          <option key={job._id} value={job._id}>
                            {job.jobTitle}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No jobs available
                        </option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position*</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="e.g. Frontend Developer"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interviewers">Interviewers (comma separated)</Label>
                    <Input
                      id="interviewers"
                      name="interviewers"
                      value={formData.interviewers}
                      onChange={handleChange}
                      placeholder="e.g. John Doe, Jane Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date*</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={today}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time*</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes about the interview"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Interview"
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
