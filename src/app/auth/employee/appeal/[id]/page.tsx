"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast, Toaster } from "sonner"
import { AlertCircle, FileText, Upload } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function AppealPage() {
  const params = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    documentType: "",
    documentNumber: "",
    documentFile: null as File | null,
    appealReason: "",
  })
  const employeeId = params.id as string

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(`/api/employee/appeal/${employeeId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch employee data")
        }

        const data = await response.json()
        setEmployee(data.employee)

        // Initialize form data with existing values
        setFormData({
          documentType: data.employee.documentType || data.employee.kycDetails?.documentType || "",
          documentNumber: data.employee.kycNumber || data.employee.kycDetails?.kycNumber || "",
          documentFile: null,
          appealReason: "",
        })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, documentFile: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.documentType || !formData.documentNumber) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.documentFile && !employee.documents?.kyc) {
      toast.error("Please upload a document")
      return
    }

    setIsSubmitting(true)

    try {
      // Create form data for file upload
      const submitData = new FormData()
      submitData.append("employeeId", employeeId)
      submitData.append("documentType", formData.documentType)
      submitData.append("documentNumber", formData.documentNumber)
      submitData.append("appealReason", formData.appealReason)

      if (formData.documentFile) {
        submitData.append("document", formData.documentFile)
      }

      const response = await fetch("/api/employee/appeal", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit appeal")
      }

      toast.success("Appeal submitted successfully")
      setTimeout(() => {
        router.push("/auth/appeal-submitted")
      }, 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit appeal")
    } finally {
      setIsSubmitting(false)
    }
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
            <CardDescription>
              The employee record you are looking for does not exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/auth/employee/login")} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!employee.rejected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Appeal Not Available</CardTitle>
            <CardDescription>This account is not eligible for appeal.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/auth/employee/login")} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-2xl">Appeal Rejection & Update Information</CardTitle>
            <CardDescription>Update your information and documents to appeal the rejection decision</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              {/* Rejection Details */}
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <h3 className="font-medium text-amber-800 mb-2">Rejection Details</h3>
                <p className="text-sm text-amber-700 mb-2">
                  <strong>Reason:</strong> {employee.rejectionReason || "Not specified"}
                </p>
                {employee.rejectionComments && (
                  <p className="text-sm text-amber-700">
                    <strong>Comments:</strong> {employee.rejectionComments}
                  </p>
                )}
              </div>

              <Separator />

              {/* Document Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Update KYC Documents</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                   <select>
                    <option value="" disabled>  
                Select document type
              </option>
              <option value="gst">GST Certificate</option>
              <option value="pan">PAN Card</option>
              <option value="incorporation_certificate">Incorporation Certificate</option>
            </select>
                      <Input
                        id="documentType"
                        name="documentType"
                        value={formData.documentType}
                        onChange={handleInputChange}
                        placeholder="Passport, ID Card, etc."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">
                        Document Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="documentNumber"
                        name="documentNumber"
                        value={formData.documentNumber}
                        onChange={handleInputChange}
                        placeholder="Document ID number"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentFile">
                      Upload Document {!employee.documents?.kyc && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        {formData.documentFile ? formData.documentFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-400 mb-4">PDF, JPG, or PNG (max 5MB)</p>
                      <Input
                        id="documentFile"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("documentFile")?.click()}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Select File
                      </Button>
                    </div>
                    {employee.documents?.kyc && !formData.documentFile && (
                      <p className="text-xs text-gray-500 mt-2">
                        Current document: {employee.documents.kyc.filename || "Document.pdf"}
                        <a
                          href={employee.documents.kyc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-2"
                        >
                          View
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Appeal Reason */}
              <div className="space-y-2">
                <Label htmlFor="appealReason">Reason for Appeal</Label>
                <Textarea
                  id="appealReason"
                  name="appealReason"
                  value={formData.appealReason}
                  onChange={handleInputChange}
                  placeholder="Please explain why you are appealing this decision and any additional information that might help us reconsider..."
                  rows={5}
                  className="resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800 mb-1">What happens next?</h3>
                  <p className="text-blue-700 text-sm">
                    After submitting your appeal, our team will review your updated information within 48 hours. You
                    will receive an email notification once a decision has been made.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/auth/employee/login")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Submitting..." : "Submit Appeal"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
