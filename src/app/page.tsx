import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              Empowering Business Growth Through Tech & Talent
            </h1>
            <p className="text-xl text-gray-300">
              Oddiant Techlabs delivers innovative IT consulting and premier staffing solutions tailored to your business needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button asChild className="bg-white text-black hover:text-white hover:bg-black rounded-full px-8 py-6 text-lg">
                <Link href="/solutions">Explore Solutions</Link>
              </Button>
              <Button asChild  className="rounded-full px-8 py-6 text-lg bg-white text-black hover:text-white hover:bg-black">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sbg-transparentervices Section */}
      <section className="py-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-t-white border-t-1">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We provide end-to-end solutions tailored to your business requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="bg-white border-zinc-700 shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
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

      {/* About Section */}
      <section className="py-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold mb-6">About Oddiant Techlabs</h2>
              <p className="text-xl text-gray-300 mb-6">
                Oddiant Techlabs LLP is a bootstrapped, asset light start-up consulting firm for IT, HR, Manpower & Recruitment, staffing services, headquartered at Noida, U.P., India.
              </p>
              <p className="text-gray-400 mb-8">
                We believe in as you are more than a resume, and as a recruiter its our job to connect talent's with opportunities.
              </p>
              <Button asChild className="rounded-full px-8 py-6 text-lg bg-white text-black hover:text-white hover:bg-black">
                <Link href="/company">Learn More</Link>
              </Button>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden animate-fade-in shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 z-10 mix-blend-overlay" />
              <div className="grid grid-cols-2 gap-4 p-4 h-full">
                <div className="flex flex-col gap-4">
                  <div className="bg-black rounded-lg p-6 h-1/2 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-blue-400">10+</h3>
                      <p className="text-gray-400">Years Experience</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-6 h-1/2 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-purple-400">500+</h3>
                      <p className="text-gray-400">Successful Placements</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-lg p-6 h-1/2 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-green-400">50+</h3>
                      <p className="text-gray-400">Global Clients</p>
                    </div>
                  </div>
                  <div className="bg-black rounded-lg p-6 h-1/2 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-yellow-400">24/7</h3>
                      <p className="text-gray-400">Service Support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="py-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">Recognitions & Certifications</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Recognized for excellence and certified to deliver quality services
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-12 items-center">
            
            {certifications.map((cert, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative h-20 w-40">
                  <Image
                    src={cert.logo}
                    alt={cert.name}
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <p className="text-center text-sm text-gray-400 mt-2">{cert.name}</p>
              </div>
            ))}
          </div>
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
            <Button asChild className="rounded-full px-8 py-6 text-lg bg-white text-black hover:text-white hover:bg-green-500">
              <Link href="/contact">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const services = [
  {
    title: "IT Consulting",
    description: "Strategic IT consulting services to help businesses leverage technology for growth and efficiency.",
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
    title: "Recruitment",
    description: "Find the right talent for your organization with our specialized recruitment services.",
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
    title: "Staffing",
    description: "Flexible staffing solutions to meet your business demands and workforce requirements.",
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
    title: "HR Services",
    description: "Comprehensive HR services to streamline your human resources management and compliance.",
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
];

const certifications = [
  {
    name: "GST Registered",
    logo: "/images/logos/gst-logo.png",
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
    logo: "/images/logos/iso-logo.png",
  },
];
