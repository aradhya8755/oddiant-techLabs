"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock } from "lucide-react"

export default function VerifyPendingPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const userType = searchParams.get("userType") || "employee"

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verification Pending</CardTitle>
          <CardDescription>
            Thank you for verifying your email address. Your account is now pending approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Next Steps
            </h3>
            <p className="text-yellow-700 text-sm">
              Our technical team will review your information within the next 48 hours. Once approved, you will receive
              an email notification at <span className="font-medium">{email}</span> with instructions to access your
              account.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">What happens next?</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Your email has been verified</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">⟳</span>
                <span>Our team is reviewing your application</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">○</span>
                <span>You'll receive an email once your account is approved</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">○</span>
                <span>You can then sign in to access your dashboard</span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 text-center pt-4">
            If you have any questions, please contact our support team at{" "}
            <a href="mailto:support@oddiant.com" className="text-blue-600 hover:underline">
              support@oddiant.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
