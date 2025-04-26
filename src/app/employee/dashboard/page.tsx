"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
  PlusCircle,
  Search,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

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
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
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
      } catch (error) {
        toast.error("Error loading profile data")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployeeData()
  }, [router])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Expired</CardTitle>
            <CardDescription>Your session has expired or you are not logged in.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/employee/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock data for dashboard
  const recentCandidates = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Frontend Developer",
      status: "Shortlisted",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "UX Designer",
      status: "Interview",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Michael Brown",
      role: "Backend Developer",
      status: "Applied",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "Emily Davis",
      role: "Product Manager",
      status: "Rejected",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const upcomingInterviews = [
    { id: 1, candidate: "Alex Johnson", position: "Frontend Developer", date: "May 2, 2023", time: "10:00 AM" },
    { id: 2, name: "Sarah Williams", position: "UX Designer", date: "May 3, 2023", time: "2:30 PM" },
  ]

  const openPositions = [
    { id: 1, title: "Senior Frontend Developer", department: "Engineering", applicants: 12, daysLeft: 5 },
    { id: 2, title: "UX Designer", department: "Design", applicants: 8, daysLeft: 7 },
    { id: 3, title: "Product Manager", department: "Product", applicants: 15, daysLeft: 3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-purple-700 text-white shadow">
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
              className="text-white border-white hover:bg-purple-800"
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
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm opacity-80">Active Candidates</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Briefcase className="h-8 w-8 mb-2" />
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm opacity-80">Open Positions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Calendar className="h-8 w-8 mb-2" />
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm opacity-80">Interviews Today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <BarChart className="h-8 w-8 mb-2" />
              <p className="text-2xl font-bold">78%</p>
              <p className="text-sm opacity-80">Hiring Success Rate</p>
            </CardContent>
          </Card>
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
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <Building className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold">{employee.companyName}</h3>
                    <p className="text-gray-500 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {employee.companyLocation}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contact Person</p>
                      <p className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-gray-600">{employee.designation}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Contact Information</p>
                      <p className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {employee.email}
                      </p>
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {employee.phone}
                      </p>
                    </div>

                    <Button variant="outline" className="w-full">
                      Edit Company Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Candidates</CardTitle>
                  <CardDescription>Latest candidates who applied to your jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={candidate.avatar || "/placeholder.svg"} alt={candidate.name} />
                            <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-sm text-gray-500">{candidate.role}</p>
                          </div>
                        </div>
                        <Badge
                          className={
                            candidate.status === "Shortlisted"
                              ? "bg-green-100 text-green-800"
                              : candidate.status === "Interview"
                                ? "bg-blue-100 text-blue-800"
                                : candidate.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }
                        >
                          {candidate.status}
                        </Badge>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full mt-2">
                      <Users className="h-4 w-4 mr-2" />
                      View All Candidates
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Open Positions</CardTitle>
                  <CardDescription>Currently active job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {openPositions.map((position) => (
                      <div key={position.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{position.title}</h4>
                            <p className="text-sm text-gray-500">{position.department}</p>
                          </div>
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                            {position.daysLeft} days left
                          </Badge>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Applications</span>
                            <span className="font-medium">{position.applicants}</span>
                          </div>
                          <Progress value={(position.applicants / 20) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}

                    <Button className="w-full">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Post New Job
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Interviews</CardTitle>
                  <CardDescription>Scheduled interviews for this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingInterviews.length > 0 ? (
                      upcomingInterviews.map((interview) => (
                        <div key={interview.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                          <div className="bg-purple-100 p-2 rounded-full mr-3">
                            <Clock className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{interview.candidate}</p>
                            <p className="text-sm text-gray-500">{interview.position}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {interview.date} at {interview.time}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No upcoming interviews</p>
                      </div>
                    )}

                    <Button variant="outline" className="w-full">
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
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input placeholder="Search candidates..." className="pl-8 w-[250px]" />
                    </div>
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Candidate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 bg-gray-50 p-3 text-sm font-medium text-gray-500">
                    <div className="col-span-2">Candidate</div>
                    <div>Position</div>
                    <div>Status</div>
                    <div>Applied Date</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {[...recentCandidates, ...recentCandidates].map((candidate, index) => (
                    <div key={`${candidate.id}-${index}`} className="grid grid-cols-6 border-t p-3 items-center">
                      <div className="col-span-2 flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={candidate.avatar || "/placeholder.svg"} alt={candidate.name} />
                          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-xs text-gray-500">candidate{index}@example.com</p>
                        </div>
                      </div>
                      <div>{candidate.role}</div>
                      <div>
                        <Badge
                          className={
                            candidate.status === "Shortlisted"
                              ? "bg-green-100 text-green-800"
                              : candidate.status === "Interview"
                                ? "bg-blue-100 text-blue-800"
                                : candidate.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }
                        >
                          {candidate.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">Apr {20 + index}, 2023</div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="text-blue-600">
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {openPositions.map((position) => (
                    <div key={position.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{position.title}</h3>
                          <p className="text-gray-500">{position.department} • Full-time • Remote</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                          Active
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Applications</p>
                          <p className="text-2xl font-bold">{position.applicants}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Interviews</p>
                          <p className="text-2xl font-bold">{Math.floor(position.applicants / 3)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Days Left</p>
                          <p className="text-2xl font-bold">{position.daysLeft}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline">View Details</Button>
                        <Button variant="outline">Edit Job</Button>
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          Close Job
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {upcomingInterviews.map((interview) => (
                      <div key={interview.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-3 rounded-full mr-4">
                            <Clock className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{interview.candidate}</h4>
                            <p className="text-sm text-gray-500">{interview.position}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {interview.date} at {interview.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button size="sm">Join Meeting</Button>
                        </div>
                      </div>
                    ))}

                    {upcomingInterviews.length === 0 && (
                      <div className="text-center py-12 border rounded-lg">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">No interviews scheduled</h3>
                        <p className="text-gray-500 mt-1">Schedule interviews with your candidates</p>
                        <Button className="mt-4">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Interview
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <h3 className="font-medium mb-4">Upcoming</h3>
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full mr-4">
                          <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Team Interview</h4>
                          <p className="text-sm text-gray-500">3 candidates for Frontend Developer</p>
                          <p className="text-xs text-gray-500 mt-1">May 5, 2023 at 11:00 AM</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
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
                      <Input id="firstName" defaultValue={employee.firstName} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={employee.lastName} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={employee.email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue={employee.phone} />
                    </div>
                  </div>
                  <Button>Save Changes</Button>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div></div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  <Button>Update Password</Button>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          className="rounded text-purple-600"
                          defaultChecked
                        />
                        <Label htmlFor="emailNotifications">Enabled</Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Application Updates</p>
                        <p className="text-sm text-gray-500">Get notified when candidates apply to your jobs</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="applicationUpdates"
                          className="rounded text-purple-600"
                          defaultChecked
                        />
                        <Label htmlFor="applicationUpdates">Enabled</Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Interview Reminders</p>
                        <p className="text-sm text-gray-500">Receive reminders before scheduled interviews</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="interviewReminders"
                          className="rounded text-purple-600"
                          defaultChecked
                        />
                        <Label htmlFor="interviewReminders">Enabled</Label>
                      </div>
                    </div>
                  </div>
                  <Button>Save Preferences</Button>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                  <p className="text-sm text-gray-500">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
