import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Award, Clock, Users, Shield, Headphones } from "lucide-react"

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: <CheckCircle className="w-10 h-10 text-blue-500" />,
      title: "Proven Track Record",
      description: "Over 20+ satisfied clients globally across various industries with consistent results.",
    },
    {
      icon: <Award className="w-10 h-10 text-purple-500" />,
      title: "Industry Expertise",
      description: "Specialized knowledge across IT, FinTech, Healthcare, and many other sectors.",
    },
    {
      icon: <Clock className="w-10 h-10 text-blue-500" />,
      title: "Quick Turnaround",
      description: "Efficient processes ensuring fast delivery without compromising on quality.",
    },
    {
      icon: <Users className="w-10 h-10 text-purple-500" />,
      title: "Tailored Solutions",
      description: "Customized approaches to meet your specific business requirements and challenges.",
    },
    {
      icon: <Shield className="w-10 h-10 text-blue-500" />,
      title: "Compliance Assured",
      description: "ISO certified with adherence to all regulatory standards and best practices.",
    },
    {
      icon: <Headphones className="w-10 h-10 text-purple-500" />,
      title: "24/7 Support",
      description: "Round-the-clock assistance ensuring your business needs are always addressed.",
    },
  ]

  return (
    <section className="py-24 bg-zinc-900 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 animate-fade-in">Why Choose Us?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto animate-fade-in">
            Discover the Oddiant Techlabs advantage and see why businesses trust us for their consulting needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, idx) => (
            <Card
              key={reason.title}
              className="bg-white border-zinc-700 animate-fade-in shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">{reason.icon}</div>
                  <h3 className="text-xl font-bold text-black mb-2">{reason.title}</h3>
                  <p className="text-black-300">{reason.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
