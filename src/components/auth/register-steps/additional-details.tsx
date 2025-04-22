"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { FormData } from "../register-form"
import { X, Upload } from "lucide-react"

interface AdditionalDetailsFormProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

export default function AdditionalDetailsForm({ formData, updateFormData }: AdditionalDetailsFormProps) {
  const [skillInput, setSkillInput] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    if (e.target.files && e.target.files[0]) {
      updateFormData({ [field]: e.target.files[0] })
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && formData.skills.length < 15) {
      updateFormData({
        skills: [...formData.skills, skillInput.trim()],
      })
      setSkillInput("")
    }
  }

  const removeSkill = (index: number) => {
    const updatedSkills = [...formData.skills]
    updatedSkills.splice(index, 1)
    updateFormData({ skills: updatedSkills })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>
          Skills / Technologies (Max 15) <span className="text-red-500">*</span>
        </Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Enter skill or technology"
            disabled={formData.skills.length >= 15}
          />
          <Button type="button" onClick={addSkill} disabled={!skillInput.trim() || formData.skills.length >= 15}>
            Add
          </Button>
        </div>
        {formData.skills.length >= 15 && <p className="text-sm text-amber-600">Maximum 15 skills allowed</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolioLink">Portfolio Link</Label>
        <Input
          id="portfolioLink"
          name="portfolioLink"
          value={formData.portfolioLink}
          onChange={handleChange}
          placeholder="https://your-portfolio.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="socialMediaLink">Social Media Link</Label>
        <Input
          id="socialMediaLink"
          name="socialMediaLink"
          value={formData.socialMediaLink}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/your-profile"
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium">Documents</h3>

        <div className="space-y-2">
          <Label htmlFor="resume">
            Resume (PDF/DOC) <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, "resume")}
              className="hidden"
            />
            <div className="flex-1 border rounded-md overflow-hidden">
              <label htmlFor="resume" className="flex items-center justify-between cursor-pointer">
                <span className="px-3 py-2 text-sm truncate">
                  {formData.resume ? formData.resume.name : "No file chosen"}
                </span>
                <span className="bg-gray-100 px-3 py-2 border-l text-gray-600 flex items-center">
                  <Upload className="h-4 w-4 mr-1" />
                  Browse
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="videoResume">Video Resume (MP4)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="videoResume"
              type="file"
              accept=".mp4,.mov,.avi"
              onChange={(e) => handleFileChange(e, "videoResume")}
              className="hidden"
            />
            <div className="flex-1 border rounded-md overflow-hidden">
              <label htmlFor="videoResume" className="flex items-center justify-between cursor-pointer">
                <span className="px-3 py-2 text-sm truncate">
                  {formData.videoResume ? formData.videoResume.name : "No file chosen"}
                </span>
                <span className="bg-gray-100 px-3 py-2 border-l text-gray-600 flex items-center">
                  <Upload className="h-4 w-4 mr-1" />
                  Browse
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audioBiodata">Audio Biodata (MP3)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="audioBiodata"
              type="file"
              accept=".mp3,.wav"
              onChange={(e) => handleFileChange(e, "audioBiodata")}
              className="hidden"
            />
            <div className="flex-1 border rounded-md overflow-hidden">
              <label htmlFor="audioBiodata" className="flex items-center justify-between cursor-pointer">
                <span className="px-3 py-2 text-sm truncate">
                  {formData.audioBiodata ? formData.audioBiodata.name : "No file chosen"}
                </span>
                <span className="bg-gray-100 px-3 py-2 border-l text-gray-600 flex items-center">
                  <Upload className="h-4 w-4 mr-1" />
                  Browse
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photograph">Photograph (JPG/PNG)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="photograph"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, "photograph")}
              className="hidden"
            />
            <div className="flex-1 border rounded-md overflow-hidden">
              <label htmlFor="photograph" className="flex items-center justify-between cursor-pointer">
                <span className="px-3 py-2 text-sm truncate">
                  {formData.photograph ? formData.photograph.name : "No file chosen"}
                </span>
                <span className="bg-gray-100 px-3 py-2 border-l text-gray-600 flex items-center">
                  <Upload className="h-4 w-4 mr-1" />
                  Browse
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
