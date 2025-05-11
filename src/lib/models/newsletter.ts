import type { ObjectId } from "mongodb"

export interface NewsletterSubscriber {
  _id?: string | ObjectId
  email: string
  subscriptionDate: Date
  active: boolean
  unsubscribedDate?: Date
  source?: string
  createdAt: Date
  updatedAt: Date
}
