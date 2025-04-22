"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast, Toaster } from "sonner"
import { User, FileText, Briefcase, Settings, LogOut, Users, BarChart, Calendar } from "lucide-react"

interface EmployeeData {
  _id: string
  firstName: string
  lastName: string
  email: string
  designation: string
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Users className="h-8 w-8 mb-2" />
              <p className="text-2xl font-bold">128</p>
              <p className="text-sm opacity-80">Total Employees</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Briefcase className="h-8 w-8 mb-2" />
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm opacity-80">Active Projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Calendar className="h-8 w-8 mb-2" />
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm opacity-80">Upcoming Events</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <BarChart className="h-8 w-8 mb-2" />
              <p className="text-2xl font-bold">92%</p>
              <p className="text-sm opacity-80">Task Completion</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="overview" className="flex items-center justify-center">
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center justify-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center justify-center">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
                <CardDescription>Welcome to your employee dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  This is a placeholder for the employee dashboard overview. In a real implementation, this would show
                  personalized data and metrics relevant to {employee.firstName} {employee.lastName}.
                </p>
                <p className="mt-4">Current role: {employee.designation || "Employee"}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Your assigned projects and tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  This is a placeholder for the projects section. In a real implementation, this would show projects
                  assigned to {employee.firstName} {employee.lastName}.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Access and manage your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  This is a placeholder for the documents section. In a real implementation, this would show documents
                  relevant to {employee.firstName} {employee.lastName}.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  This is a placeholder for the settings section. In a real implementation, this would allow{" "}
                  {employee.firstName} {employee.lastName} to update their profile and preferences.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
