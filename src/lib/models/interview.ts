import type { ObjectId } from "mongodb"

export interface Interview {
  _id?: string | ObjectId
  candidate: string
  candidateId: string | ObjectId
  position: string
  jobId?: string | ObjectId
  date: Date
  time: string
  duration: number
  interviewers: string[]
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  notes?: string
  feedback?: string
  rating?: number
  companyId: string | ObjectId
  scheduledBy: string | ObjectId
  createdAt: Date
  updatedAt: Date
}
