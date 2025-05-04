"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast, Toaster } from "sonner"
import {
  User,
  Briefcase,
  Settings,
  LogOut,
  Users,
  BarChart,
  Calendar,
  Clock,
  PlusCircle,
  Search,
  RefreshCw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import JobPostingForm from "@/components/job-posting-form"

interface EmployeeData {
  _id: string
  firstName: string
  lastName: string
  email: string
  designation: string
  companyName: string
  companyLocation: string
  phone: string
  profileCompleted: boolean
  notificationSettings?: {
    emailNotifications: boolean
    applicationUpdates: boolean
    interviewReminders: boolean
  }
}

interface Candidate {
  _id: string
  name: string
  email: string
  role: string
  status: string
  avatar?: string
  appliedDate: string
}

interface JobPosting {
  _id: string
  jobTitle: string
  department: string
  jobType: string
  jobLocation: string
  applicants?: number
  daysLeft?: number
  interviews?: number
  createdAt: string
  updatedAt?: string
}

interface Interview {
  _id: string
  candidate: string
  position: string
  date: string
  time: string
  jobId?: string
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")

  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(tabParam || "overview")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    activeCandidate: 0,
    openPositions: 0,
    interviewsToday: 0,
    hiringRate: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    interviewReminders: true,
  })
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  // Effect to update the URL when tab changes
  useEffect(() => {
    if (activeTab !== tabParam) {
      router.push(`/employee/dashboard?tab=${activeTab}`, { scroll: false })
    }
  }, [activeTab, router, tabParam])

  // Memoized fetch functions to avoid recreating them on every render
  const fetchCandidates = useCallback(async () => {
    try {
      const response = await fetch("/api/employee/candidates")

      if (!response.ok) {
        throw new Error("Failed to fetch candidates")
      }

      const data = await response.json()

      // Format the data
      const formattedCandidates = data.candidates.map((candidate: any) => ({
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        role: candidate.role,
        status: candidate.status,
        avatar: candidate.avatar || "/placeholder.svg?height=40&width=40",
        appliedDate: new Date(candidate.createdAt).toLocaleDateString(),
      }))

      setCandidates(formattedCandidates)

      // Update dashboard stats
      setDashboardStats((prev) => ({
        ...prev,
        activeCandidate: formattedCandidates.length,
      }))
    } catch (error) {
      console.error("Error fetching candidates:", error)
      toast.error("Failed to load candidates")
    }
  }, [])

  const fetchJobPostings = useCallback(async () => {
    try {
      const response = await fetch("/api/employee/jobs", {
        // Add cache busting parameter to prevent caching
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch job postings")
      }

      const data = await response.json()

      // Format the data
      const formattedJobs = data.jobs.map((job: any) => {
        // Calculate days left based on job duration or default to 30 days
        const createdDate = new Date(job.createdAt)
        const durationDays = job.duration || 30
        const expiryDate = new Date(createdDate)
        expiryDate.setDate(createdDate.getDate() + durationDays)

        const today = new Date()
        const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

        return {
          _id: job._id,
          jobTitle: job.jobTitle,
          department: job.department,
          jobType: job.jobType,
          jobLocation: job.jobLocation,
          applicants: job.applicants || 0,
          daysLeft: daysLeft,
          interviews: job.interviews || 0,
          createdAt: new Date(job.createdAt).toLocaleDateString(),
          updatedAt: job.updatedAt ? new Date(job.updatedAt).toISOString() : undefined,
        }
      })

      setJobPostings(formattedJobs)

      // Update dashboard stats
      setDashboardStats((prev) => ({
        ...prev,
        openPositions: formattedJobs.length,
      }))
    } catch (error) {
      console.error("Error fetching job postings:", error)
      toast.error("Failed to load job postings")
    }
  }, [])

  const fetchInterviews = useCallback(async () => {
    try {
      const response = await fetch("/api/employee/interviews", {
        // Add cache busting parameter to prevent caching
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch interviews")
      }

      const data = await response.json()

      // Format the data
      const formattedInterviews = data.interviews.map((interview: any) => {
        const interviewDate = new Date(interview.date)
        return {
          _id: interview._id,
          candidate: interview.candidate,
          position: interview.position,
          date: interviewDate.toLocaleDateString(),
          time: interview.time,
          jobId: interview.jobId || undefined,
        }
      })

      setInterviews(formattedInterviews)

      // Count today's interviews
      const today = new Date().toDateString()
      const todayInterviews = data.interviews.filter(
        (interview: any) => new Date(interview.date).toDateString() === today,
      ).length

      // Update dashboard stats
      setDashboardStats((prev) => ({
        ...prev,
        interviewsToday: todayInterviews,
        hiringRate: 78, // Default value, could be calculated based on actual data
      }))

      // Update job postings with interview counts
      updateJobPostingsWithInterviewCounts(formattedInterviews)
    } catch (error) {
      console.error("Error fetching interviews:", error)
      toast.error("Failed to load interviews")
    }
  }, [])

  // Update job postings with interview counts
  const updateJobPostingsWithInterviewCounts = useCallback((interviewsData: Interview[]) => {
    setJobPostings((prevJobs) => {
      return prevJobs.map((job) => {
        // Count interviews for this job
        const jobInterviews = interviewsData.filter(
          (interview) => interview.jobId === job._id || interview.position.includes(job.jobTitle),
        ).length

        return {
          ...job,
          interviews: jobInterviews,
        }
      })
    })
  }, [])

  // Effect to fetch employee data on mount
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/employee/profile")

        if (response.status === 401) {
          router.push("/auth/employee/login")
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch employee data")
        }

        const data = await response.json()
        setEmployee(data.employee)

        // Initialize personal info form
        setPersonalInfo({
          firstName: data.employee.firstName || "",
          lastName: data.employee.lastName || "",
          email: data.employee.email || "",
          phone: data.employee.phone || "",
        })

        // Initialize notification settings
        if (data.employee.notificationSettings) {
          setNotificationSettings(data.employee.notificationSettings)
        }

        // Fetch additional data
        await Promise.all([fetchCandidates(), fetchJobPostings(), fetchInterviews()])
      } catch (error) {
        toast.error("Error loading profile data")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployeeData()

    // Set up polling for real-time updates
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshData(false)
      }
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(intervalId)
  }, [router, fetchCandidates, fetchJobPostings, fetchInterviews])

  // Effect to update job postings with interview counts whenever interviews change
  useEffect(() => {
    updateJobPostingsWithInterviewCounts(interviews)
  }, [interviews, updateJobPostingsWithInterviewCounts])

  // Effect to refresh data when tab changes
  useEffect(() => {
    if (activeTab === "jobs" || activeTab === "interviews") {
      refreshData(false)
    }
  }, [activeTab])

  // Function to refresh all data
  const refreshData = async (showToast = true) => {
    try {
      setIsRefreshing(true)

      await Promise.all([fetchCandidates(), fetchJobPostings(), fetchInterviews()])

      setLastRefreshed(new Date())

      if (showToast) {
        toast.success("Data refreshed successfully")
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      if (showToast) {
        toast.error("Failed to refresh data")
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      router.push("/auth/employee/login")
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  const handleSavePersonalInfo = async () => {
    try {
      setIsUpdatingProfile(true)

      const response = await fetch("/api/employee/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          phone: personalInfo.phone,
          designation: employee?.designation,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      // Update the employee state with new data
      setEmployee((prev) => {
        if (!prev) return null
        return {
          ...prev,
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          phone: personalInfo.phone,
        }
      })

      toast.success("Personal information updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update personal information")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleSaveNotificationSettings = async () => {
    try {
      setIsUpdatingNotifications(true)

      const response = await fetch("/api/employee/notifications/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationSettings),
      })

      if (!response.ok) {
        throw new Error("Failed to update notification settings")
      }

      // Update the employee state with new notification settings
      setEmployee((prev) => {
        if (!prev) return null
        return {
          ...prev,
          notificationSettings,
        }
      })

      toast.success("Notification preferences saved successfully")
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast.error("Failed to save notification preferences")
    } finally {
      setIsUpdatingNotifications(false)
    }
  }

  const handleUpdatePassword = async () => {
    try {
      // Validate passwords
      if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
        toast.error("New passwords don't match")
        return
      }

      if (!passwordInfo.currentPassword || !passwordInfo.newPassword) {
        toast.error("Please fill in all password fields")
        return
      }

      setIsUpdatingPassword(true)

      const response = await fetch("/api/employee/password/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordInfo.currentPassword,
          newPassword: passwordInfo.newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to update password")
      }

      // Clear password fields
      setPasswordInfo({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast.success("Password updated successfully")
    } catch (error: any) {
      console.error("Error updating password:", error)
      toast.error(error.message || "Failed to update password")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        setIsDeletingAccount(true)

        const response = await fetch("/api/employee/account/delete", {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete account")
        }

        toast.success("Account deleted successfully")
        router.push("/auth/employee/login")
      } catch (error) {
        console.error("Error deleting account:", error)
        toast.error("Failed to delete account")
      } finally {
        setIsDeletingAccount(false)
      }
    }
  }

  const handleCreateJobPosting = async (jobData: any) => {
    try {
      const response = await fetch("/api/employee/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error("Failed to create job posting")
      }

      toast.success("Job posting created successfully!")

      // Refresh job postings
      await fetchJobPostings()

      // Switch to jobs tab
      setActiveTab("jobs")
    } catch (error) {
      console.error("Error creating job posting:", error)
      toast.error("Failed to create job posting")
    }
  }

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Expired</CardTitle>
            <CardDescription>Your session has expired or you are not logged in.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/auth/employee/login")}
              className="w-full hover:bg-green-500 hover:text-black"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-black text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Employee Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {employee.firstName} {employee.lastName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-black bg-blue-400 border-white hover:white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Users className="h-8 w-8 mb-2" />
              <p className="text-2xl font-bold">{dashboardStats.activeCandidate}</p>
              <p className="text-sm opacity-80">Active Candidates</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Briefcase className="h-8 w-8 mb-2" />
              <p className="text-2xl font-bold">{dashboardStats.openPositions}</p>
              <p className="text-sm opacity-80">Open Positions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Calendar className="h-8 w-8 mb-2" />
              <p className="text-2xl font-bold">{dashboardStats.interviewsToday}</p>
              <p className="text-sm opacity-80">Interviews Today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <BarChart className="h-8 w-8 mb-2" />
              <p className="text-2xl font-bold">{dashboardStats.hiringRate}%</p>
              <p className="text-sm opacity-80">Hiring Success Rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto">
            <TabsTrigger value="overview" className="flex items-center justify-center">
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center justify-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center justify-center">
              <Calendar className="h-4 w-4 mr-2" />
              Interviews
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.companyName && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Company Name</h3>
                        <p>{employee.companyName}</p>
                      </div>
                      {employee.companyLocation && (
                        <div>
                          <h3 className="font-medium">Location</h3>
                          <p>{employee.companyLocation}</p>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">Your Role</h3>
                        <p>{employee.designation || "Employee"}</p>
                      </div>
                    </div>
                  )}
                  {!employee.companyName && (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">Company profile not set up</p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveTab("settings")}>
                        Complete Profile
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Candidates</CardTitle>
                  <CardDescription>Latest candidates who applied to your jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidates.length > 0 ? (
                      candidates.slice(0, 4).map((candidate) => (
                        <div
                          key={candidate._id}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={candidate.avatar || "/placeholder.svg"} alt={candidate.name} />
                              <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{candidate.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.role}</p>
                            </div>
                          </div>
                          <Badge
                            className={
                              candidate.status === "Shortlisted"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : candidate.status === "Interview"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                  : candidate.status === "Rejected"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            }
                          >
                            {candidate.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No candidates yet</p>
                        <Button variant="outline" className="mt-4" onClick={() => setActiveTab("candidates")}>
                          Add Candidates
                        </Button>
                      </div>
                    )}

                    {candidates.length > 0 && (
                      <Button variant="outline" className="w-full mt-2" onClick={() => setActiveTab("candidates")}>
                        <Users className="h-4 w-4 mr-2" />
                        View All Candidates
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Open Positions</CardTitle>
                  <CardDescription>Currently active job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  {jobPostings.length > 0 ? (
                    <div className="space-y-4">
                      {jobPostings.slice(0, 3).map((job) => (
                        <div key={job._id} className="border rounded-lg p-4 dark:border-gray-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{job.jobTitle}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {job.department} • {job.jobType} • {job.jobLocation}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{job.applicants} Applicants</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{job.daysLeft} days left</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab("jobs")}>
                        <Briefcase className="h-4 w-4 mr-2" />
                        View All Jobs
                      </Button>
                    </div>
                  ) : (
                    <JobPostingForm onSubmit={handleCreateJobPosting} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Interviews</CardTitle>
                  <CardDescription>Scheduled interviews for this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {interviews.length > 0 ? (
                      interviews.slice(0, 2).map((interview) => (
                        <div key={interview._id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                          <div className="bg-purple-100 dark:bg-purple-800 p-2 rounded-full mr-3">
                            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                          </div>
                          <div>
                            <p className="font-medium">{interview.candidate}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{interview.position}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {interview.date} at {interview.time}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No upcoming interviews</p>
                      </div>
                    )}

                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("interviews")}>
                      <Calendar className="h-4 w-4 mr-2" />
                      View Calendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>All Candidates</CardTitle>
                    <CardDescription>Manage your candidate pipeline</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        placeholder="Search candidates..."
                        className="pl-8 w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => router.push("/employee/candidates/add")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Candidate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredCandidates.length > 0 ? (
                  <div className="rounded-md border dark:border-gray-700">
                    <div className="grid grid-cols-6 bg-gray-50 dark:bg-gray-800 p-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <div className="col-span-2">Candidate</div>
                      <div>Position</div>
                      <div>Status</div>
                      <div>Applied Date</div>
                      <div className="text-right">Actions</div>
                    </div>

                    {filteredCandidates.map((candidate) => (
                      <div
                        key={candidate._id}
                        className="grid grid-cols-6 border-t dark:border-gray-700 p-3 items-center"
                      >
                        <div className="col-span-2 flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={candidate.avatar || "/placeholder.svg"} alt={candidate.name} />
                            <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{candidate.email}</p>
                          </div>
                        </div>
                        <div>{candidate.role}</div>
                        <div>
                          <Badge
                            className={
                              candidate.status === "Shortlisted"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : candidate.status === "Interview"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                  : candidate.status === "Rejected"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            }
                          >
                            {candidate.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{candidate.appliedDate}</div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/employee/candidates/${candidate._id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 dark:text-blue-400"
                            onClick={() => router.push(`/employee/candidates/${candidate._id}/contact`)}
                          >
                            Contact
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg dark:border-gray-700">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No candidates found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      {searchTerm ? "Try a different search term" : "Add your first candidate to get started"}
                    </p>
                    <Button className="mt-4" onClick={() => router.push("/employee/candidates/add")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Candidate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Job Postings</CardTitle>
                    <CardDescription>Manage your active and closed job postings</CardDescription>
                  </div>
                  <Button onClick={() => router.push("/employee/jobs/add")}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Job
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {jobPostings.length > 0 ? (
                  <div className="space-y-4">
                    {jobPostings.map((job) => (
                      <div key={job._id} className="border rounded-lg p-4 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{job.jobTitle}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {job.department} • {job.jobType} • {job.jobLocation}
                            </p>
                            <div className="flex mt-2 space-x-4">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                <strong>{job.applicants}</strong> Applicants
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                <strong>{job.interviews}</strong> Interviews
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                <strong>{job.daysLeft}</strong> Days Left
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/employee/jobs/${job._id}`)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/employee/jobs/${job._id}/edit`)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <JobPostingForm onSubmit={handleCreateJobPosting} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews">
            <Card>
              <CardHeader>
                <CardTitle>Interview Schedule</CardTitle>
                <CardDescription>Manage your upcoming interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Today</h3>
                    <Button variant="outline" size="sm" onClick={() => router.push("/employee/interviews/schedule")}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {interviews
                      .filter((interview) => {
                        const today = new Date().toLocaleDateString()
                        return interview.date === today
                      })
                      .map((interview) => (
                        <div
                          key={interview._id}
                          className="border rounded-lg p-4 flex justify-between items-center dark:border-gray-700"
                        >
                          <div className="flex items-center">
                            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">{interview.candidate}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{interview.position}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {interview.date} at {interview.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/employee/interviews/${interview._id}/reschedule`)}
                            >
                              Reschedule
                            </Button>
                            <Button size="sm" onClick={() => router.push(`/employee/interviews/${interview._id}/join`)}>
                              Join Meeting
                            </Button>
                          </div>
                        </div>
                      ))}

                    {interviews.filter((interview) => {
                      const today = new Date().toLocaleDateString()
                      return interview.date === today
                    }).length === 0 && (
                      <div className="text-center py-8 border rounded-lg dark:border-gray-700">
                        <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No interviews scheduled for today</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <h3 className="font-medium mb-4">Upcoming</h3>
                    {interviews.filter((interview) => {
                      const today = new Date().toLocaleDateString()
                      return interview.date !== today
                    }).length > 0 ? (
                      <div className="space-y-4">
                        {interviews
                          .filter((interview) => {
                            const today = new Date().toLocaleDateString()
                            return interview.date !== today
                          })
                          .map((interview) => (
                            <div
                              key={interview._id}
                              className="border rounded-lg p-4 flex justify-between items-center dark:border-gray-700"
                            >
                              <div className="flex items-center">
                                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
                                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{interview.candidate}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{interview.position}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {interview.date} at {interview.time}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/employee/interviews/${interview._id}`)}
                                >
                                  Details
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg dark:border-gray-700">
                        <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No upcoming interviews scheduled</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={personalInfo.firstName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={personalInfo.lastName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSavePersonalInfo} disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium">Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordInfo.currentPassword}
                        onChange={(e) => setPasswordInfo({ ...passwordInfo, currentPassword: e.target.value })}
                      />
                    </div>
                    <div></div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordInfo.newPassword}
                        onChange={(e) => setPasswordInfo({ ...passwordInfo, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordInfo.confirmPassword}
                        onChange={(e) => setPasswordInfo({ ...passwordInfo, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive email notifications for important updates
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: checked === true,
                            })
                          }
                        />
                        <Label htmlFor="emailNotifications">Enabled</Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Application Updates</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified when candidates apply to your jobs
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="applicationUpdates"
                          checked={notificationSettings.applicationUpdates}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              applicationUpdates: checked === true,
                            })
                          }
                        />
                        <Label htmlFor="applicationUpdates">Enabled</Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Interview Reminders</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive reminders before scheduled interviews
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="interviewReminders"
                          checked={notificationSettings.interviewReminders}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              interviewReminders: checked === true,
                            })
                          }
                        />
                        <Label htmlFor="interviewReminders">Enabled</Label>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSaveNotificationSettings} disabled={isUpdatingNotifications}>
                    {isUpdatingNotifications ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                        Saving...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                    {isDeletingAccount ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
