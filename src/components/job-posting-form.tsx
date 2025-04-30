"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface JobPostingFormProps {
  jobId?: string
  isEditing?: boolean
  isSubmitting?: boolean
  onSubmit?: (data: any) => Promise<void>
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({
  jobId,
  isEditing = false,
  isSubmitting = false,
  onSubmit,
}) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [jobTitle, setJobTitle] = useState("")
  const [jobLocation, setJobLocation] = useState("")
  const [experienceRange, setExperienceRange] = useState("")
  const [jobType, setJobType] = useState("")
  const [salaryRange, setSalaryRange] = useState("")
  const [industry, setIndustry] = useState("")
  const [department, setDepartment] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [educationalPreference, setEducationalPreference] = useState("")
  const [shiftPreference, setShiftPreference] = useState<string[]>([])
  const [assetsRequirement, setAssetsRequirement] = useState({
    wifi: false,
    laptop: false,
    vehicle: false,
  })
  const [companyName, setCompanyName] = useState("")
  const [aboutCompany, setAboutCompany] = useState("")
  const [websiteLink, setWebsiteLink] = useState("")
  const [questions, setQuestions] = useState<string[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [answers, setAnswers] = useState<string[]>([])

  useEffect(() => {
    if (jobId && isEditing) {
      fetchJobDetails()
    }
  }, [jobId, isEditing])

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/employee/jobs/${jobId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch job details")
      }

      const data = await response.json()
      const job = data.job

      // Populate form fields with job data
      setJobTitle(job.jobTitle || "")
      setJobLocation(job.jobLocation || "")
      setExperienceRange(job.experienceRange || "")
      setJobType(job.jobType || "")
      setSalaryRange(job.salaryRange || "")
      setIndustry(job.industry || "")
      setDepartment(job.department || "")
      setSkills(job.skills || [])
      setJobDescription(job.jobDescription || "")
      setEducationalPreference(job.educationalPreference || "")
      setShiftPreference(job.shiftPreference || [])
      setAssetsRequirement(job.assetsRequirement || { wifi: false, laptop: false, vehicle: false })
      setCompanyName(job.companyName || "")
      setAboutCompany(job.aboutCompany || "")
      setWebsiteLink(job.websiteLink || "")
      setQuestions(job.questions || [])
      setAnswers(job.answers || [])
    } catch (error) {
      console.error("Error fetching job details:", error)
      toast.error("Failed to load job details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSkill = () => {
    if (newSkill.trim() !== "" && skills.length < 10) {
      setSkills([...skills, newSkill.trim().startsWith("#") ? newSkill.trim() : `#${newSkill.trim()}`])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...skills]
    updatedSkills.splice(index, 1)
    setSkills(updatedSkills)
  }

  const handleAddQuestion = () => {
    if (newQuestion.trim() !== "" && questions.length < 10) {
      setQuestions([...questions, newQuestion.trim()])
      setAnswers([...answers, ""])
      setNewQuestion("")
    }
  }

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index, 1)
    const updatedAnswers = [...answers]
    updatedAnswers.splice(index, 1)
    setQuestions(updatedQuestions)
    setAnswers(updatedAnswers)
  }

  const handleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...answers]
    updatedAnswers[index] = value
    setAnswers(updatedAnswers)
  }

  const validateForm = () => {
    if (!jobTitle) {
      toast.error("Job title is required")
      return false
    }
    if (!jobLocation) {
      toast.error("Job location is required")
      return false
    }
    if (!experienceRange) {
      toast.error("Experience range is required")
      return false
    }
    if (!jobType) {
      toast.error("Job type is required")
      return false
    }
    if (!jobDescription) {
      toast.error("Job description is required")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)

      const formData = {
        jobTitle,
        jobLocation,
        experienceRange,
        jobType,
        salaryRange,
        industry,
        department,
        skills,
        jobDescription,
        educationalPreference,
        shiftPreference,
        assetsRequirement,
        companyName,
        aboutCompany,
        websiteLink,
        questions,
        answers,
      }

      if (onSubmit) {
        // Use the provided onSubmit function if available
        await onSubmit(formData)
      } else {
        // Otherwise use the default implementation
        const url = isEditing ? `/api/employee/jobs/${jobId}` : "/api/employee/jobs"
        const method = isEditing ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error(`Failed to ${isEditing ? "update" : "create"} job posting`)
        }

        toast.success(`Job posting ${isEditing ? "updated" : "created"} successfully!`)
        router.push("/employee/dashboard?tab=jobs")
        router.refresh()
      }
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} job posting:`, error)
      toast.error(`Failed to ${isEditing ? "update" : "create"} job posting`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Job Details */}
      <h3 className="text-lg font-medium">Job Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="jobTitle">Job Title*</Label>
          <Input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Developer"
            required
          />
        </div>
        <div>
          <Label htmlFor="jobLocation">Job Location*</Label>
          <Input
            type="text"
            id="jobLocation"
            value={jobLocation}
            onChange={(e) => setJobLocation(e.target.value)}
            placeholder="e.g. New York, NY or Remote"
            required
          />
        </div>
        <div>
          <Label htmlFor="experienceRange">Experience Range*</Label>
          <select
            id="experienceRange"
            value={experienceRange}
            onChange={(e) => setExperienceRange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
            required
          >
            <option value="">Select range</option>
            <option value="0-2">0-2 years</option>
            <option value="2-5">2-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
        <div>
          <Label htmlFor="jobType">Type of Job*</Label>
          <select
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
            required
          >
            <option value="">Select type</option>
            <option value="onsite">Onsite</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <Label htmlFor="salaryRange">Salary Range</Label>
          <Input
            type="text"
            id="salaryRange"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
            placeholder="e.g. $80,000 - $100,000"
          />
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            type="text"
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Technology"
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            type="text"
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Engineering"
          />
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label>Skills (Max 10)</Label>
        <div className="flex flex-wrap gap-2 min-h-10">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="px-2 py-1">
              {skill}
              <Button variant="ghost" size="sm" onClick={() => handleRemoveSkill(index)} className="ml-1 h-4 w-4 p-0">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Add skill (e.g. React, JavaScript)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddSkill()
              }
            }}
          />
          <Button type="button" size="sm" onClick={handleAddSkill} disabled={skills.length >= 10 || !newSkill.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Job Description */}
      <div className="space-y-2">
        <Label htmlFor="jobDescription">Job Description* (up to 750 words)</Label>
        <Textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="Describe the job responsibilities, requirements, and any other relevant information"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {jobDescription.split(/\s+/).filter(Boolean).length} / 750 words
        </p>
      </div>

      {/* Educational Preference */}
      <div className="space-y-2">
        <Label htmlFor="educationalPreference">Educational Preference</Label>
        <select
          id="educationalPreference"
          value={educationalPreference}
          onChange={(e) => setEducationalPreference(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
        >
          <option value="">Select preference</option>
          <option value="high_school">High School</option>
          <option value="associates">Associate's Degree</option>
          <option value="bachelors">Bachelor's Degree</option>
          <option value="masters">Master's Degree</option>
          <option value="phd">PhD</option>
          <option value="none">No Preference</option>
        </select>
      </div>

      {/* Other Details */}
      <h3 className="text-lg font-medium">Other Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Shift Preference</Label>
          <div className="flex flex-col space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shiftDay"
                checked={shiftPreference.includes("day")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setShiftPreference([...shiftPreference, "day"])
                  } else {
                    setShiftPreference(shiftPreference.filter((pref) => pref !== "day"))
                  }
                }}
              />
              <Label htmlFor="shiftDay" className="font-normal">
                Day
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shiftNight"
                checked={shiftPreference.includes("night")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setShiftPreference([...shiftPreference, "night"])
                  } else {
                    setShiftPreference(shiftPreference.filter((pref) => pref !== "night"))
                  }
                }}
              />
              <Label htmlFor="shiftNight" className="font-normal">
                Night
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shiftRotational"
                checked={shiftPreference.includes("rotational")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setShiftPreference([...shiftPreference, "rotational"])
                  } else {
                    setShiftPreference(shiftPreference.filter((pref) => pref !== "rotational"))
                  }
                }}
              />
              <Label htmlFor="shiftRotational" className="font-normal">
                Rotational
              </Label>
            </div>
          </div>
        </div>

        <div>
          <Label>Assets Requirement</Label>
          <div className="flex flex-col space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="assetWifi"
                checked={assetsRequirement.wifi}
                onCheckedChange={(checked) => setAssetsRequirement({ ...assetsRequirement, wifi: !!checked })}
              />
              <Label htmlFor="assetWifi" className="font-normal">
                Wifi
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="assetLaptop"
                checked={assetsRequirement.laptop}
                onCheckedChange={(checked) => setAssetsRequirement({ ...assetsRequirement, laptop: !!checked })}
              />
              <Label htmlFor="assetLaptop" className="font-normal">
                Laptop
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="assetVehicle"
                checked={assetsRequirement.vehicle}
                onCheckedChange={(checked) => setAssetsRequirement({ ...assetsRequirement, vehicle: !!checked })}
              />
              <Label htmlFor="assetVehicle" className="font-normal">
                Vehicle
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Employer Details */}
      <h3 className="text-lg font-medium">Employer Details</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your company name"
          />
        </div>
        <div>
          <Label htmlFor="aboutCompany">About Company</Label>
          <Textarea
            id="aboutCompany"
            value={aboutCompany}
            onChange={(e) => setAboutCompany(e.target.value)}
            rows={3}
            placeholder="Brief description of your company"
          />
        </div>
        <div>
          <Label htmlFor="websiteLink">Website & Links</Label>
          <Input
            type="url"
            id="websiteLink"
            value={websiteLink}
            onChange={(e) => setWebsiteLink(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Questions and Answers */}
      <h3 className="text-lg font-medium">Questions and Answers (Max 10)</h3>
      {questions.map((question, index) => (
        <div key={index} className="space-y-2 border p-4 rounded-md dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Label htmlFor={`question-${index}`}>Question #{index + 1}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveQuestion(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Input type="text" id={`question-${index}`} value={question} readOnly />
          <Label htmlFor={`answer-${index}`}>Answer</Label>
          <Textarea
            id={`answer-${index}`}
            placeholder="Provide an answer"
            value={answers[index] || ""}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            rows={2}
          />
        </div>
      ))}
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Add a question for candidates"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          disabled={questions.length >= 10}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAddQuestion()
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAddQuestion}
          disabled={questions.length >= 10 || !newQuestion.trim()}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/employee/dashboard?tab=jobs")}
          disabled={isLoading || isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-purple-700 hover:bg-purple-800 text-white"
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Update Job Posting"
          ) : (
            "Create Job Posting"
          )}
        </Button>
      </div>
    </div>
  )
}

export default JobPostingForm
