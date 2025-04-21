"use client"
import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface FallbackFormProps {
  onSuccess?: () => void
}

export default function FallbackForm({ onSuccess }: FallbackFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "it-consulting",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Send email directly using mailto link
      const subject = `Contact Form: ${formData.name} - ${formData.service}`
      const body = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || "Not provided"}
Company: ${formData.company || "Not provided"}
Service: ${formData.service}

Message:
${formData.message}
      `.trim()

      // Create mailto link
      const mailtoLink = `mailto:hi@oddiant.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      // Open email client
      window.location.href = mailtoLink

      toast.success("Email client opened. Please send the email to complete your submission.")

      if (onSuccess) {
        onSuccess()
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        service: "it-consulting",
        message: "",
      })
    } catch (error) {
      console.error("Error with fallback form:", error)
      toast.error("Could not open email client. Please contact us directly at hi@oddiant.com")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="fallback-name" className="text-sm font-medium text-black">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fallback-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Enter Your Name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="fallback-email" className="text-sm font-medium text-black">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="fallback-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="user@oddiant.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="fallback-phone" className="text-sm font-medium text-black">
            Phone Number
          </label>
          <input
            type="tel"
            id="fallback-phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="+91 1234567890"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="fallback-company" className="text-sm font-medium text-black">
            Company Name
          </label>
          <input
            type="text"
            id="fallback-company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Your Company"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="fallback-service" className="text-sm font-medium text-black">
          Service of Interest <span className="text-red-500">*</span>
        </label>
        <select
          id="fallback-service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        >
          <option value="it-consulting">IT Consulting</option>
          <option value="hr-services">HR Services</option>
          <option value="recruitment">Recruitment</option>
          <option value="staffing">Staffing</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="fallback-message" className="text-sm font-medium text-black">
          Your Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="fallback-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-4 py-2 bg-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Tell us about your project or inquiry..."
        ></textarea>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        {isSubmitting ? "Opening Email Client..." : "Send via Email Client"}
      </Button>

      <p className="text-xs text-center text-black mt-2">
        This will open your default email client with a pre-filled message.
      </p>
    </form>
  )
}
