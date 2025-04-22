"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EmployeeFormData } from "@/app/auth/employee/register/page"

interface PersonalDetailsFormProps {
  formData: EmployeeFormData
  updateFormData: (data: Partial<EmployeeFormData>) => void
}

export default function EmployeePersonalDetails({ formData, updateFormData }: PersonalDetailsFormProps) {
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    designation: "",
  })

  const validateField = (name: string, value: string) => {
    if (name === "firstName" || name === "lastName") {
      return !value ? `${name === "firstName" ? "First" : "Last"} name is required` : ""
    }
    if (name === "phone") {
      if (!value) return "Phone number is required"
      if (!/^\d{10}$/.test(value.replace(/\D/g, ""))) return "Please enter a valid 10-digit phone number"
      return ""
    }
    if (name === "designation") {
      return !value ? "Designation is required" : ""
    }
    return ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Validate field
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))

    updateFormData({ [name]: value })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 1234567890"
          required
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="designation">
          Designation <span className="text-red-500">*</span>
        </Label>
        <Input
          id="designation"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          placeholder="e.g., Senior Developer, HR Manager"
          required
          className={errors.designation ? "border-red-500" : ""}
        />
        {errors.designation && <p className="text-sm text-red-500">{errors.designation}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedinProfile">LinkedIn Profile Link</Label>
        <Input
          id="linkedinProfile"
          name="linkedinProfile"
          value={formData.linkedinProfile}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/your-profile"
        />
      </div>
    </div>
  )
}
