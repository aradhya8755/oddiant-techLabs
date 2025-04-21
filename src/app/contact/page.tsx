"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Toaster, toast } from "sonner"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXTwitter, faFacebookF, faYoutube, faWhatsapp } from "@fortawesome/free-brands-svg-icons"

export default function ContactPage() {
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
      console.log("Submitting form data:", formData)

      // Get the current origin for API URL construction
      const origin = window.location.origin
      const apiUrl = `${origin}/api/contact`

      console.log("Submitting to API URL:", apiUrl)

      // Use fetch with explicit mode and credentials
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        // Don't set mode or credentials to ensure it works in all environments
      })

      console.log("Response status:", response.status)

      // Check if response is ok first
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Server error (${response.status}):`, errorText)
        throw new Error(`Server error: ${response.status}. Please try again later.`)
      }

      // Try to parse the response as JSON
      let data
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json()
          console.log("Response data:", data)
        } catch (error) {
          console.error("Error parsing JSON response:", error)
          throw new Error("Received invalid response from server. Please try again.")
        }
      } else {
        const textResponse = await response.text()
        console.log("Non-JSON response:", textResponse)
        // Try to parse it anyway in case the Content-Type header is wrong
        try {
          data = JSON.parse(textResponse)
          console.log("Parsed text response as JSON:", data)
        } catch (error) {
          console.error("Could not parse text response as JSON:", error)
          throw new Error("Server returned an invalid response format. Please try again.")
        }
      }

      toast.success(data?.message || "Message sent successfully! We'll get back to you soon.")

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
      console.error("Error submitting form:", error)

      // More specific error messages
      if (error.name === "AbortError") {
        toast.error("Request timed out. Please check your connection and try again.")
      } else if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("Network error. Please check your connection and try again.")
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to send message. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-black text-white">
      <Toaster position="top-center" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-zinc-900/30" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">Contact Us</h1>
            <p className="text-xl text-gray-300 animate-fade-in">
              Get in touch with our team to discuss how we can help your business grow
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="order-2 lg:order-1 animate-fade-in">
              <Card className="bg-gray-100 border-zinc-700">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6 text-black">Send us a message</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-black">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 bg-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="Enter Your Name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-black">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
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
                        <label htmlFor="phone" className="text-sm font-medium text-black">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="+91 1234567890"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium text-black">
                          Company Name
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="Your Company"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="service" className="text-sm font-medium text-black">
                        Service of Interest <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="service"
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
                      <label htmlFor="message" className="text-sm font-medium text-black">
                        Your Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
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
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="order-1 lg:order-2">
              <div className="space-y-8">
                <div className="animate-fade-in">
                  <h2 className="text-2xl text-white font-bold mb-6">Contact Information</h2>
                  <p className="text-white mb-8">
                    Get in touch with us for any inquiries about our services, partnerships, or career opportunities.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Phone</h3>
                        <p className="text-white">+91 7300875549</p>
                        <p className="text-white">+91 8755498866</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Email</h3>
                        <p className="text-white">hi@oddiant.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Office Location</h3>
                        <p className="text-white">D.D Puram Bareilly Uttar Pradesh, India</p>
                        <p className="text-white">Sector-63 Noida, Uttar Pradesh, India</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="animate-fade-in pt-8">
                  <h3 className="text-xl text-white font-bold mb-4">Business Hours</h3>
                  <div className="space-y-2 text-white">
                    <p className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>9:30 AM - 6:30 PM IST</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Saturday:</span>
                      <span>Closed</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Closed</span>
                    </p>
                  </div>
                </div>

                <div className="animate-fade-in pt-4">
                  <h3 className="text-xl text-white font-bold mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 text-blue-500 hover:text-white transition-colors"
                      >
                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                      </svg>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                      <FontAwesomeIcon
                        icon={faXTwitter}
                        className="w-6 h-6 text-zinc-400 hover:text-white transition-colors"
                      />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                      <FontAwesomeIcon
                        icon={faFacebookF}
                        className="w-6 h-6 text-blue-500 hover:text-white transition-colors"
                      />
                    </a>

                    <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                      <FontAwesomeIcon
                        icon={faYoutube}
                        className="w-6 h-6 text-red-600 hover:text-white transition-colors"
                      />
                    </a>

                    <a href="https://wa.me/your-number" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                      <FontAwesomeIcon
                        icon={faWhatsapp}
                        className="w-6 h-6 text-green-400 hover:text-white transition-colors"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
