import type { ObjectId } from "mongodb"

export interface Employee {
  _id?: string | ObjectId
  firstName: string
  lastName: string
  email: string
  password: string
  designation: string
  companyName: string
  companyLocation: string
  phone: string
  profileCompleted: boolean
  companyId: string | ObjectId
  notificationSettings?: {
    emailNotifications: boolean
    applicationUpdates: boolean
    interviewReminders: boolean
  }
  createdAt: Date
  updatedAt: Date
}
