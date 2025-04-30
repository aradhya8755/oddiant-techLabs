"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Calendar, Clock, MapPin, Video, Edit, Trash2, Briefcase } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { EmployeeNavbar } from "@/components/layout/employee-navbar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Interview {
  _id: string
  candidateId: string
  candidate: {
    name: string
    email: string
    phone: string
    role: string
    status: string
  }
  jobId: string
  job?: {
    jobTitle: string
  }
  position: string
  date: string
  time: string
  duration: number
  interviewers: string[]
  meetingLink: string
  notes: string
  status: string
}

export default function InterviewDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  // Use React.use() to unwrap the params Promise
  const unwrappedParams = React.use(params)
  const interviewId = unwrappedParams.id

  const [interview, setInterview] = useState<Interview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/employee/interviews/${interviewId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch interview details")
        }

        const data = await response.json()
        console.log("Interview data:", data.interview) // Debug log
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

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/employee/interviews/${interviewId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete interview")
      }

      toast.success("Interview deleted successfully")
      router.push("/employee/dashboard?tab=interviews")
    } catch (error) {
      console.error("Error deleting interview:", error)
      toast.error("Failed to delete interview")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (e) {
      return "Invalid date"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Scheduled</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Cancelled</Badge>
      case "rescheduled":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Rescheduled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">{status}</Badge>
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
            Back to Interviews
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

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Interview Details</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/employee/interviews/${interviewId}/reschedule`)}>
              <Edit className="h-4 w-4 mr-2" />
              Reschedule
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel Interview
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Interview with {interview.candidate?.name || "Candidate"}</CardTitle>
              <CardDescription>
                Position: {interview.position || interview.job?.jobTitle || "Not specified"}
              </CardDescription>
            </div>
            {getStatusBadge(interview.status || "scheduled")}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Candidate</p>
                    <p>{interview.candidate?.name || "Not specified"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{interview.candidate?.email || ""}</p>
                    {interview.candidate?.phone && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{interview.candidate.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p>{formatDate(interview.date)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p>{interview.time || "Not specified"}</p>
                    {interview.duration && <p className="text-sm text-gray-500">{interview.duration} minutes</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {interview.job && (
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Job</p>
                      <p>{interview.job.jobTitle}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p>{interview.location || "Remote"}</p>
                  </div>
                </div>

                {interview.meetingLink && (
                  <div className="flex items-start">
                    <Video className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Meeting Link</p>
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {interview.meetingLink}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {interview.interviewers && interview.interviewers.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-3">Interviewers</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {interview.interviewers.map((interviewer, index) => (
                      <li key={index}>{interviewer}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {interview.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-3">Notes</h3>
                  <p className="whitespace-pre-line">{interview.notes}</p>
                </div>
              </>
            )}

            <div className="flex justify-center space-x-4 mt-6">
              <Button variant="outline" onClick={() => router.push(`/employee/candidates/${interview.candidateId}`)}>
                <User className="h-4 w-4 mr-2" />
                View Candidate Profile
              </Button>
              <Button onClick={() => router.push(`/employee/interviews/${interviewId}/join`)}>
                <Video className="h-4 w-4 mr-2" />
                Join Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this interview?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The candidate will be notified that the interview has been cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Keep Interview</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Cancelling..." : "Cancel Interview"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
