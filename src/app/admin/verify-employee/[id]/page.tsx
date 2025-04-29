"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast, Toaster } from "sonner"
import { CheckCircle, XCircle, User, MapPin, Building, Phone, Mail, FileText, ArrowLeft, Link } from "lucide-react"
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

export default function VerifyEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const employeeId = params.id as string

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(`/api/admin/employee/${employeeId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch employee data")
        }

        const data = await response.json()
        setEmployee(data.employee)
      } catch (error) {
        toast.error("Error loading employee data")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    if (employeeId) {
      fetchEmployeeData()
    }
  }, [employeeId])

  const handleVerify = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/verify-employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          action: "approve",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to verify employee")
      }

      toast.success("Employee verified successfully")
      setTimeout(() => {
        router.push("/admin/employees")
      }, 2000)
    } catch (error) {
      toast.error("Failed to verify employee")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = () => {
    router.push(`/admin/verify-employee/${employeeId}/reject`)
  }

  const handleDelete = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/employee/${employeeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete employee")
      }

      toast.success("Employee deleted successfully")
      setTimeout(() => {
        router.push("/admin/employees")
      }, 2000)
    } catch (error) {
      toast.error("Failed to delete employee")
      console.error(error)
    } finally {
      setIsProcessing(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleBackToEmployees = () => {
    router.push("/admin/employees")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Employee Not Found</CardTitle>
            <CardDescription>The employee you are looking for does not exist or has been removed.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/admin/employees")} className="w-full">
              Back to Employees
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Fix for website URL - ensure it has proper protocol
  const formatWebsiteUrl = (url: string) => {
    if (!url) return ""
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
    return `https://${url}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBackToEmployees} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>
        </div>

        <Card>
          <CardHeader className="bg-purple-50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Verify Employee Account</CardTitle>
                <CardDescription>
                  Review the information below and approve or reject this employee account
                </CardDescription>
              </div>
              <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-600 border border-purple-200">
                {employee.rejected ? "Previously Rejected" : "Pending Verification"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <User className="mr-2 h-5 w-5 text-purple-500" />
                  Personal Information
                </h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p>
                      {employee.firstName} {employee.middleName} {employee.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-400" />
                      {employee.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                      {employee.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Designation</p>
                    <p>{employee.designation}</p>
                  </div>
                  {/* Add LinkedIn Profile */}
                  <div>
                    <p className="text-sm font-medium text-gray-500">LinkedIn Profile</p>
                    {employee.linkedinProfile ? (
                      <a
                        href={formatWebsiteUrl(employee.linkedinProfile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <Link className="h-4 w-4 mr-1 text-gray-400" />
                        {employee.linkedinProfile}
                      </a>
                    ) : (
                      <p className="text-gray-400">Not provided</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Building className="mr-2 h-5 w-5 text-purple-500" />
                  Company Information
                </h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                    <p>{employee.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {employee.companyLocation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Industry</p>
                    <p>{employee.companyIndustry}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Team Size</p>
                    <p>{employee.teamSize}</p>
                  </div>
                </div>
                {employee.aboutCompany && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-500">About Company</p>
                    <p className="text-sm mt-1">{employee.aboutCompany}</p>
                  </div>
                )}
                {employee.companyWebsite && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-500">Website</p>
                    <a
                      href={formatWebsiteUrl(employee.companyWebsite)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {employee.companyWebsite}
                    </a>
                  </div>
                )}
                {/* Add Company LinkedIn */}
                {employee.companyLinkedin && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-500">Company LinkedIn</p>
                    <a
                      href={formatWebsiteUrl(employee.companyLinkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <Link className="h-4 w-4 mr-1" />
                      {employee.companyLinkedin}
                    </a>
                  </div>
                )}
                {/* Add Social Media Links */}
                {employee.socialMediaLinks && employee.socialMediaLinks.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-500">Social Media</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {employee.socialMediaLinks.map((link: string, index: number) => (
                        <a
                          key={index}
                          href={formatWebsiteUrl(link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm bg-blue-50 px-2 py-1 rounded-md"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-purple-500" />
                  KYC Documents
                </h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Document Type</p>
                    <p className="capitalize">{employee.documentType || employee.kycDetails?.documentType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Document Number</p>
                    <p>{employee.kycNumber || employee.kycDetails?.kycNumber}</p>
                  </div>
                </div>
                {employee.documents?.kyc && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-500">Document</p>
                    <a
                      href={employee.documents.kyc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center mt-1"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Document
                    </a>
                  </div>
                )}
              </div>

              {employee.rejected && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium text-red-600">Previous Rejection Details</h3>
                    <div className="mt-3 bg-red-50 p-4 rounded-md border border-red-100">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                        <p className="text-red-700">{employee.rejectionReason || "Not specified"}</p>
                      </div>
                      {employee.rejectionComments && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-500">Comments</p>
                          <p className="text-sm mt-1 text-gray-700">{employee.rejectionComments}</p>
                        </div>
                      )}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-500">Rejected On</p>
                        <p className="text-sm text-gray-700">{new Date(employee.rejectedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Add Appeal Information Section */}
              {employee.appealReason && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium text-blue-600">Appeal Information</h3>
                    <div className="mt-3 bg-blue-50 p-4 rounded-md border border-blue-100">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Appeal Reason</p>
                        <p className="text-blue-700">{employee.appealReason || "Not specified"}</p>
                      </div>
                      {employee.appealedAt && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-500">Appealed On</p>
                          <p className="text-sm text-gray-700">{new Date(employee.appealedAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isProcessing}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
            <Button onClick={handleVerify} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Approve Employee"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee account and all associated data
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

