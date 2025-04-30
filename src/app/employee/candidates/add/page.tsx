"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast, Toaster } from "sonner"
import CandidateForm from "@/components/candidate-form"

export default function AddCandidatePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (candidateData: any) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/employee/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(candidateData),
      })

      if (!response.ok) {
        throw new Error("Failed to add candidate")
      }

      const data = await response.json()
      toast.success("Candidate added successfully!")

      // Navigate back to the dashboard after successful submission
      setTimeout(() => {
        router.push("/employee/dashboard?tab=candidates")
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error adding candidate:", error)
      toast.error("Failed to add candidate")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Add New Candidate</CardTitle>
            <CardDescription>Fill in the details to add a new candidate</CardDescription>
          </CardHeader>
          <CardContent>
            <CandidateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
