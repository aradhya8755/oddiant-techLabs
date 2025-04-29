"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, KeyRound } from "lucide-react"

export default function EmployeeResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({
    resetToken: "",
    newPassword: "",
    confirmPassword: "",
  })

  const validatePassword = (password: string) => {
    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters"
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/[0-9]/.test(password)) return "Password must contain at least one number"
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character"
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newPasswordError = validatePassword(newPassword)
    const confirmPasswordError = !confirmPassword
      ? "Please confirm your password"
      : newPassword !== confirmPassword
        ? "Passwords do not match"
        : ""
    const resetTokenError = !resetToken ? "Reset token is required" : ""

    setErrors({
      resetToken: resetTokenError,
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError,
    })

    if (resetTokenError || newPasswordError || confirmPasswordError) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/employee/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetToken, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password")
      }

      toast.success("Password reset successful")
      router.push("/auth/employee/login")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <KeyRound className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter the reset code sent to your email and create a new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resetToken">Reset Code</Label>
              <Input
                id="resetToken"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Enter the 6-digit code"
                required
                className={errors.resetToken ? "border-red-500" : ""}
              />
              {errors.resetToken && <p className="text-sm text-red-500">{errors.resetToken}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={errors.newPassword ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link href="/auth/employee/login" className="text-purple-600 hover:underline">
              Back to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
