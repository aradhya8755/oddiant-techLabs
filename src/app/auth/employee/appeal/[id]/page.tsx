"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface EmployeeData {
  employee: {
    firstName: string | null
    middleName: string | null
    lastName: string | null
    phone: string | null
    designation: string | null
    linkedinProfile: string | null
    companyName: string | null
    companyLocation: string | null
    companyIndustry: string | null
    teamSize: string | null
    documentType: string | null
    kycNumber: string | null
    email: string | null
    rejectionReason?: string | null
    rejectionComments?: string | null
    kycDetails?: {
      documentType: string | null
      kycNumber: string | null
    }
  }
}

// Custom notification component to replace toast
interface NotificationProps {
  title: string
  description: string
  variant?: "default" | "destructive"
  onClose: () => void
}

function Notification({ title, description, variant = "default", onClose }: NotificationProps) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg flex items-start gap-3 ${
        variant === "destructive"
          ? "bg-red-50 border border-red-200 text-red-800"
          : "bg-green-50 border border-green-200 text-green-800"
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {variant === "destructive" ? (
          <AlertCircle className="h-5 w-5 text-red-600" />
        ) : (
          <CheckCircle className="h-5 w-5 text-green-600" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-sm mt-1">{description}</p>
      </div>
      <button onClick={onClose} className="shrink-0">
        <X className="h-4 w-4 opacity-70" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

export default function AppealPage() {
  const router = useRouter()
  const { id } = useParams()
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Custom notification state
  const [notification, setNotification] = useState<{
    show: boolean
    title: string
    description: string
    variant: "default" | "destructive"
  } | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    designation: "",
    linkedinProfile: "",
    companyName: "",
    companyLocation: "",
    companyIndustry: "",
    teamSize: "",
    documentType: "",
    documentNumber: "",
    email: "",
    documentFile: null as File | null,
    reason: "",
  })

  // Function to show notification (replacement for toast)
  const showNotification = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    setNotification({
      show: true,
      title,
      description,
      variant,
    })

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Use the correct API endpoint
        const response = await fetch(`/api/employee/appeal/${id}`, {
          cache: "no-store",
          headers: {
            pragma: "no-cache",
            "cache-control": "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setEmployeeData(data)
        console.log("Employee data:", data)

        // Initialize form data with existing values
        setFormData({
          firstName: data.employee.firstName || "",
          middleName: data.employee.middleName || "",
          lastName: data.employee.lastName || "",
          phone: data.employee.phone || "",
          designation: data.employee.designation || "",
          linkedinProfile: data.employee.linkedinProfile || "",
          companyName: data.employee.companyName || "",
          companyLocation: data.employee.companyLocation || "",
          companyIndustry: data.employee.companyIndustry || "",
          teamSize: data.employee.teamSize || "",
          documentType: data.employee.documentType || data.employee.kycDetails?.documentType || "",
          documentNumber: data.employee.kycNumber || data.employee.kycDetails?.kycNumber || "",
          email: data.employee.email || "",
          documentFile: null,
          reason: "",
        })
      } catch (error) {
        console.error("Could not fetch employee data:", error)
        showNotification("Error!", "Failed to fetch employee data. Please try again.", "destructive")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployeeData()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFormData((prevState) => ({
      ...prevState,
      documentFile: file || null,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()

      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString())
        }
      })

      // Add the employee ID
      formDataToSend.append("employeeId", id.toString())

      // Log the form data being sent (for debugging)
      console.log("Submitting appeal with data:", Object.fromEntries(formDataToSend))

      const response = await fetch(`/api/employee/appeal`, {
        method: "POST",
        body: formDataToSend,
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Appeal submission result:", result)

        showNotification("Success!", "Appeal submitted successfully!")

        // Redirect after successful submission
        setTimeout(() => {
          router.push("/auth/employee")
        }, 2000)
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)

        showNotification("Error!", errorData.message || "Failed to submit appeal. Please try again.", "destructive")
      }
    } catch (error) {
      console.error("Error submitting appeal:", error)
      showNotification("Error!", "An unexpected error occurred. Please try again.", "destructive")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="w-[200px] h-[30px] mb-4" />
        <div className="space-y-2">
          <Skeleton className="w-[150px] h-[20px]" />
          <Skeleton className="w-full h-[40px]" />
        </div>
        <div className="space-y-2 mt-4">
          <Skeleton className="w-[150px] h-[20px]" />
          <Skeleton className="w-full h-[40px]" />
        </div>
        <Skeleton className="w-[100px] h-[40px] mt-4" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {/* Render notification if it exists */}
      {notification && notification.show && (
        <Notification
          title={notification.title}
          description={notification.description}
          variant={notification.variant}
          onClose={() => setNotification(null)}
        />
      )}

      <h1 className="text-2xl font-bold mb-4 text-white">Appeal Form</h1>

      {employeeData?.employee?.rejectionReason && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Your application was rejected</AlertTitle>
          <AlertDescription>
            <p>
              <strong>Reason:</strong> {employeeData.employee.rejectionReason}
            </p>
            {employeeData.employee.rejectionComments && (
              <p className="mt-2 text-white">
                <strong>Comments:</strong> {employeeData.employee.rejectionComments}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-white">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 text-white">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                required
              />
            </div>
            <div className="space-y-2 text-white">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                placeholder="Middle Name"
              />
            </div>
            <div className="space-y-2 text-white">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 text-white">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                required
              />
            </div>
            <div className="space-y-2 text-white">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 text-white">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="Designation"
                required
              />
            </div>
            <div className="space-y-2 text-white">
              <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
              <Input
                id="linkedinProfile"
                name="linkedinProfile"
                value={formData.linkedinProfile}
                onChange={handleInputChange}
                placeholder="LinkedIn Profile URL"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Company Information */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-white">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-white">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Company Name"
                required
              />
            </div>
            <div className="space-y-2 text-white">
              <Label htmlFor="companyLocation">Company Location</Label>
              <Input
                id="companyLocation"
                name="companyLocation"
                value={formData.companyLocation}
                onChange={handleInputChange}
                placeholder="Company Location"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 text-white">
              <Label htmlFor="companyIndustry">Company Industry</Label>
              <Input
                id="companyIndustry"
                name="companyIndustry"
                value={formData.companyIndustry}
                onChange={handleInputChange}
                placeholder="Company Industry"
                required
              />
            </div>
            <div className="space-y-2 text-white">
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleInputChange}
                placeholder="Team Size"
                required
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Document Information */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-white">Update KYC Documents</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-white">
              <Label htmlFor="documentType">Document Type</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) => handleSelectChange("documentType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Passport">Passport</SelectItem>
                  <SelectItem value="Driving License">Driving License</SelectItem>
                  <SelectItem value="National ID">National ID</SelectItem>
                  <SelectItem value="Voter ID">Voter ID</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 text-white">
              <Label htmlFor="documentNumber">Document Number</Label>
              <Input
                id="documentNumber"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleInputChange}
                placeholder="Enter document number"
                required
              />
            </div>
          </div>

          <div className="space-y-2 mt-4 text-white">
            <Label htmlFor="documentFile">Upload Document</Label>
            <Input
              type="file"
              id="documentFile"
              name="documentFile"
              onChange={handleFileChange}
              accept=".pdf,.jpeg,.png,.jpg"
              required={!formData.documentNumber}
            />
            {formData.documentFile && (
              <p className="text-sm text-green-600 mt-1">Selected File: {formData.documentFile.name}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Reason for Appeal */}
        <div className="space-y-2 text-white">
          <Label htmlFor="reason">Reason for Appeal</Label>
          <Textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            placeholder="Please explain why you are appealing the rejection and what changes you have made to address the concerns."
            className="resize-none"
            rows={5}
            required
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? "Submitting..." : "Submit Appeal"}
        </Button>
      </form>
    </div>
  )
}
