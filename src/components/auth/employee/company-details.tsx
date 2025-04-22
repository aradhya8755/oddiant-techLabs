"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EmployeeFormData } from "@/app/auth/employee/register/page"
import { Plus, X } from "lucide-react"

interface CompanyDetailsFormProps {
  formData: EmployeeFormData
  updateFormData: (data: Partial<EmployeeFormData>) => void
}

const industries = [
  "Information Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Hospitality",
  "Real Estate",
  "Construction",
  "Transportation",
  "Media & Entertainment",
  "Telecommunications",
  "Energy",
  "Agriculture",
  "Other",
]

const teamSizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"]

export default function EmployeeCompanyDetails({ formData, updateFormData }: CompanyDetailsFormProps) {
  const [errors, setErrors] = useState({
    companyName: "",
    companyLocation: "",
    companyIndustry: "",
    teamSize: "",
  })
  const [socialMediaInput, setSocialMediaInput] = useState("")

  const validateField = (name: string, value: string) => {
    if (name === "companyName" || name === "companyLocation") {
      return !value ? `${name === "companyName" ? "Company name" : "Company location"} is required` : ""
    }
    if (name === "companyIndustry") {
      return !value ? "Industry is required" : ""
    }
    if (name === "teamSize") {
      return !value ? "Team size is required" : ""
    }
    return ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Validate field
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))

    updateFormData({ [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    // Validate field
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))

    updateFormData({ [name]: value })
  }

  const addSocialMediaLink = () => {
    if (socialMediaInput.trim() && formData.socialMediaLinks.length < 3) {
      updateFormData({
        socialMediaLinks: [...formData.socialMediaLinks, socialMediaInput.trim()],
      })
      setSocialMediaInput("")
    }
  }

  const removeSocialMediaLink = (index: number) => {
    const updatedLinks = [...formData.socialMediaLinks]
    updatedLinks.splice(index, 1)
    updateFormData({ socialMediaLinks: updatedLinks })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">
          Company Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          required
          className={errors.companyName ? "border-red-500" : ""}
        />
        {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyLocation">
          Company Location <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyLocation"
          name="companyLocation"
          value={formData.companyLocation}
          onChange={handleChange}
          placeholder="City, State, Country"
          required
          className={errors.companyLocation ? "border-red-500" : ""}
        />
        {errors.companyLocation && <p className="text-sm text-red-500">{errors.companyLocation}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyIndustry">
            Industry <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.companyIndustry}
            onValueChange={(value) => handleSelectChange("companyIndustry", value)}
          >
            <SelectTrigger id="companyIndustry" className={errors.companyIndustry ? "border-red-500" : ""}>
              <SelectValue placeholder="Select industry">{formData.companyIndustry || "Select industry"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companyIndustry && <p className="text-sm text-red-500">{errors.companyIndustry}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamSize">
            Team Size <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.teamSize} onValueChange={(value) => handleSelectChange("teamSize", value)}>
            <SelectTrigger id="teamSize" className={errors.teamSize ? "border-red-500" : ""}>
              <SelectValue placeholder="Select team size">{formData.teamSize || "Select team size"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {teamSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.teamSize && <p className="text-sm text-red-500">{errors.teamSize}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aboutCompany">About Company</Label>
        <Textarea
          id="aboutCompany"
          name="aboutCompany"
          value={formData.aboutCompany}
          onChange={handleChange}
          placeholder="Brief description about your company"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyWebsite">Company Website</Label>
        <Input
          id="companyWebsite"
          name="companyWebsite"
          value={formData.companyWebsite}
          onChange={handleChange}
          placeholder="https://www.example.com"
        />
      </div>

      <div className="space-y-2">
        <Label>Company Social Media Links (Max 3)</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.socialMediaLinks.map((link, index) => (
            <div key={index} className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
              <span className="text-sm">{link}</span>
              <button
                type="button"
                onClick={() => removeSocialMediaLink(index)}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            value={socialMediaInput}
            onChange={(e) => setSocialMediaInput(e.target.value)}
            placeholder="https://twitter.com/company"
            disabled={formData.socialMediaLinks.length >= 3}
          />
          <Button
            type="button"
            onClick={addSocialMediaLink}
            disabled={!socialMediaInput.trim() || formData.socialMediaLinks.length >= 3}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.socialMediaLinks.length >= 3 && (
          <p className="text-sm text-amber-600">Maximum 3 social media links allowed</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyLinkedin">Company LinkedIn Page</Label>
        <Input
          id="companyLinkedin"
          name="companyLinkedin"
          value={formData.companyLinkedin}
          onChange={handleChange}
          placeholder="https://linkedin.com/company/your-company"
        />
      </div>
    </div>
  )
}
