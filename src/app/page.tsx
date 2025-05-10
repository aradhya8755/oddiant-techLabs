import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import App from "@/components/App"


export default function Home() {
  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 z-0" />

        {/* Animated Shapes */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <p className="text-xl text-gray-300">
              Innovative IT consulting, expert staffing solutions, and tailored personality development
              programs—delivered to fit your unique business needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button
                asChild
                className="bg-white text-black hover:text-white hover:bg-green-500 rounded-full px-8 py-6 text-lg"
              >
                <Link href="/solutions">Explore Solutions</Link>
              </Button>
              <Button
                asChild
                className="rounded-full px-8 py-6 text-lg bg-white text-black hover:text-white hover:bg-green-500"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Sbg-transparentervices Section */}
      <section className="py-24 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl text-black font-bold mb-4">Our Services</h2>
            <p className="text-xl text-black max-w-3xl mx-auto">
              We provide end-to-end solutions tailored to your business requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="bg-white border-zinc-700 shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                      {service.icon}
                    </div>
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-800">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* App Component with About Section */}
      <section className="py-24 bg-gradient-to-br from-[#0a1128] to-[#1a2151]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold mb-6">Roadmap Oddiant Techlabs</h2>
              <p className="text-lg text-gray-300 mb-6">
                With over 7 years of industry experience, we've built a strong reputation for delivering results that
                matter. Our commitment to excellence has earned us the trust of 20+ global clients who rely on us for
                dependable, top-tier service.
                <br />
                <br /> 📈 234 Placements & Counting We take pride in connecting talent with opportunity—making over
                1,200 successful placements and transforming careers around the world.
                <br /> <br />🌍 2 Strategic Delivery Centers Our dual-location model enables us to offer seamless
                support and agile solutions to clients across the globe.
              </p>
              <p className="text-gray-400 mb-8"></p>
              <Button
                asChild
                className="rounded-full px-8 py-6 text-lg bg-white text-black hover:text-white hover:bg-green-500"
              >
                <Link href="/company">Learn More</Link>
              </Button>
            </div>
            <div>
              <App showAboutSection={false} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">Ready to accelerate your business growth?</h2>
            <p className="text-xl text-gray-300 mb-10">
              Contact us today to discuss how Oddiant Techlabs can help you achieve your business goals.
            </p>
            <Button
              asChild
              className="rounded-full px-8 py-6 text-lg bg-white text-black hover:text-white hover:bg-green-500"
            >
              <Link href="/contact">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

const services = [
  {
    title: "IT Consulting",
    description: "Web Based Solutions & Web App Development",
    icon: (
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
    ),
  },
  {
    title: "HR Consulting",
    description: "Background Verification & Onboarding and Payroll",
    icon: (
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Recruitment & Manpower Consulting",
    description: "Permanent Staffing & Contingent Staffing",
    icon: (
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
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Personality Development Program (PDP)",
    description: "Resume Writing, Soft Skill Training & Interview Preparation",
    icon: (
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
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14h.01" />
        <path d="M9 17h.01" />
        <path d="M12 16h4" />
        <path d="M12 13h4" />
      </svg>
    ),
  },
]

const certifications = [
  {
    name: "GST Registered",
    logo: "/images/logos/gst-1.png",
  },
  {
    name: "Startup India",
    logo: "/images/logos/startup-india.png",
  },
  {
    name: "MSME Certified",
    logo: "/images/logos/msme-logo.png",
  },
  {
    name: "ISO Certified",
    logo: "/images/logos/inc-logo.png",
  },
]
