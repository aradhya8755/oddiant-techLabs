"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, FileText, User } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { use } from "react"

interface Candidate {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  location: string
  experience: string
  education: string
  skills: string[]
  notes: string
  resume: string
  appliedDate: string
  avatar?: string
}

export default function CandidateDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const candidateId = use(params).id
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/employee/candidates/${candidateId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch candidate details")
        }

        const data = await response.json()
        setCandidate(data.candidate)
      } catch (error) {
        console.error("Error fetching candidate:", error)
        toast.error("Failed to load candidate details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCandidate()
  }, [candidateId])

  const handleStatusChange = async (newStatus: string) => {
    if (!candidate) return

    try {
      const response = await fetch(`/api/employee/candidates/${candidateId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update candidate status")
      }

      setCandidate({
        ...candidate,
        status: newStatus,
      })

      toast.success(`Candidate status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating candidate status:", error)
      toast.error("Failed to update candidate status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      case "Shortlisted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Interview":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Hired":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Candidate Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The candidate you are looking for does not exist or has been removed.
              </p>
              <Button onClick={() => router.push("/employee/dashboard?tab=candidates")}>View All Candidates</Button>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={candidate.avatar || "/placeholder.svg?height=96&width=96"} alt={candidate.name} />
                    <AvatarFallback className="text-2xl">{candidate.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{candidate.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">{candidate.role}</p>
                  <Badge className={getStatusColor(candidate.status)}>{candidate.status}</Badge>

                  <div className="w-full mt-6 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push(`/employee/candidates/${candidateId}/contact`)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Candidate
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push(`/employee/interviews/schedule?candidateId=${candidateId}`)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </Button>
                    {/* <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push(`/employee/candidates/${candidateId}/edit`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button> */}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.email}</p>
                  </div>
                </div>
                {candidate.phone && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.phone}</p>
                    </div>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.location}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Candidate Profile</CardTitle>
                <div className="flex space-x-2">
                  <select
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                    value={candidate.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Professional Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</p>
                      <p>{candidate.role}</p>
                    </div>
                    {candidate.experience && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</p>
                        <p>{candidate.experience}</p>
                      </div>
                    )}
                    {candidate.education && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Education</p>
                        <p>{candidate.education}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applied Date</p>
                      <p>{new Date(candidate.appliedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {candidate.skills && candidate.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {candidate.resume && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-2">Resume</h3>
                      <Button variant="outline" className="text-blue-600 dark:text-blue-400" asChild>
                        <a
                          href={candidate.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            // Prevent default if resume URL doesn't look like a valid URL
                            if (!candidate.resume.startsWith("http")) {
                              e.preventDefault()
                              toast.error("Resume not available or invalid URL format")
                            }
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Resume
                        </a>
                      </Button>
                    </div>
                  </>
                )}

                {candidate.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-2">Notes</h3>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{candidate.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No interviews scheduled yet</p>
                  <Button onClick={() => router.push(`/employee/interviews/schedule?candidateId=${candidateId}`)}>
                    Schedule Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
