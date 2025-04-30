import type { ObjectId } from "mongodb"

export interface JobPosting {
  _id?: string | ObjectId
  jobTitle: string
  jobLocation: string
  experienceRange: string
  jobType: string
  salaryRange: string
  industry: string
  department: string
  skills: string[]
  jobDescription: string
  educationalPreference: string
  shiftPreference: string[]
  assetsRequirement: {
    wifi: boolean
    laptop: boolean
    vehicle: boolean
  }
  companyName: string
  aboutCompany: string
  websiteLink: string
  questions: string[]
  answers: string[]
  status: "active" | "closed"
  applicants: number
  interviews: number
  daysLeft: number
  companyId: string | ObjectId
  createdBy: string | ObjectId
  createdAt: Date
  updatedAt: Date
}
