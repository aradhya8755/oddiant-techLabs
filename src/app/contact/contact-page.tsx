"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Toaster, toast } from "sonner"

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
  const [useEmailFallback, setUseEmailFallback] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // If we're using the email fallback, use the fallback form
    if (useEmailFallback) {
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
      return
    }

    try {
      console.log("Submitting form data:", formData)

      // Use absolute URL for API endpoint to avoid path issues
      const apiUrl = "/api/contact"

      console.log("Submitting to API URL:", apiUrl)

      // Use fetch with improved error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("Response status:", response.status)

      // Check if response is ok first
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}. Please try again later.`

        try {
          const errorData = await response.json()
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          }
        } catch (e) {
          // If we can't parse JSON, try to get text
          try {
            const errorText = await response.text()
            console.error("Error response text:", errorText)
          } catch (textError) {
            console.error("Could not read error response text:", textError)
          }
        }

        // If we get a 405 error, offer to use the email fallback
        if (response.status === 405) {
          toast.error("The contact form is currently unavailable. Would you like to use your email client instead?", {
            action: {
              label: "Use Email",
              onClick: () => setUseEmailFallback(true),
            },
            duration: 10000,
          })
        } else {
          throw new Error(errorMessage)
        }
        return
      }

      // Try to parse the response as JSON
      let data
      try {
        data = await response.json()
        console.log("Response data:", data)
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError)
        throw new Error("Received invalid response from server. Please try again.")
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
        toast.error("Would you like to use your email client instead?", {
          action: {
            label: "Use Email",
            onClick: () => setUseEmailFallback(true),
          },
          duration: 10000,
        })
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
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-gray-300">
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
            <div className="order-2 lg:order-1">
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
                      {isSubmitting ? "Sending..." : useEmailFallback ? "Send via Email Client" : "Send Message"}
                    </Button>

                    {!useEmailFallback && (
                      <p className="text-xs text-center text-black mt-2">
                        Having trouble with the form?{" "}
                        <button
                          type="button"
                          onClick={() => setUseEmailFallback(true)}
                          className="text-blue-600 hover:underline"
                        >
                          Use email client instead
                        </button>
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="order-1 lg:order-2">
              <div className="space-y-8">
                <div>
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
