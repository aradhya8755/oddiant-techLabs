"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EmployeeFormData } from "@/app/auth/employee/register/page"
import { Eye, EyeOff } from "lucide-react"

interface AccountSetupFormProps {
  formData: EmployeeFormData
  updateFormData: (data: Partial<EmployeeFormData>) => void
}

export default function EmployeeAccountSetup({ formData, updateFormData }: AccountSetupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  // List of disallowed email domains
  const disallowedDomains = [
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "yahoo.com",
    "icloud.com",
    "zoho.com",
    "gmx.com",
    "mail.com",
    "yandex.com",
    "aol.com",
  ]

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return "Email is required"
    if (!emailRegex.test(email)) return "Please enter a valid email address"

    // Extract domain from email
    const domain = email.split("@")[1].toLowerCase()

    // Check if domain is in the disallowed list
    if (disallowedDomains.includes(domain)) {
      return "Personal email domains are not allowed. Please use your company email address."
    }

    return ""
  }

  const validatePassword = (password: string) => {
    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters"
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/[0-9]/.test(password)) return "Password must contain at least one number"
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character"
    return ""
  }

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return "Please confirm your password"
    if (password !== confirmPassword) return "Passwords do not match"
    return ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Validate fields
    if (name === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }))
    } else if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
        confirmPassword: validateConfirmPassword(value, formData.confirmPassword),
      }))
    } else if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(formData.password, value),
      }))
    }

    updateFormData({ [name]: value })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">
          Company Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@domain.com"
          value={formData.email}
          onChange={handleChange}
          required
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        <p className="text-xs text-gray-500">
          You must use your official company email address (personal email domains are not allowed)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            className={errors.password ? "border-red-500" : ""}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        <p className="text-xs text-gray-500">
          Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirm Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
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
    </div>
  )
}
