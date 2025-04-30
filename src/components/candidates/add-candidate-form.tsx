"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface JobOption {
  id: string
  title: string
  location: string
}

export function AddCandidateForm({ jobs = [] }: { jobs?: JobOption[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bulkEmails, setBulkEmails] = useState("")
  const [selectedJobId, setSelectedJobId] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [jobOptions, setJobOptions] = useState<JobOption[]>([])

  useEffect(() => {
    setJobOptions(jobs)
  }, [jobs])

  // Find the selected job to get its location
  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jobId = e.target.value
    setSelectedJobId(jobId)
    const job = jobs.find((job) => job.id === jobId)
    if (job) {
      setSelectedLocation(job.location)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bulkEmails.trim() || !selectedJobId) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate emails
    const emailList = bulkEmails.split(/[\s,;]+/).filter((email) => email.trim())
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = emailList.filter((email) => !emailRegex.test(email))

    if (invalidEmails.length > 0) {
      toast.error(`Invalid email format: ${invalidEmails.join(", ")}`)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/employee/candidates/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: emailList,
          jobId: selectedJobId,
          location: selectedLocation,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send invitations")
      }

      toast.success(`Invitations sent to ${emailList.length} candidates`)
      setBulkEmails("")
      setSelectedJobId("")
      setSelectedLocation("")

      // Redirect to candidates list
      router.push("/employee/dashboard?tab=candidates")
      router.refresh()
    } catch (error) {
      console.error("Error sending invitations:", error)
      toast.error("Failed to send invitations")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="bulkEmails">
            Candidate Emails*{" "}
            <span className="text-xs text-gray-500">(Separate multiple emails with commas or new lines)</span>
          </Label>
          <Textarea
            id="bulkEmails"
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            rows={5}
            required
          />
        </div>

        <div>
          <Label htmlFor="jobId">Position Applied For*</Label>
          <select
            id="jobId"
            name="jobId"
            value={selectedJobId}
            onChange={handleJobChange}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
            required
          >
            <option value="">Select a position</option>
            {jobOptions.length > 0 ? (
              jobOptions.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No jobs available
              </option>
            )}
          </select>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            placeholder="e.g. New York, NY"
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
              Sending Invitations...
            </>
          ) : (
            "Invite Candidates"
          )}
        </Button>
      </div>
    </form>
  )
}
