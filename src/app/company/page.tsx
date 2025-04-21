"use client";
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Testimonials from "@/components/Testimonials"
import ClientsPlanetary from "@/components/ClientsPlanetary"
import WhyChooseUs from "@/components/why-choose-us"
import WhatMakesUsDifferent from "@/components/what-makes-us"

export default function CompanyPage() {
  return (
    <div className="bg-black text-white">
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">Company</h1>
            <p className="text-xl text-gray-300 animate-fade-in">
              Learn about our mission, vision, and the team behind Oddiant Techlabs
            </p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden animate-fade-in shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 mix-blend-overlay z-10" />
              <div className="absolute inset-0 bg-white flex items-center justify-center ">
                <div className="relative w-72 h-72">
                  <Image
                    src="/images/logos/oddiant-preview.png"
                    alt="Oddiant Techlabs"
                    fill
                    className="object-contain p-8"
                  />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl text-black font-bold mb-6 animate-fade-in">About Us</h2>
              <div className="prose prose-invert max-w-none animate-fade-in">
                <p className="text-black mb-4">
                  Oddiant Techlabs LLP is a fast-growing, bootstrapped start-up consultancy, operating with an
                  asset-light model. Headquartered in Noida, Uttar Pradesh, with a branch office in Bareilly, U.P.,
                  India, we offer a comprehensive range of services including IT consulting, HR and recruitment
                  solutions, staffing services, personality development training, and manpower outsourcing.
                </p>
                <p className="text-black">
                  As a leading recruitment agency in Noida, we provide end-to-end consulting services to over 20+
                  clients globally across various industries—such as Information Technology (IT), Non-IT, FinTech,
                  Sales, Internet businesses, BPO/ITES, NBFCs, SaaS companies, HealthTech, Hospitality, Healthcare, and
                  Pharmaceuticals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white border-zinc-700 animate-fade-in shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                  Vision
                </h3>
                <p className="text-black-300">
                  Vision To become a global leader in delivering innovative, reliable, and scalable consulting solutions
                  in IT, HR, and personality development—empowering organizations and individuals.
                </p>
              </CardContent>
            </Card>

            <Card
              className="bg-white border-zinc-700 animate-fade-in shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6"
                    >
                      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
                      <path d="M9 20h6" />
                      <path d="M12 16v4" />
                    </svg>
                  </div>
                  Mission
                </h3>
                <p className="text-black-300">
                  We are on a mission to empower businesses with best-fit talent and 24/7 strategic support through
                  customized, scalable solutions. From global staffing to technical hiring and corporate training,
                  Oddiant Techlabs is your trusted end-to-end partner.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* What Makes Us Different Section */}
      <WhatMakesUsDifferent />

      {/* testimonials section */}
      <section className="">
        <ClientsPlanetary></ClientsPlanetary>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-zinc-900 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 animate-fade-in">Our Team of Experts</h2>
            <p className="text-gray-400 max-w-2xl mx-auto animate-fade-in">
              Meet the talented professionals driving innovation and excellence at Oddiant Techlabs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={member.name}
                className="bg-white rounded-xl p-6 flex flex-col items-center text-center animate-slide-up shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <Avatar className="w-24 h-24 mb-4 shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300">
                  <AvatarImage src={member.image || "/placeholder.svg"} />
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-black">{member.name}</h3>
                <p className="text-black">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* testimonials section */}
      <section className="">
        <Testimonials></Testimonials>
      </section>

      {/* Certifications Section */}
      <section className="py-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 animate-fade-in">Due Diligence & Compliance</h2>
            <p className="text-gray-400 max-w-2xl mx-auto animate-fade-in">
              Our commitment to excellence is recognized through various certifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, idx) => (
              <div
                key={cert.name}
                className="bg-white border border-zinc-700 rounded-xl p-6 flex flex-col items-center text-center animate-fade-in shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="relative h-24 w-48 mb-4">
                  <Image src={cert.logo || "/placeholder.svg"} alt={cert.name} fill className="object-contain" />
                </div>
                <h3 className="text-lg font-medium text-black">{cert.name}</h3>
                <p className="text-sm text-black mt-2">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const teamMembers = [
  {
    name: "Aradhya Saxena",
    role: "CEO & Founder",
    image: "/images/logos/AS.jpg",
    initials: "AS",
  },
  {
    name: "Saloni",
    role: "Business Partner",
    image: "/images/logos/SA.jpg",
    initials: "SA",
  },
  {
    name: "Himanshu Walia",
    role: "Sr. Resource Manager",
    image: "/images/logos/HW.png",
    initials: "HW",
  },
  {
    name: "Nimrat Kaur Bagga",
    role: "Business Development Manager",
    image: "/images/logos/NK.png",
    initials: "NK",
  },
]

const certifications = [
  {
    name: "GST Registered",
    logo: "/images/logos/gst-1.png",
    description: "GST Number : 09AAJFO2188G1ZY",
  },
  // {
  //   name: "Startup India",
  //   logo: "/images/logos/startup-india.png",
  //   description: "Recognized by Department for Promotion of Industry and Internal Trade",
  // },
  {
    name: "MSME Certified",
    logo: "/images/logos/msme-logo.png",
    description: "UDYAM REGISTRATION NUMBER: UDYAM-UP-15-0070931",
  },
  // {
  //   name: "ISO Certified",
  //   logo: "/images/logos/iso-logo.png",
  //   description: "ISO 9001:2015 Certified for Quality Management",
  // },
  {
    name: "INC",
    logo: "/images/logos/inc-logo.png",
    description: "LLP Identification Number: ACJ-3756",
  },
  // {
  //   name: "START IN UP",
  //   logo: "/images/logos/iso-logo.png",
  //   description: "ISO 9001:2015 Certified for Quality Management",
  // },
]
