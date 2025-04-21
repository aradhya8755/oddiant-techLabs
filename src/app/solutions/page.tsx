import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SolutionsPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">Our Solutions</h1>
            <p className="text-xl text-gray-300 animate-fade-in">
              Comprehensive services tailored to meet your business needs
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Card
                key={service.id}
                className="bg-white border-zinc-700 shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-500/30 transition-colors">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black mb-6">{service.shortDescription}</p>
                  <Button
                    asChild
                    variant="link"
                    className="p-0 text-md text-black bg-white rounded-md hover:bg-green-500 hover:text-white hover:no-underline"
                  >
                    <a href={`#${service.id}`}>Learn More</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {}
      {/* Detailed Service Sections */}
      {services.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          className={`py-20 ${index % 1 === 0 ? "py-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20" : "bg-white"}`}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className={`${index % 2 === 0 ? "order-1 lg:order-1" : "order-1 lg:order-2"}`}>
                <h2 className="text-3xl font-bold mb-6 animate-fade-in">{service.title}</h2>
                <div className="prose prose-invert max-w-none animate-fade-in">
                  <p className="text-gray-300 mb-4">{service.description}</p>

                  <h3 className="text-xl font-semibold mt-8 mb-4">What We Offer</h3>

                  <ul className="space-y-3">
                    {service.offerings.map((offering, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-1 text-blue-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="text-gray-300">{offering}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Button
                    asChild
                    className="rounded-full px-8 py-6 text-lg bg-white text-black hover:text-white hover:bg-green-500"
                  >
                    <Link href="/contact">Get Started</Link>
                  </Button>
                </div>
              </div>

              <div
                className={`relative h-[350px] md:h-[400px] rounded-xl overflow-hidden animate-fade-in ${
                  index % 2 === 0 ? "order-2 lg:order-2" : "order-2 lg:order-1"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10 mix-blend-overlay z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 z-0 flex items-center justify-center px-6">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {service.stats.map((stat, idx) => {
                      // Define color classes based on index
                      const colorClasses = [
                        "text-blue-400", 
                        "text-green-400", 
                        "text-purple-400", 
                        "text-yellow-400",
                      ]

                      // Determine background color based on position
                      const bgColor =
                        idx % 2 === 0
                          ? Math.floor(idx / 2) % 2 === 0
                            ? "bg-black"
                            : "bg-white"
                          : Math.floor(idx / 2) % 2 === 0
                            ? "bg-white"
                            : "bg-black"

                      // Determine text color based on background
                      const textColor = bgColor === "bg-black" ? "text-white" : "text-black"

                      return (
                        <div
                          key={idx}
                          className={`${bgColor} rounded-lg p-6 text-center flex flex-col items-center justify-center transition-transform hover:scale-105 shadow-lg`}
                        >
                          <p className={`text-4xl font-bold ${colorClasses[idx]} mb-2`}>{stat.value}</p>
                          <p className={`text-sm ${textColor}`}>{stat.label}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 animate-fade-in text-black">Ready to Transform Your Business?</h2>
            <p className="text-black mb-8 animate-fade-in">
              Contact us today to discuss how Oddiant Techlabs can help you achieve your business goals with our
              comprehensive solutions.
            </p>
            <Button
              asChild
              className="rounded-full px-8 py-6 text-lg bg-black text-white hover:text-white hover:bg-green-500"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

const services = [
  {
    id: "it-consulting",
    title: "IT Consulting",
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
    shortDescription: "IT Consulting provides expert guidance to optimize technology, improve efficiency, and support business growth through tailored IT solutions.",
    description:
      "Our IT consulting services empower businesses to harness technology for smarter operations and sustainable growth. We collaborate closely to align IT solutions with your business objectives and drive digital success.",
    offerings: [
      "Custom Website Design & Development",
      "Responsive and Mobile-First Web Solutions",
      "E-commerce Website Development",
      "Web Application Development",
      "Website Maintenance & Technical Support",
      "CMS Development and Management",
    ],
    stats: [
      { value: "45+", label: "IT Projects Completed" },
      { value: "98%", label: "Client Satisfaction" },
      { value: "30+", label: "Technology Partners" },
      { value: "24/7", label: "Support Available" },
    ],
  },
  {
    id: "hr-services",
    title: "HR Consulting",
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
    shortDescription: "HR Consulting offers expert advice on managing people, improving workplace culture, and aligning HR strategies with business goals. It helps organizations streamline recruitment, compliance, and employee development.",
    description:
      "We help businesses strengthen their people strategies by shaping effective HR frameworks and improving organizational culture. Our solutions ensure smooth HR operations, talent growth, and regulatory compliance.",
    offerings: [
      "Talent Acquisition Strategy & Support",
      "Employee Onboarding & Engagement Programs",
      "Workforce Planning & Organizational Structuring",
      "HR Compliance and Policy Advisory",
      "Training & Development Frameworks",
      "Compensation Planning & Employee Retention",
    ],
    stats: [
      { value: "20+", label: "HR Projects" },
      { value: "95%", label: "Retention Rate" },
      { value: "100%", label: "Compliance Success" },
      { value: "15+", label: "Industries Served" },
    ],
  },
  {
    id: "recruitment",
    title: "Recruitment & Manpower Consulting",
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
    shortDescription: "Recruitment & Manpower Consulting connects businesses with the right talent to meet their workforce needs. It streamlines hiring processes and ensures skilled candidates align with organizational goals.",
    description:
      "We assist businesses in building strong teams by sourcing skilled professionals who align with your company’s goals and culture. Our recruitment solutions ensure faster hiring and long-term workforce stability.",
    offerings: [
      "Strategic Talent Sourcing & Acquisition",
      "Industry-Specific Recruitment Solutions",
      "Permanent & Project-Based Staffing",
      "Workforce Planning & Resource Allocation",
      "Employer Branding & Talent Engagement",
      "Interview Coordination & Candidate Evaluation",
    ],
    stats: [
      { value: "500+", label: "Successful Placements" },
      { value: "85%", label: "First-time Fit" },
      { value: "12", label: "Avg. Days to Fill" },
      { value: "80+", label: "Active Clients" },
    ],
  },
  {
    id: "staffing",
    title: "Personality Development Program (PDP)",
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
    shortDescription: "Personality Development Program (PDP) enhances communication, confidence, and interpersonal skills. It helps individuals build a strong personal and professional presence.",
    description:
      "Our PDP sessions are designed to boost self-confidence, enhance communication skills, and foster leadership qualities. We focus on shaping well-rounded individuals ready to excel in both personal and professional environments.",
    offerings: [
      "Communication & Public Speaking Skills",
      "Confidence Building & Positive Thinking",
      "Leadership & Team Collaboration Techniques",
      "Interview Preparation & Grooming Skills",
      "Emotional Intelligence & Stress Management",
      "Time Management & Goal Setting Workshops",
    ],
    stats: [
      { value: "200+", label: "Active Contractors" },
      { value: "24hr", label: "Avg. Response Time" },
      { value: "15+", label: "Industries Served" },
      { value: "98%", label: "Client Retention" },
    ],
  },
]
