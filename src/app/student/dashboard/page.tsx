"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast, Toaster } from "sonner"
import { User, FileText, Briefcase, Settings, LogOut } from "lucide-react"
import StudentProfile from "@/components/student/student-profile"
import StudentDocuments from "@/components/student/student-documents"
import StudentApplications from "@/components/student/student-applications"
import StudentSettings from "@/components/student/student-settings"

interface StudentData {
  _id: string
  firstName: string
  lastName: string
  email: string
  profileCompleted: boolean
}

export default function StudentDashboard() {
  const router = useRouter()
  const [student, setStudent] = useState<StudentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch("/api/student/profile")

        if (response.status === 401) {
          router.push("/auth/login")
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch student data")
        }

        const data = await response.json()
        setStudent(data.student)
      } catch (error) {
        toast.error("Error loading profile data")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentData()
  }, [router])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
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

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="profile" className="flex items-center justify-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center justify-center">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center justify-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <StudentProfile student={student} />
          </TabsContent>

          <TabsContent value="documents">
            <StudentDocuments studentId={student._id} />
          </TabsContent>

          <TabsContent value="applications">
            <StudentApplications studentId={student._id} />
          </TabsContent>

          <TabsContent value="settings">
            <StudentSettings studentId={student._id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
