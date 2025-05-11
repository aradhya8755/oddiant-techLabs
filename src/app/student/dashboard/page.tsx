"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast, Toaster } from "sonner"
import {
  User,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  Search,
  Building,
  MapPin,
  Clock,
  Filter,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  Phone,
  Mail,
  Linkedin,
  Globe,
  Upload,
  PencilLine,
  Save,
  X,
  GraduationCap,
  Award,
  FileCheck,
  CreditCard,
  Laptop,
  Video,
  Music,
  ImageIcon,
  Info,
  MessageSquare,
  Calendar,
  DollarSign,
  Timer,
  Layers,
  FileSymlink,
  BriefcaseIcon,
} from "lucide-react"
import { MapPinIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

interface StudentData {
  _id: string
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone?: string
  alternativePhone?: string
  profileCompleted: boolean
  salutation?: string
  gender?: string
  dob?: string
  currentCity?: string
  currentState?: string
  pincode?: string
  permanentAddress?: string
  skills?: string[]
  education?: Array<{
    level?: string
    degree?: string
    institution?: string
    school?: string
    field?: string
    grade?: string
    percentage?: string
    startingYear?: string
    endingYear?: string
    mode?: string
  }>
  certifications?:
    | string[]
    | Array<{
        name: string
        issuingOrganization: string
        issueDate: string
        expiryDate?: string
        credentialId?: string
        credentialUrl?: string
      }>
  experience?: Array<{
    title: string
    companyName: string
    department?: string
    location?: string
    tenure?: string
    currentlyWorking?: boolean
    professionalSummary?: string
    summary?: string
    currentSalary?: string
    expectedSalary?: string
    noticePeriod?: string
    totalExperience?: string
    yearsOfExperience?: string
  }>
  totalExperience?: string
  yearsOfExperience?: string
  shiftPreference?: string | string[]
  preferenceCities?: string[]
  profileOutline?: string
  onlinePresence?: {
    portfolio?: string
    linkedin?: string
    github?: string
    socialMedia?: string
  }
  portfolioLink?: string
  socialMediaLink?: string
  linkedIn?: string
  coverLetter?: string
  additionalInfo?: string
  documents?: {
    resume?: {
      url?: string
      public_id?: string
      filename?: string
      uploadDate?: string
    }
    photograph?: {
      url?: string
      public_id?: string
      name?: string
      uploadDate?: string
    }
    videoResume?: {
      url?: string
      public_id?: string
      filename?: string
      uploadDate?: string
    }
    audioBiodata?: {
      url?: string
      public_id?: string
      filename?: string
      uploadDate?: string
    }
  }
  assets?: {
    bike?: boolean
    wifi?: boolean
    laptop?: boolean
    panCard?: boolean
    aadhar?: boolean
    bankAccount?: boolean
    idProof?: boolean
  }
  availableAssets?: string[]
  identityDocuments?: string[]
  settings?: {
    profileVisibility: boolean
    notifications: {
      email: boolean
      jobRecommendations: boolean
      applicationUpdates: boolean
    }
    preferredJobTypes: string[]
    preferredLocations: string[]
    shiftPreference: string
  }
  avatar?: string
  currentSalary?: string
  expectedSalary?: string
  noticePeriod?: string
}

interface JobPosting {
  _id: string
  jobTitle: string
  jobLocation: string
  experienceRange: string
  jobType: string
  salaryRange: string
  companyName: string
  skills: string[]
  status: string
  createdAt: string
  daysLeft: number
  description?: string
  responsibilities?: string[]
  requirements?: string[]
  benefits?: string[]
  hasApplied?: boolean
}

interface Application {
  _id: string
  jobId: string
  status: string
  appliedDate: string
  job: {
    jobTitle: string
    companyName: string
    jobLocation: string
    jobType: string
  }
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "Not specified"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    return "Invalid date"
  }
}

const formatUrl = (url: string): string => {
  if (!url) return ""
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "https://" + url
  }
  return url
}

const getTotalExperience = (student: StudentData): string => {
  // First check direct properties
  if (student.totalExperience) return student.totalExperience
  if (student.yearsOfExperience) return student.yearsOfExperience

  // Calculate from experience array if available
  if (student.experience && student.experience.length > 0) {
    // First check if any experience entry has totalExperience or yearsOfExperience
    for (const exp of student.experience) {
      if (exp.totalExperience) return exp.totalExperience
      if (exp.yearsOfExperience) return exp.yearsOfExperience
    }

    // Then try to calculate from tenure
    let totalYears = 0
    student.experience.forEach((exp) => {
      if (exp.tenure) {
        const yearMatch = exp.tenure.match(/(\d+)\s*years?/i)
        if (yearMatch && yearMatch[1]) {
          totalYears += Number.parseInt(yearMatch[1], 10)
        }
      }
    })

    if (totalYears > 0) return `${totalYears} years`
  }

  return "Not specified"
}

export default function StudentDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "jobs"

  const [student, setStudent] = useState<StudentData | null>(null)
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [isLoadingApplications, setIsLoadingApplications] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLocation, setFilterLocation] = useState("")
  const [filterJobType, setFilterJobType] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<StudentData["settings"] | null>(null)
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false)
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/student/profile", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        if (response.status === 401) {
          router.push("/auth/login")
          return
        }

        if (!response.ok) {
          if (response.status === 404) {
            setError("Student profile not found. Please complete your registration.")
          } else {
            setError("Failed to load profile data. Please try again later.")
          }
          return
        }

        const data = await response.json()

        if (!data.success) {
          setError(data.message || "Failed to load profile data")
          return
        }

        // Log the student data for debugging
        console.log("Student data:", data.student)

        setStudent(data.student)

        // Fetch settings
        fetchSettings()
      } catch (error) {
        console.error("Error loading profile data:", error)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentData()
  }, [router])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/student/settings", {
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const fetchJobs = async () => {
    try {
      setIsLoadingJobs(true)
      const response = await fetch("/api/jobs/available", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch jobs:", response.status)
        // Use mock data if API fails
        setJobs([
          {
            _id: "1",
            jobTitle: "Frontend Developer",
            jobLocation: "Remote",
            experienceRange: "1-3 years",
            jobType: "Full-time",
            salaryRange: "$60,000 - $80,000",
            companyName: "Tech Solutions Inc.",
            skills: ["React", "JavaScript", "CSS"],
            status: "open",
            createdAt: new Date().toISOString(),
            daysLeft: 30,
          },
          {
            _id: "2",
            jobTitle: "Backend Developer",
            jobLocation: "New York",
            experienceRange: "2-5 years",
            jobType: "Full-time",
            salaryRange: "$80,000 - $100,000",
            companyName: "Data Systems LLC",
            skills: ["Node.js", "Express", "MongoDB"],
            status: "open",
            createdAt: new Date().toISOString(),
            daysLeft: 25,
          },
        ])
        return
      }

      const data = await response.json()
      console.log("Fetched jobs:", data.jobs)
      setJobs(data.jobs || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
      // Use mock data if API fails
      setJobs([
        {
          _id: "1",
          jobTitle: "Frontend Developer",
          jobLocation: "Remote",
          experienceRange: "1-3 years",
          jobType: "Full-time",
          salaryRange: "$60,000 - $80,000",
          companyName: "Tech Solutions Inc.",
          skills: ["React", "JavaScript", "CSS"],
          status: "open",
          createdAt: new Date().toISOString(),
          daysLeft: 30,
        },
        {
          _id: "2",
          jobTitle: "Backend Developer",
          jobLocation: "New York",
          experienceRange: "2-5 years",
          jobType: "Full-time",
          salaryRange: "$80,000 - $100,000",
          companyName: "Data Systems LLC",
          skills: ["Node.js", "Express", "MongoDB"],
          status: "open",
          createdAt: new Date().toISOString(),
          daysLeft: 25,
        },
      ])
    } finally {
      setIsLoadingJobs(false)
    }
  }

  const fetchApplications = async () => {
    try {
      setIsLoadingApplications(true)
      const response = await fetch("/api/student/applications", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        console.error("Failed to fetch applications:", response.status)
        setApplications([])
        return
      }

      const data = await response.json()
      console.log("Fetched applications:", data.applications)
      setApplications(data.applications || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
      setApplications([])
    } finally {
      setIsLoadingApplications(false)
    }
  }

  useEffect(() => {
    if (!isLoading && student) {
      fetchJobs()
      fetchApplications()
    }
  }, [isLoading, student])

  // This effect ensures the tab content is updated when the URL parameter changes
  useEffect(() => {
    // Force re-render when tab changes in URL
    console.log("Active tab changed to:", activeTab)
  }, [activeTab])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchJobs(), fetchApplications()])
    setIsRefreshing(false)
    toast.success("Data refreshed successfully")
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      router.push("/auth/login")
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  const handleTabChange = (value: string) => {
    router.push(`/student/dashboard?tab=${value}`)
  }

  const handleAvatarEdit = () => {
    setIsEditingAvatar(true)
  }

  const handleAvatarUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingAvatar(true)
      toast.loading("Uploading avatar...")

      // Create form data
      const formData = new FormData()
      formData.append("avatar", file)

      // Send to server
      const response = await fetch("/api/student/profile/avatar", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload avatar")
      }

      const data = await response.json()

      // Update student state with new avatar URL from server
      setStudent((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          avatar: data.avatarUrl,
          documents: {
            ...prev.documents,
            photograph: {
              url: data.avatarUrl,
              uploadDate: new Date().toISOString(),
              name: file.name,
            },
          },
        }
      })

      toast.dismiss()
      toast.success("Avatar updated successfully")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.dismiss()
      toast.error("Failed to upload avatar")
    } finally {
      setIsUploadingAvatar(false)
      setIsEditingAvatar(false)
    }
  }

  const handleCancelAvatarEdit = () => {
    setIsEditingAvatar(false)
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    setIsUpdatingSettings(true)
    try {
      const response = await fetch("/api/student/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      const data = await response.json()
      toast.success("Settings updated successfully")
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setIsUpdatingSettings(false)
    }
  }

  const handleApplyToJob = async (jobId: string) => {
    try {
      const response = await fetch("/api/student/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.message || "Failed to apply for job")
        return
      }

      const data = await response.json()
      toast.success("Application submitted successfully")

      // Update jobs list to mark this job as applied
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId
            ? {
                ...job,
                hasApplied: true,
              }
            : job,
        ),
      )

      // Refresh applications list
      fetchApplications()
    } catch (error) {
      console.error("Error applying for job:", error)
      toast.error("An error occurred while applying for the job")
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesLocation = filterLocation ? job.jobLocation.toLowerCase().includes(filterLocation.toLowerCase()) : true
    const matchesJobType = filterJobType ? job.jobType.toLowerCase() === filterJobType.toLowerCase() : true

    return matchesSearch && matchesLocation && matchesJobType
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return <Badge className="bg-blue-100 text-blue-800">Applied</Badge>
      case "shortlisted":
        return <Badge className="bg-yellow-100 text-yellow-800">Shortlisted</Badge>
      case "interview":
        return <Badge className="bg-purple-100 text-purple-800">Interview</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "hired":
        return <Badge className="bg-green-100 text-green-800">Hired</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  // Format date helper function
  const formatUrlOriginal = (url: string | undefined) => {
    if (!url) return ""
    return url.startsWith("http") ? url : `https://${url}`
  }

  // Get available assets as array
  const getAvailableAssets = (student: StudentData) => {
    if (student.availableAssets && student.availableAssets.length > 0) {
      return student.availableAssets
    }

    if (student.assets) {
      const assets: string[] = []
      if (student.assets.bike) assets.push("Bike / Car")
      if (student.assets.wifi) assets.push("WiFi")
      if (student.assets.laptop) assets.push("Laptop")
      return assets
    }

    return []
  }

  // Get identity documents as array
  const getIdentityDocuments = (student: StudentData) => {
    if (student.identityDocuments && student.identityDocuments.length > 0) {
      return student.identityDocuments
    }

    if (student.assets) {
      const documents: string[] = []
      if (student.assets.panCard) documents.push("PAN Card")
      if (student.assets.aadhar) documents.push("Aadhar")
      if (student.assets.bankAccount) documents.push("Bank Account")
      if (student.assets.idProof) documents.push("Voter ID / Passport / DL (Any)")
      return documents
    }

    return []
  }

  // Get total experience - FIXED to properly display total experience
  const getTotalExperienceOriginal = (student: StudentData) => {
    // First check direct properties
    if (student.totalExperience) return student.totalExperience
    if (student.yearsOfExperience) return student.yearsOfExperience

    // Calculate from experience array if available
    if (student.experience && student.experience.length > 0) {
      // First check if any experience entry has totalExperience
      for (const exp of student.experience) {
        if (exp.totalExperience) return exp.totalExperience
      }

      // Then try to calculate from tenure
      let totalYears = 0
      student.experience.forEach((exp) => {
        if (exp.tenure) {
          const yearMatch = exp.tenure.match(/(\d+)\s*years?/i)
          if (yearMatch && yearMatch[1]) {
            totalYears += Number.parseInt(yearMatch[1], 10)
          }
        }
      })

      if (totalYears > 0) return `${totalYears} years`
    }

    return "Not specified"
  }

  // Helper function to get certification names
  const getCertificationNames = (student: StudentData) => {
    if (!student.certifications || student.certifications.length === 0) {
      return []
    }

    // If certifications is an array of strings, return it directly
    if (typeof student.certifications[0] === "string") {
      return student.certifications as string[]
    }

    // If certifications is an array of objects, extract the name property
    return (student.certifications as Array<{ name: string }>).map((cert) => cert.name)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>There was a problem loading your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/auth/login")}>
                Go to Login
              </Button>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Expired</CardTitle>
            <CardDescription>Your session has expired or you are not logged in.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/login")} className="w-full hover:bg-green-500 hover:text-black">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-black shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white">
              Welcome, {student.firstName} {student.lastName}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!student.profileCompleted && (
          <Card className="mb-8 border-yellow-300 bg-yellow-50">
            <CardContent className="p-4 flex items-center">
              <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Your profile is incomplete. Please complete your profile to access all features.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
                onClick={() => router.push("/student/profile/edit")}
              >
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        {/* Main Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 border-b">
            <button
              onClick={() => handleTabChange("jobs")}
              className={`px-4 py-2 font-medium ${
                activeTab === "jobs" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Briefcase className="h-4 w-4 inline mr-2" />
              Job Openings
            </button>
            <button
              onClick={() => handleTabChange("applications")}
              className={`px-4 py-2 font-medium ${
                activeTab === "applications"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              My Applications
            </button>
            <button
              onClick={() => handleTabChange("profile")}
              className={`px-4 py-2 font-medium ${
                activeTab === "profile"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              My Profile
            </button>
            <button
              onClick={() => handleTabChange("settings")}
              className={`px-4 py-2 font-medium ${
                activeTab === "settings"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Job Openings Tab */}
        {activeTab === "jobs" && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Latest Job Openings</CardTitle>
                <CardDescription>
                  Browse through the latest job opportunities that match your skills and experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search jobs by title, company, or skills..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="relative w-full md:w-40">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Location"
                          className="pl-10"
                          value={filterLocation}
                          onChange={(e) => setFilterLocation(e.target.value)}
                        />
                      </div>
                      <div className="relative w-full md:w-40">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <select
                          className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm"
                          value={filterJobType}
                          onChange={(e) => setFilterJobType(e.target.value)}
                        >
                          <option value="">Job Type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {isLoadingJobs ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No job openings found</h3>
                    <p className="text-gray-500">
                      {searchTerm || filterLocation || filterJobType
                        ? "Try adjusting your search filters"
                        : "Check back later for new opportunities"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredJobs.map((job) => (
                      <Card key={job._id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold mb-1">{job.jobTitle}</h3>
                                <p className="text-gray-600 mb-2">{job.companyName}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {job.jobLocation}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {job.jobType}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Building className="h-4 w-4 mr-1" />
                                    {job.experienceRange}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {job.skills.slice(0, 3).map((skill, index) => (
                                    <Badge key={index} variant="outline" className="bg-blue-50">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {job.skills.length > 3 && (
                                    <Badge variant="outline" className="bg-gray-50">
                                      +{job.skills.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className="mb-2 bg-green-100 text-green-800">{job.daysLeft} days left</Badge>
                                <p className="text-xs text-gray-500">
                                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <p className="text-sm font-medium text-gray-900">
                                {job.salaryRange || "Salary not disclosed"}
                              </p>
                              <div className="flex gap-2">
                                <Button variant="outline" onClick={() => router.push(`/jobs/${job._id}`)}>
                                  View Details
                                </Button>
                                {job.hasApplied ? (
                                  <Button variant="outline" disabled>
                                    Applied
                                  </Button>
                                ) : (
                                  <Button onClick={() => handleApplyToJob(job._id)}>Apply Now</Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track the status of your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingApplications ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
                    <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
                    <Button onClick={() => handleTabChange("jobs")}>Browse Jobs</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <Card key={application._id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold mb-1">
                                {application.job?.jobTitle || "Unknown Job"}
                              </h3>
                              <p className="text-gray-600 mb-2">{application.job?.companyName || "Unknown Company"}</p>
                              <div className="flex items-center text-sm text-gray-500 mb-4">
                                <MapPin className="h-4 w-4 mr-1" />
                                {application.job?.jobLocation || "Unknown Location"}
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(application.status)}
                              <p className="text-xs text-gray-500 mt-1">
                                Applied on {new Date(application.appliedDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end mt-4">
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/student/applications/${application._id}`)}
                            >
                              View Application
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>View and manage your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3 flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="h-32 w-32 mb-4">
                        <AvatarImage
                          src={
                            student.avatar ||
                            student.documents?.photograph?.url ||
                            "/placeholder.svg?height=128&width=128" ||
                            "/placeholder.svg"
                          }
                          alt={`${student.firstName} ${student.lastName}`}
                        />
                        <AvatarFallback className="text-3xl">
                          {student.firstName?.charAt(0)}
                          {student.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      {isEditingAvatar ? (
                        <div className="absolute -bottom-2 right-0 flex space-x-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full bg-white"
                            onClick={handleAvatarUpload}
                            disabled={isUploadingAvatar}
                          >
                            {isUploadingAvatar ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full bg-white"
                            onClick={handleCancelAvatarEdit}
                            disabled={isUploadingAvatar}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute -bottom-2 right-0 h-8 w-8 rounded-full bg-white"
                          onClick={handleAvatarEdit}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-center">
                      {student.salutation && `${student.salutation} `}
                      {student.firstName} {student.middleName && `${student.middleName} `}
                      {student.lastName}
                    </h3>
                    <p className="text-gray-500 text-center mb-4">{student.email}</p>
                    <Button
                      variant="outline"
                      className="w-full mb-2"
                      onClick={() => router.push("/student/profile/edit")}
                    >
                      Edit Profile
                    </Button>
                    {student.documents?.resume?.url && (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={student.documents.resume.url} target="_blank" rel="noopener noreferrer">
                          View Resume
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="md:w-2/3">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Personal Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p>
                              {student.salutation && `${student.salutation} `}
                              {student.firstName} {student.middleName && `${student.middleName} `}
                              {student.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p>{student.gender || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p>{formatDate(student.dob)}</p>
                          </div>
                          {student.pincode && (
                            <div>
                              <p className="text-sm text-gray-500">Pincode</p>
                              <p>{student.pincode}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 mt-0.5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p>{student.email}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="h-4 w-4 mt-0.5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p>{student.phone || "Not provided"}</p>
                            </div>
                          </div>
                          {student.alternativePhone && (
                            <div className="flex items-start gap-2">
                              <Phone className="h-4 w-4 mt-0.5 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">Alternative Phone</p>
                                <p>{student.alternativePhone}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Current Location</p>
                              <p>
                                {student.currentCity && student.currentState
                                  ? `${student.currentCity}, ${student.currentState}`
                                  : "Not provided"}
                              </p>
                            </div>
                          </div>
                          {(student.onlinePresence?.linkedin || student.linkedIn) && (
                            <div className="flex items-start gap-2">
                              <Linkedin className="h-4 w-4 mt-0.5 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">LinkedIn</p>
                                <a
                                  href={formatUrlOriginal(student.onlinePresence?.linkedin || student.linkedIn)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {(student.onlinePresence?.linkedin || student.linkedIn).replace(
                                    /^https?:\/\/(www\.)?/,
                                    "",
                                  )}
                                </a>
                              </div>
                            </div>
                          )}
                          {(student.onlinePresence?.portfolio || student.portfolioLink) && (
                            <div className="flex items-start gap-2">
                              <Globe className="h-4 w-4 mt-0.5 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">Portfolio</p>
                                <a
                                  href={formatUrlOriginal(student.onlinePresence?.portfolio || student.portfolioLink)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {(student.onlinePresence?.portfolio || student.portfolioLink).replace(
                                    /^https?:\/\/(www\.)?/,
                                    "",
                                  )}
                                </a>
                              </div>
                            </div>
                          )}
                          {(student.onlinePresence?.socialMedia || student.socialMediaLink) && (
                            <div className="flex items-start gap-2">
                              <Globe className="h-4 w-4 mt-0.5 text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500">Social Media</p>
                                <a
                                  href={formatUrlOriginal(
                                    student.onlinePresence?.socialMedia || student.socialMediaLink,
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {(student.onlinePresence?.socialMedia || student.socialMediaLink).replace(
                                    /^https?:\/\/(www\.)?/,
                                    "",
                                  )}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Profile Summary</h4>
                        <p className="whitespace-pre-line">
                          {student.profileOutline ||
                            "No profile summary provided. Add a summary to tell employers about yourself."}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Skills</h4>
                        {student.skills && student.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {student.skills.map((skill, index) => (
                              <Badge key={index} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No skills added yet</p>
                        )}
                      </div>

                      {/* Professional Experience Summary */}
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                          <BriefcaseIcon className="h-4 w-4 mr-2" />
                          Professional Experience Summary
                        </h4>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-3 rounded-md flex flex-col items-center">
                            <span className="text-sm text-gray-500">Total Experience</span>
                            <span className="text-lg font-semibold text-blue-700">
                              {getTotalExperienceOriginal(student)}
                            </span>
                          </div>

                          {(student.currentSalary || (student.experience && student.experience[0]?.currentSalary)) && (
                            <div className="bg-green-50 p-3 rounded-md flex flex-col items-center">
                              <span className="text-sm text-gray-500">Current Salary</span>
                              <span className="text-lg font-semibold text-green-700">
                                {student.currentSalary || student.experience?.[0]?.currentSalary || "Not specified"}
                              </span>
                            </div>
                          )}

                          {(student.expectedSalary ||
                            (student.experience && student.experience[0]?.expectedSalary)) && (
                            <div className="bg-purple-50 p-3 rounded-md flex flex-col items-center">
                              <span className="text-sm text-gray-500">Expected Salary</span>
                              <span className="text-lg font-semibold text-purple-700">
                                {student.expectedSalary || student.experience?.[0]?.expectedSalary || "Not specified"}
                              </span>
                            </div>
                          )}

                          {(student.noticePeriod || (student.experience && student.experience[0]?.noticePeriod)) && (
                            <div className="bg-amber-50 p-3 rounded-md flex flex-col items-center">
                              <span className="text-sm text-gray-500">Notice Period</span>
                              <span className="text-lg font-semibold text-amber-700">
                                {student.noticePeriod || student.experience?.[0]?.noticePeriod || "Not specified"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shift Preference */}
                      {(student.shiftPreference ||
                        (student.settings?.shiftPreference && student.settings.shiftPreference !== "flexible")) && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Shift Preference
                            </h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Array.isArray(student.shiftPreference) ? (
                                student.shiftPreference.map((shift, index) => (
                                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-800">
                                    {shift}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="outline" className="bg-blue-50 text-blue-800">
                                  {student.shiftPreference || student.settings?.shiftPreference || "Flexible"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Preferred Cities */}
                      {student.preferenceCities && student.preferenceCities.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-2" />
                              Preferred Cities (Max 5)
                            </h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {student.preferenceCities.slice(0, 5).map((city, index) => (
                                <Badge key={index} variant="outline" className="bg-green-50 text-green-800">
                                  {city}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {student.education && student.education.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                              <GraduationCap className="h-4 w-4 mr-2" />
                              Education
                            </h4>
                            <div className="space-y-4">
                              {student.education.map((edu, index) => (
                                <div key={index} className="border rounded-md p-3">
                                  <div className="flex justify-between">
                                    <h5 className="font-medium">Degree/Course: {edu.degree}</h5>
                                    <Badge variant="outline">
                                      %age/CGPA: {edu.percentage || edu.grade || "Not specified"}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-600">
                                    School/College/Univ.: {edu.institution || edu.school || "Not specified"}
                                  </p>
                                  <div className="flex justify-between mt-1">
                                    <p className="text-sm text-gray-500">
                                      <Calendar className="h-3 w-3 inline mr-1" />
                                      {edu.startingYear || "Not provided"} - {edu.endingYear || "Present"}
                                    </p>
                                  </div>
                                  {(edu.level || edu.mode) && (
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm justify-between">
                                      {edu.level && (
                                        <div>
                                          <span className="text-gray-500">Level: </span>
                                          {edu.level}
                                        </div>
                                      )}
                                      {edu.mode && (
                                        <div className="ml-auto">
                                          <span className="text-gray-500">Mode: </span>
                                          {edu.mode}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {student.experience && student.experience.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                              <Briefcase className="h-4 w-4 mr-2" />
                              Work Experience
                              <Badge className="ml-2 bg-blue-50 text-blue-800">
                                Total: {getTotalExperienceOriginal(student)}
                              </Badge>
                            </h4>
                            <div className="space-y-4">
                              {student.experience.map((exp, index) => (
                                <div key={index} className="border rounded-md p-3">
                                  <div className="flex justify-between">
                                    <h5 className="font-medium">Title: {exp.title || "Not specified"}</h5>
                                    {exp.currentlyWorking && (
                                      <Badge className="bg-green-100 text-green-800">Current</Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-600">Company: {exp.companyName || "Not specified"}</p>
                                  {exp.department && <p>Department: {exp.department}</p>}
                                  {exp.location && <p className="text-sm text-gray-700">{exp.location}</p>}
                                  <div className="flex justify-between mt-1">
                                    {exp.tenure && (
                                      <p className="text-sm text-gray-700">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        Tenure: {exp.tenure}
                                      </p>
                                    )}
                                  </div>
                                  {(exp.professionalSummary || exp.summary) && (
                                    <p className="mt-2 text-sm whitespace-pre-line">
                                      Professional Summary: {exp.professionalSummary || exp.summary}
                                    </p>
                                  )}
                                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                    {exp.currentSalary && (
                                      <div className="flex items-center">
                                        <DollarSign className="h-3 w-3 mr-1 text-gray-500" />
                                        <span className="text-gray-500">Current: </span>
                                        <span className="ml-1">{exp.currentSalary}</span>
                                      </div>
                                    )}
                                    {exp.expectedSalary && (
                                      <div className="flex items-center">
                                        <DollarSign className="h-3 w-3 mr-1 text-gray-500" />
                                        <span className="text-gray-500">Expected: </span>
                                        <span className="ml-1">{exp.expectedSalary}</span>
                                      </div>
                                    )}
                                    {exp.noticePeriod && (
                                      <div className="flex items-center">
                                        <Timer className="h-3 w-3 mr-1 text-gray-500" />
                                        <span className="text-gray-500">Notice Period: </span>
                                        <span className="ml-1">{exp.noticePeriod}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Certifications Section - FIXED to display only certification names */}
                      {student.certifications && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                              <Award className="h-4 w-4 mr-2" />
                              Certifications
                            </h4>
                            {Array.isArray(student.certifications) && student.certifications.length > 0 ? (
                              <div className="space-y-2">
                                {getCertificationNames(student).map((cert, index) => (
                                  <div key={index} className="border rounded-md p-3">
                                    <h5 className="font-medium">{cert}</h5>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-500">
                                No certifications added yet. Add certifications to showcase your skills and
                                qualifications.
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Available Assets */}
                      {getAvailableAssets(student).length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                              <Laptop className="h-4 w-4 mr-2" />
                              Available Assets
                            </h4>
                            <div className="space-y-1 mt-2">
                              {getAvailableAssets(student).map((asset, index) => (
                                <div key={index} className="flex items-center">
                                  <FileCheck className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>{asset.replace(/_/g, " ")}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Identity Documents */}
                      {getIdentityDocuments(student).length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Identity Documents
                            </h4>
                            <div className="space-y-2 mt-2">
                              {getIdentityDocuments(student).map((doc, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <FileSymlink className="h-4 w-4 mr-2 text-gray-500" />
                                    <span>{doc.replace(/_/g, " ")}</span>
                                  </div>
                                  <Badge variant="outline" className="bg-green-50 text-green-800">
                                    Verified
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {student.coverLetter && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Cover Letter
                            </h4>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="whitespace-pre-line">{student.coverLetter}</p>
                            </div>
                          </div>
                        </>
                      )}

                      {student.additionalInfo && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              Additional Information
                            </h4>
                            <p className="whitespace-pre-line">{student.additionalInfo}</p>
                          </div>
                        </>
                      )}

                      <Separator />

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                          <Layers className="h-4 w-4 mr-2" />
                          Documents
                        </h4>
                        <div className="space-y-3 mt-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-gray-500" />
                              <span>Resume</span>
                            </div>
                            {student.documents?.resume?.url ? (
                              <Button variant="outline" size="sm" asChild>
                                <a href={student.documents.resume.url} target="_blank" rel="noopener noreferrer">
                                  View Resume
                                </a>
                              </Button>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-800">
                                Not uploaded
                              </Badge>
                            )}
                          </div>

                          {student.documents?.videoResume?.url && (
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Video className="h-4 w-4 mr-2 text-gray-500" />
                                <span>Video Resume</span>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={student.documents.videoResume.url} target="_blank" rel="noopener noreferrer">
                                  View Video
                                </a>
                              </Button>
                            </div>
                          )}

                          {student.documents?.audioBiodata?.url && (
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Music className="h-4 w-4 mr-2 text-gray-500" />
                                <span>Audio Bio</span>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={student.documents.audioBiodata.url} target="_blank" rel="noopener noreferrer">
                                  Listen
                                </a>
                              </Button>
                            </div>
                          )}

                          {student.documents?.photograph?.url && (
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <ImageIcon className="h-4 w-4 mr-2 text-gray-500" />
                                <span>Photograph</span>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={student.documents.photograph.url} target="_blank" rel="noopener noreferrer">
                                  View Photo
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Profile Visibility</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Make profile visible to employers</p>
                        <p className="text-sm text-gray-500">
                          Allow employers to find your profile when searching for candidates
                        </p>
                      </div>
                      <div className="flex items-center h-6">
                        <Switch
                          checked={settings?.profileVisibility ?? true}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => (prev ? { ...prev, profileVisibility: checked } : prev))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email notifications</p>
                          <p className="text-sm text-gray-500">
                            Receive email notifications about new job matches and application updates
                          </p>
                        </div>
                        <div className="flex items-center h-6">
                          <Switch
                            checked={settings?.notifications?.email ?? true}
                            onCheckedChange={(checked) =>
                              setSettings((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      notifications: {
                                        ...prev.notifications,
                                        email: checked,
                                      },
                                    }
                                  : prev,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Job recommendations</p>
                          <p className="text-sm text-gray-500">
                            Receive personalized job recommendations based on your profile
                          </p>
                        </div>
                        <div className="flex items-center h-6">
                          <Switch
                            checked={settings?.notifications?.jobRecommendations ?? true}
                            onCheckedChange={(checked) =>
                              setSettings((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      notifications: {
                                        ...prev.notifications,
                                        jobRecommendations: checked,
                                      },
                                    }
                                  : prev,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Application status updates</p>
                          <p className="text-sm text-gray-500">
                            Receive notifications when your application status changes
                          </p>
                        </div>
                        <div className="flex items-center h-6">
                          <Switch
                            checked={settings?.notifications?.applicationUpdates ?? true}
                            onCheckedChange={(checked) =>
                              setSettings((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      notifications: {
                                        ...prev.notifications,
                                        applicationUpdates: checked,
                                      },
                                    }
                                  : prev,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Security</h3>
                    <div className="space-y-4">
                      <Button variant="outline" onClick={() => router.push("/student/change-password")}>
                        Change Password
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                    <div className="space-y-4">
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                            try {
                              const response = await fetch("/api/student/delete-account", {
                                method: "DELETE",
                              })

                              if (response.ok) {
                                toast.success("Account deleted successfully")
                                router.push("/auth/login")
                              } else {
                                const data = await response.json()
                                toast.error(data.message || "Failed to delete account")
                              }
                            } catch (error) {
                              console.error("Error deleting account:", error)
                              toast.error("An error occurred while deleting your account")
                            }
                          }
                        }}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={isUpdatingSettings}
                      className="flex items-center gap-2"
                    >
                      {isUpdatingSettings ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
