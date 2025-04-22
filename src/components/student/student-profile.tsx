"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, User } from "lucide-react"

interface StudentData {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  gender?: string
  dob?: string
  currentCity?: string
  currentState?: string
  profileOutline?: string
  education?: Array<{
    level: string
    mode:string
    degree: string
    school: string
  }>
  skills?: string[]
  profileCompleted: boolean
}

interface StudentProfileProps {
  student: StudentData
}

export default function StudentProfile({ student }: StudentProfileProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        <Button variant="outline" onClick={() => router.push("/student/profile/edit")}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center mb-4">
              {student.profileCompleted ? (
                <img
                  src="/placeholder.svg?height=128&width=128"
                  alt={`${student.firstName} ${student.lastName}`}
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-gray-400" />
              )}
            </div>
            <CardTitle>
              {student.firstName} {student.lastName}
            </CardTitle>
            <CardDescription>{student.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {student.phone && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <p>{student.phone}</p>
                </div>
              )}

              {student.currentCity && student.currentState && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p>
                    {student.currentCity}, {student.currentState}
                  </p>
                </div>
              )}

              {!student.profileCompleted && (
                <div className="pt-4">
                  <Button className="w-full" onClick={() => router.push("/student/profile/edit")}>
                    Complete Your Profile
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {student.profileOutline ? (
                <p>{student.profileOutline}</p>
              ) : (
                <p className="text-gray-500 italic">No profile information available. Please complete your profile.</p>
              )}

              {student.education && student.education.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Education</h3>
                  <div className="space-y-2">
                    {student.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-4 py-1">
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.school}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {student.skills && student.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
