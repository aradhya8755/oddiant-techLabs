"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXTwitter, faFacebookF, faLinkedinIn, faInstagram } from "@fortawesome/free-brands-svg-icons"
import { Mail, Phone, MapPin, ChevronRight, ArrowRight, ExternalLink } from "lucide-react"

export function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      console.log(`Subscribing email: ${email}`)
      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer className="bg-gradient-to-b from-[#0a061d] to-[#050412] text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
      </div>

      {/* Newsletter Section */}
      <div className="relative z-10 border-b border-indigo-900/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-indigo-200 max-w-md">
                Subscribe to our newsletter for the latest job opportunities, career advice, and industry insights.
              </p>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-indigo-900/30 border-indigo-800/50 text-white h-12 pl-4 pr-12 rounded-lg"
                    required
                  />
                  <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-12 px-6 rounded-lg"
                >
                  Subscribe
                </Button>
              </form>
              {subscribed && <p className="text-green-400 mt-2 text-sm">Thank you for subscribing!</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <div className="relative w-[180px] h-[40px]">
                <Image src="/images/logos/oddiant-preview.png" alt="Oddiant Techlabs" fill className="object-contain" />
              </div>
            </Link>
            <p className="text-indigo-200">
              Connecting talent with opportunity. We help professionals find their dream jobs and employers build
              exceptional teams.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center hover:bg-indigo-600 transition-colors duration-300"
              >
                <FontAwesomeIcon icon={faLinkedinIn} className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center hover:bg-indigo-600 transition-colors duration-300"
              >
                <FontAwesomeIcon icon={faXTwitter} className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center hover:bg-indigo-600 transition-colors duration-300"
              >
                <FontAwesomeIcon icon={faFacebookF} className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center hover:bg-indigo-600 transition-colors duration-300"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">For Job Seekers</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/jobs" className="text-indigo-200 hover:text-white flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" />
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-indigo-200 hover:text-white flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" />
                  Company Profiles
                </Link>
              </li>
              <li>
                <Link href="/career-resources" className="text-indigo-200 hover:text-white flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" />
                  Career Resources
                </Link>
              </li>
              <li>
                <Link href="/resume-builder" className="text-indigo-200 hover:text-white flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" />
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/salary-guide" className="text-indigo-200 hover:text-white flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" />
                  Salary Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">For Employers</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/post-job" className="text-indigo-200 hover:text-white flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" />
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/talent-search" className="text-indigo-200 hover:text-white flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" />
                  Talent Search
                </Link>
              </li>
              <li>
                <Link href="/employer-branding" className="text-indigo-200 hover:text-white flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" />
                  Employer Branding
                </Link>
              </li>
              <li>
                <Link
                  href="/recruitment-solutions"
                  className="text-indigo-200 hover:text-white flex items-center group"
                >
                  <ChevronRight className="w-4 h-4 mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" />
                  Recruitment Solutions
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-indigo-200 hover:text-white flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" />
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                <a
                  href="https://www.google.com/maps/search/Noida,+U.P.,+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-200 hover:text-white group"
                >
                  Noida, U.P., India
                  <ExternalLink className="inline-block w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </li>
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@oddiant.com" className="text-indigo-200 hover:text-white">
                  info@oddiant.com
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+917300875549" className="text-indigo-200 hover:text-white">
                  +91 7300875549
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 border-t border-indigo-900/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-indigo-300 text-sm">
                &copy; {new Date().getFullYear()} Oddiant Techlabs LLP. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link href="/privacy-policy" className="text-indigo-300 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-indigo-300 hover:text-white text-sm">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="text-indigo-300 hover:text-white text-sm">
                Accessibility
              </Link>
              <Link href="/sitemap" className="text-indigo-300 hover:text-white text-sm">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
