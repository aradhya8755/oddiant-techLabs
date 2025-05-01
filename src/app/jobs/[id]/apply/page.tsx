"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Briefcase, Plus, X } from "lucide-react"
import { toast, Toaster } from "sonner"
import { use } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

export default function JobApplicationPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Unwrap params if it's a Promise
  const resolvedParams = "then" in params ? use(params) : params
  const router = useRouter()
  const jobId = resolvedParams.id
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [job, setJob] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("personal")
  const [skills, setSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState("")
  const [preferredCities, setPreferredCities] = useState<string[]>([])
  const [currentCity, setCurrentCity] = useState("")

  const [formData, setFormData] = useState({
    // Personal Information
    salutation: "",
    fullName: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    alternativePhone: "",
    dateOfBirth: "",
    gender: "",
    currentCity: "",
    currentState: "",
    pincode: "",
    profileOutline: "",

    // Education
    education: [
      {
        level: "",
        mode: "",
        degree: "",
        institution: "",
        startYear: "",
        endYear: "",
        percentage: "",
      },
    ],
    certifications: [""],

    // Experience
    totalExperience: "",
    workExperience: [
      {
        title: "",
        department: "",
        companyName: "",
        tenure: "",
        summary: "",
        currentSalary: "",
        expectedSalary: "",
        noticePeriod: "",
      },
    ],
    shiftPreference: [] as string[],
    preferredCities: [] as string[],

    // Assets & Documents
    availableAssets: [] as string[],
    identityDocuments: [] as string[],

    // Additional
    skills: [] as string[],
    portfolioLink: "",
    socialMediaLink: "",

    // Documents
    resumeUrl: "",
    videoResumeUrl: "",
    audioBiodataUrl: "",
    photographUrl: "",

    // Original fields
    linkedIn: "",
    coverLetter: "",
    additionalInfo: "",
  })

  const [selectedFiles, setSelectedFiles] = useState({
    resume: null as File | null,
    videoResume: null as File | null,
    audioBiodata: null as File | null,
    photograph: null as File | null,
  })

  const [uploadedUrls, setUploadedUrls] = useState({
    resumeUrl: "",
    videoResumeUrl: "",
    audioBiodataUrl: "",
    photographUrl: "",
  })

  const [isUploading, setIsUploading] = useState(false)

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/jobs/${jobId}`)
        if (response.ok) {
          const data = await response.json()
          setJob(data.job)
        }
      } catch (error) {
        console.error("Error fetching job:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    const field = name.split(".")[0]
    const value = name.split(".")[1]

    setFormData((prev) => {
      const currentValues = [...(prev[field as keyof typeof prev] as string[])]

      if (checked) {
        if (!currentValues.includes(value)) {
          return { ...prev, [field]: [...currentValues, value] }
        }
      } else {
        return { ...prev, [field]: currentValues.filter((item) => item !== value) }
      }

      return prev
    })
  }

  const handleEducationChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const education = [...prev.education]
      education[index] = { ...education[index], [field]: value }
      return { ...prev, education }
    })
  }

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          level: "",
          mode: "",
          degree: "",
          institution: "",
          startYear: "",
          endYear: "",
          percentage: "",
        },
      ],
    }))
  }

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  const handleExperienceChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const workExperience = [...prev.workExperience]
      workExperience[index] = { ...workExperience[index], [field]: value }
      return { ...prev, workExperience }
    })
  }

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        {
          title: "",
          department: "",
          companyName: "",
          tenure: "",
          summary: "",
          currentSalary: "",
          expectedSalary: "",
          noticePeriod: "",
        },
      ],
    }))
  }

  const removeExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }))
  }

  const addSkill = () => {
    if (currentSkill && !formData.skills.includes(currentSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, currentSkill],
      }))
      setCurrentSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const addPreferredCity = () => {
    if (currentCity && !formData.preferredCities.includes(currentCity)) {
      setFormData((prev) => ({
        ...prev,
        preferredCities: [...prev.preferredCities, currentCity],
      }))
      setCurrentCity("")
    }
  }

  const removePreferredCity = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredCities: prev.preferredCities.filter((c) => c !== city),
    }))
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "resume" | "videoResume" | "audioBiodata" | "photograph",
  ) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles((prev) => ({
        ...prev,
        [fileType]: e.target.files![0],
      }))
    }
  }

  const uploadFile = async (file: File, fileType: string): Promise<string> => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileType", fileType)

      const response = await fetch("/api/upload/file", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Upload error response:", errorData)
        throw new Error(`Failed to upload ${fileType}`)
      }

      const data = await response.json()
      console.log(`${fileType} upload response:`, data)

      if (!data.success || !data.url) {
        console.error("Invalid upload response:", data)
        throw new Error(data.message || `No URL returned from ${fileType} upload`)
      }

      return data.url
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadFile = async (fileType: "resume" | "videoResume" | "audioBiodata" | "photograph") => {
    const file = selectedFiles[fileType]
    if (!file) {
      toast.error(`Please select a ${fileType} file first`)
      return
    }

    try {
      setIsUploading(true)
      const url = await uploadFile(file, fileType)

      const urlFieldMap = {
        resume: "resumeUrl",
        videoResume: "videoResumeUrl",
        audioBiodata: "audioBiodataUrl",
        photograph: "photographUrl",
      }

      const urlField = urlFieldMap[fileType]

      setUploadedUrls((prev) => ({
        ...prev,
        [urlField]: url,
      }))

      setFormData((prev) => ({
        ...prev,
        [urlField]: url,
      }))

      toast.success(`${fileType} uploaded successfully`)
    } catch (error) {
      console.error(`${fileType} upload failed:`, error)
      toast.error(`${fileType} upload failed: ${error instanceof Error ? error.message : "Please try again"}`)
    } finally {
      setIsUploading(false)
    }
  }

  const validateForm = () => {
    // Required fields validation
    if (!formData.fullName) {
      toast.error("Please enter your full name")
      setActiveTab("personal")
      return false
    }

    if (!formData.email) {
      toast.error("Please enter your email address")
      setActiveTab("personal")
      return false
    }

    // Check if resume is uploaded
    if (!formData.resumeUrl && !uploadedUrls.resumeUrl) {
      toast.error("Please upload your resume")
      setActiveTab("documents")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Check if resume is uploaded or needs to be uploaded
    let resumeUrl = formData.resumeUrl || uploadedUrls.resumeUrl

    if (!resumeUrl && selectedFiles.resume) {
      try {
        toast.info("Uploading resume...")
        resumeUrl = await uploadFile(selectedFiles.resume, "resume")
        setFormData((prev) => ({ ...prev, resumeUrl }))
      } catch (error) {
        console.error("Resume upload failed:", error)
        toast.error(`Resume upload failed: ${error instanceof Error ? error.message : "Please try again"}`)
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Prepare the final form data with all fields
      const finalFormData = {
        ...formData,
        resumeUrl,
        videoResumeUrl: formData.videoResumeUrl || uploadedUrls.videoResumeUrl,
        audioBiodataUrl: formData.audioBiodataUrl || uploadedUrls.audioBiodataUrl,
        photographUrl: formData.photographUrl || uploadedUrls.photographUrl,
        jobId,
      }

      // Submit application with all the data
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalFormData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit application")
      }

      const responseData = await response.json()
      console.log("Application submission response:", responseData)

      toast.success("Application submitted successfully!")

      // Redirect to success page after a short delay
      setTimeout(() => {
        router.push(`/jobs/${jobId}/apply/success`)
      }, 2000)
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error(`Failed to submit application: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Apply for {job?.jobTitle || "Position"}</CardTitle>
            <CardDescription>
              Complete the form below to apply for this position at {job?.companyName || "the company"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-6 mb-8">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="assets">Assets</TabsTrigger>
                  <TabsTrigger value="additional">Additional</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-4">
                  <div>
                    <Label htmlFor="salutation">Salutation</Label>
                    <select
                      id="salutation"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onChange={(e) => handleSelectChange("salutation", e.target.value)}
                      value={formData.salutation}
                    >
                      <option value="" disabled>
                        Select salutation
                      </option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                      <option value="Prof">Prof</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name*</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input
                        id="middleName"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                        placeholder="Robert"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name*</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fullName">Full Name*</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={
                        formData.fullName ||
                        `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}`
                      }
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address*</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number*</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="alternativePhone">Alternative Phone</Label>
                      <Input
                        id="alternativePhone"
                        name="alternativePhone"
                        value={formData.alternativePhone}
                        onChange={handleChange}
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth*</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <Label>Gender*</Label>
                      <RadioGroup
                        value={formData.gender}
                        onValueChange={(value) => handleSelectChange("gender", value)}
                        className="flex space-x-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentCity">Current City*</Label>
                      <Input
                        id="currentCity"
                        name="currentCity"
                        value={formData.currentCity}
                        onChange={handleChange}
                        placeholder="New York"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="currentState">Current State*</Label>
                      <Input
                        id="currentState"
                        name="currentState"
                        value={formData.currentState}
                        onChange={handleChange}
                        placeholder="New York"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode*</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="10001"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="profileOutline">Profile Outline</Label>
                    <Textarea
                      id="profileOutline"
                      name="profileOutline"
                      value={formData.profileOutline}
                      onChange={handleChange}
                      placeholder="Brief description about yourself"
                      rows={4}
                    />
                  </div>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Educational Qualifications</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                        <Plus className="h-4 w-4 mr-1" /> Add Education
                      </Button>
                    </div>

                    {formData.education.map((edu, index) => (
                      <Card key={index} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Education #{index + 1}</h4>
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEducation(index)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Level*</Label>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                onChange={(e) => handleEducationChange(index, "level", e.target.value)}
                                value={edu.level}
                              >
                                <option value="" disabled>
                                  Select level
                                </option>
                                <option value="high_school">High School</option>
                                <option value="diploma">Diploma</option>
                                <option value="bachelors">Bachelor's Degree</option>
                                <option value="masters">Master's Degree</option>
                                <option value="phd">PhD</option>
                              </select>
                            </div>

                            <div>
                              <Label>Mode*</Label>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                onChange={(e) => handleEducationChange(index, "mode", e.target.value)}
                                value={edu.mode}
                              >
                                <option value="" disabled>
                                  Select mode
                                </option>
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="distance">Distance</option>
                                <option value="online">Online</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <Label>Degree/Course*</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                              placeholder="Bachelor of Science in Computer Science"
                            />
                          </div>

                          <div>
                            <Label>School/College/University*</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                              placeholder="University name"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Starting Year*</Label>
                              <Input
                                type="number"
                                value={edu.startYear}
                                onChange={(e) => handleEducationChange(index, "startYear", e.target.value)}
                                placeholder="2018"
                              />
                            </div>

                            <div>
                              <Label>Ending Year*</Label>
                              <Input
                                type="number"
                                value={edu.endYear}
                                onChange={(e) => handleEducationChange(index, "endYear", e.target.value)}
                                placeholder="2022"
                              />
                            </div>

                            <div>
                              <Label>Percentage/CGPA*</Label>
                              <Input
                                value={edu.percentage}
                                onChange={(e) => handleEducationChange(index, "percentage", e.target.value)}
                                placeholder="3.8"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Certifications</h3>
                    <div>
                      <Label htmlFor="certifications">Certification Name</Label>
                      <Input
                        id="certifications"
                        name="certifications"
                        value={formData.certifications[0] || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            certifications: [e.target.value],
                          }))
                        }
                        placeholder="AWS Certified Solutions Architect"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience" className="space-y-6">
                  <div>
                    <Label htmlFor="totalExperience">Total Professional Experience (in years)*</Label>
                    <Input
                      id="totalExperience"
                      name="totalExperience"
                      type="number"
                      value={formData.totalExperience}
                      onChange={handleChange}
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Work Experience</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                        <Plus className="h-4 w-4 mr-1" /> Add Experience
                      </Button>
                    </div>

                    {formData.workExperience.map((exp, index) => (
                      <Card key={index} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Experience #{index + 1}</h4>
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExperience(index)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Title/Designation*</Label>
                              <Input
                                value={exp.title}
                                onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                                placeholder="Software Engineer"
                              />
                            </div>

                            <div>
                              <Label>Department</Label>
                              <Input
                                value={exp.department}
                                onChange={(e) => handleExperienceChange(index, "department", e.target.value)}
                                placeholder="Engineering"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Company Name*</Label>
                              <Input
                                value={exp.companyName}
                                onChange={(e) => handleExperienceChange(index, "companyName", e.target.value)}
                                placeholder="ABC Technologies"
                              />
                            </div>

                            <div>
                              <Label>Tenure (e.g., "2 years 3 months")*</Label>
                              <Input
                                value={exp.tenure}
                                onChange={(e) => handleExperienceChange(index, "tenure", e.target.value)}
                                placeholder="2 years 3 months"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Professional Summary</Label>
                            <Textarea
                              value={exp.summary}
                              onChange={(e) => handleExperienceChange(index, "summary", e.target.value)}
                              placeholder="Brief summary of your professional background"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Current Salary (per annum)</Label>
                              <Input
                                value={exp.currentSalary}
                                onChange={(e) => handleExperienceChange(index, "currentSalary", e.target.value)}
                                placeholder="e.g., 50000"
                              />
                            </div>

                            <div>
                              <Label>Expected Salary (per annum)*</Label>
                              <Input
                                value={exp.expectedSalary}
                                onChange={(e) => handleExperienceChange(index, "expectedSalary", e.target.value)}
                                placeholder="e.g., 60000"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Notice Period (in days)</Label>
                            <Input
                              value={exp.noticePeriod}
                              onChange={(e) => handleExperienceChange(index, "noticePeriod", e.target.value)}
                              placeholder="e.g., 30"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div>
                    <Label>Shift Preference</Label>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shift-day"
                          checked={formData.shiftPreference.includes("day")}
                          onCheckedChange={(checked) => handleCheckboxChange("shiftPreference.day", checked as boolean)}
                        />
                        <Label htmlFor="shift-day">Day</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shift-night"
                          checked={formData.shiftPreference.includes("night")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("shiftPreference.night", checked as boolean)
                          }
                        />
                        <Label htmlFor="shift-night">Night</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="shift-flexible"
                          checked={formData.shiftPreference.includes("flexible")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("shiftPreference.flexible", checked as boolean)
                          }
                        />
                        <Label htmlFor="shift-flexible">Flexible</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Preference Cities (Max 5)</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={currentCity}
                        onChange={(e) => setCurrentCity(e.target.value)}
                        placeholder="Enter city name"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addPreferredCity}
                        disabled={!currentCity || formData.preferredCities.length >= 5}
                      >
                        Add
                      </Button>
                    </div>

                    {formData.preferredCities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.preferredCities.map((city, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1"
                          >
                            <span className="text-sm">{city}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePreferredCity(city)}
                              className="h-5 w-5 p-0 ml-1"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Assets Tab */}
                <TabsContent value="assets" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Available Assets</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="asset-bike-car"
                          checked={formData.availableAssets.includes("bike_car")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("availableAssets.bike_car", checked as boolean)
                          }
                        />
                        <Label htmlFor="asset-bike-car">Bike / Car</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="asset-wifi"
                          checked={formData.availableAssets.includes("wifi")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("availableAssets.wifi", checked as boolean)
                          }
                        />
                        <Label htmlFor="asset-wifi">WiFi</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="asset-laptop"
                          checked={formData.availableAssets.includes("laptop")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("availableAssets.laptop", checked as boolean)
                          }
                        />
                        <Label htmlFor="asset-laptop">Laptop</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Identity Documents</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="doc-pan"
                          checked={formData.identityDocuments.includes("pan_card")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("identityDocuments.pan_card", checked as boolean)
                          }
                        />
                        <Label htmlFor="doc-pan">PAN Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="doc-aadhar"
                          checked={formData.identityDocuments.includes("aadhar")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("identityDocuments.aadhar", checked as boolean)
                          }
                        />
                        <Label htmlFor="doc-aadhar">Aadhar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="doc-bank"
                          checked={formData.identityDocuments.includes("bank_account")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("identityDocuments.bank_account", checked as boolean)
                          }
                        />
                        <Label htmlFor="doc-bank">Bank Account</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="doc-voter"
                          checked={formData.identityDocuments.includes("voter_id")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("identityDocuments.voter_id", checked as boolean)
                          }
                        />
                        <Label htmlFor="doc-voter">Voter ID / Passport / DL (Any)</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Additional Tab */}
                <TabsContent value="additional" className="space-y-6">
                  <div>
                    <Label>Skills / Technologies (Max 10)</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        placeholder="Enter skill or technology"
                        className="flex-1"
                      />
                      <Button type="button" onClick={addSkill} disabled={!currentSkill || formData.skills.length >= 10}>
                        Add
                      </Button>
                    </div>

                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.skills.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1"
                          >
                            <span className="text-sm">{skill}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkill(skill)}
                              className="h-5 w-5 p-0 ml-1"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="portfolioLink">Portfolio Link</Label>
                    <Input
                      id="portfolioLink"
                      name="portfolioLink"
                      value={formData.portfolioLink}
                      onChange={handleChange}
                      placeholder="https://your-portfolio.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="socialMediaLink">Social Media Link</Label>
                    <Input
                      id="socialMediaLink"
                      name="socialMediaLink"
                      value={formData.socialMediaLink}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                    <Input
                      id="linkedIn"
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleChange}
                      placeholder="linkedin.com/in/johndoe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="coverLetter">Cover Letter</Label>
                    <Textarea
                      id="coverLetter"
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleChange}
                      placeholder="Tell us why you're interested in this position..."
                      rows={5}
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      placeholder="Any other information you'd like to share..."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6">
                  <div>
                    <Label htmlFor="resume">Resume (PDF/DOC)*</Label>
                    <div className="mt-1">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            id="resume"
                            name="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleFileChange(e, "resume")}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => handleUploadFile("resume")}
                            disabled={!selectedFiles.resume || isUploading}
                          >
                            {isUploading ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                        {uploadedUrls.resumeUrl && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            Resume uploaded successfully! ✓
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="videoResume">Video Resume (MP4)</Label>
                    <div className="mt-1">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            id="videoResume"
                            name="videoResume"
                            type="file"
                            accept=".mp4"
                            onChange={(e) => handleFileChange(e, "videoResume")}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => handleUploadFile("videoResume")}
                            disabled={!selectedFiles.videoResume || isUploading}
                          >
                            {isUploading ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                        {uploadedUrls.videoResumeUrl && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            Video Resume uploaded successfully! ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="audioBiodata">Audio Biodata (MP3)</Label>
                    <div className="mt-1">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            id="audioBiodata"
                            name="audioBiodata"
                            type="file"
                            accept=".mp3"
                            onChange={(e) => handleFileChange(e, "audioBiodata")}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => handleUploadFile("audioBiodata")}
                            disabled={!selectedFiles.audioBiodata || isUploading}
                          >
                            {isUploading ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                        {uploadedUrls.audioBiodataUrl && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            Audio Biodata uploaded successfully! ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="photograph">Photograph (JPG/PNG)</Label>
                    <div className="mt-1">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            id="photograph"
                            name="photograph"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, "photograph")}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => handleUploadFile("photograph")}
                            disabled={!selectedFiles.photograph || isUploading}
                          >
                            {isUploading ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                        {uploadedUrls.photographUrl && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            Photograph uploaded successfully! ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-3 mt-8">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
