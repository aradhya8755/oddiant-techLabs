"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase } from "lucide-react"
import EmployeeAccountSetup from "@/components/auth/employee/account-setup"
import EmployeePersonalDetails from "@/components/auth/employee/personal-details"
import EmployeeCompanyDetails from "@/components/auth/employee/company-details"
import EmployeeDocuments from "@/components/auth/employee/documents"

export type EmployeeFormData = {
  // Account Setup
  email: string
  password: string
  confirmPassword: string

  // Personal Details
  firstName: string
  middleName: string
  lastName: string
  phone: string
  designation: string
  linkedinProfile: string

  // Company Details
  companyName: string
  companyLocation: string
  companyIndustry: string
  teamSize: string
  aboutCompany: string
  companyWebsite: string
  socialMediaLinks: string[]
  companyLinkedin: string

  // Documents
  kycDocument: File | null
}

const initialFormData: EmployeeFormData = {
  // Account Setup
  email: "",
  password: "",
  confirmPassword: "",

  // Personal Details
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  designation: "",
  linkedinProfile: "",

  // Company Details
  companyName: "",
  companyLocation: "",
  companyIndustry: "",
  teamSize: "",
  aboutCompany: "",
  companyWebsite: "",
  socialMediaLinks: [],
  companyLinkedin: "",

  // Documents
  kycDocument: null,
}

const steps = [
  { id: "account", label: "Account" },
  { id: "personal", label: "Personal" },
  { id: "company", label: "Company" },
  { id: "documents", label: "Documents" },
]

export default function EmployeeRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateFormData = (stepData: Partial<EmployeeFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Create FormData object for file uploads
      const formDataObj = new FormData()

      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "kycDocument" && key !== "socialMediaLinks") {
          if (value !== null) {
            formDataObj.append(key, value as string)
          }
        }
      })

      // Add social media links as JSON
      formDataObj.append("socialMediaLinks", JSON.stringify(formData.socialMediaLinks))

      // Add file fields
      if (formData.kycDocument) {
        formDataObj.append("kycDocument", formData.kycDocument)
      }

      const response = await fetch("/api/auth/employee/register", {
        method: "POST",
        body: formDataObj,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      toast.success("Registration successful! Please verify your email.")
      router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&userType=employee`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <EmployeeAccountSetup formData={formData} updateFormData={updateFormData} />
      case 1:
        return <EmployeePersonalDetails formData={formData} updateFormData={updateFormData} />
      case 2:
        return <EmployeeCompanyDetails formData={formData} updateFormData={updateFormData} />
      case 3:
        return <EmployeeDocuments formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-16">
      <Toaster position="top-center" />
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Briefcase className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Employee Registration</CardTitle>
          <CardDescription className="text-center">Create your employee account at Oddiant Techlabs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2.5">
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`text-sm font-medium ${index <= currentStep ? "text-purple-600" : "text-gray-400"}`}
                >
                  {step.label}
                </div>
              ))}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Form steps */}
          <div className="mt-6">{renderStep()}</div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isSubmitting}
            >
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/employee/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
