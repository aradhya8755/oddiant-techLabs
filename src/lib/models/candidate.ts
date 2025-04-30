import type { ObjectId } from "mongodb"

export interface Candidate {
  _id?: string | ObjectId
  name: string
  email: string
  role: string
  status: string
  avatar?: string
  appliedDate: Date
  companyId: string | ObjectId
  createdBy: string | ObjectId
  resume?: string
  phone?: string
  location?: string
  experience?: string
  education?: string
  skills?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export const candidateStatuses = ["Applied", "Shortlisted", "Interview", "Rejected", "Hired"]
