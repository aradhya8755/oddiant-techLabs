"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Video, Calendar, User, ExternalLink } from "lucide-react"
import { toast, Toaster } from "sonner"
import { EmployeeNavbar } from "@/components/layout/employee-navbar"

interface Interview {
  _id: string
  candidateId: string
  candidate: {
    name: string
    email: string
    phone: string
  }
  position: string
  date: string
  time: string
  meetingLink: string
  notes: string
}

export default function JoinInterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  // Unwrap the params object using React.use()
  const unwrappedParams = React.use(params)
  const interviewId = unwrappedParams.id

  const [interview, setInterview] = useState<Interview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/employee/interviews/${interviewId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch interview details")
        }

        const data = await response.json()
        setInterview(data.interview)
      } catch (error) {
        console.error("Error fetching interview:", error)
        toast.error("Failed to load interview details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterview()
  }, [interviewId])

  const handleJoinMeeting = () => {
    if (!interview?.meetingLink) {
      toast.error("No meeting link available")
      return
    }

    window.open(interview.meetingLink, "_blank")
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString || "N/A"
    }
  }

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "N/A"

    try {
      // Handle HH:MM format
      const [hours, minutes] = timeString.split(":")
      const hour = Number.parseInt(hours, 10)
      const ampm = hour >= 12 ? "PM" : "AM"
      const hour12 = hour % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    } catch (error) {
      console.error("Error formatting time:", error)
      return timeString
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <EmployeeNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Interview Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The interview you are looking for does not exist or has been removed.
              </p>
              <Button onClick={() => router.push("/employee/dashboard?tab=interviews")}>View All Interviews</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Toaster position="top-center" />
      <EmployeeNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Interviews
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Join Interview</CardTitle>
            <CardDescription>
              Interview with {interview.candidate.name} for {interview.position}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Candidate</p>
                  <p>{interview.candidate.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{interview.candidate.email}</p>
                  {interview.candidate.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{interview.candidate.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Date & Time</p>
                  <p>{interview.date ? formatDate(interview.date) : "Date not specified"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatTime(interview.time)}</p>
                </div>
              </div>
            </div>

            {interview.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium">Notes</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{interview.notes}</p>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              {interview.meetingLink ? (
                <Button size="lg" onClick={handleJoinMeeting} className="w-full md:w-auto">
                  <Video className="h-5 w-5 mr-2" />
                  Join Meeting
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-amber-600 dark:text-amber-400 mb-2">No meeting link available</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/employee/interviews/${interviewId}/reschedule`)}
                  >
                    Reschedule Interview
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
