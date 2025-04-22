"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Briefcase, Building, MapPin, Calendar } from "lucide-react"

interface Application {
  _id: string
  jobTitle: string
  companyName: string
  location: string
  appliedDate: string
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "offered"
  description: string
}

interface StudentApplicationsProps {
  studentId: string
}

export default function StudentApplications({ studentId }: StudentApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(`/api/student/applications?studentId=${studentId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch applications")
        }

        const data = await response.json()
        setApplications(data.applications || [])
      } catch (error) {
        toast.error("Error loading applications")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [studentId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewing":
        return "bg-blue-100 text-blue-800"
      case "shortlisted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "offered":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "reviewing":
        return "Under Review"
      case "shortlisted":
        return "Shortlisted"
      case "rejected":
        return "Not Selected"
      case "offered":
        return "Offer Received"
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardHeader>
          <CardTitle>No Applications Yet</CardTitle>
          <CardDescription>You haven't applied to any jobs yet. Start exploring opportunities!</CardDescription>
        </CardHeader>
        <CardContent>
          <Briefcase className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            When you apply for jobs, they will appear here so you can track your applications.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button>Browse Jobs</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Applications</h2>

      <div className="grid grid-cols-1 gap-6">
        {applications.map((application) => (
          <Card key={application._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{application.jobTitle}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Building className="h-4 w-4 mr-1" />
                    {application.companyName}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(application.status)}>{getStatusText(application.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">{application.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {application.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Applied on: {new Date(application.appliedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                Withdraw Application
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
