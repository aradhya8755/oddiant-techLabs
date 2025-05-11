"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Sparkles, Rocket, Globe, Shield } from "lucide-react"

export function GradientCards() {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-white" />,
      title: "AI-Powered Matching",
      description: "Our intelligent algorithm matches your skills and preferences with the perfect job opportunities",
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-white" />,
      title: "Personalized Recommendations",
      description: "Receive tailored job recommendations based on your unique skills, experience, and career goals",
      gradient: "from-purple-600 to-pink-700",
    },
    {
      icon: <Rocket className="h-8 w-8 text-white" />,
      title: "Career Growth Tools",
      description:
        "Access resources and tools designed to help you advance your career and achieve your professional goals",
      gradient: "from-indigo-600 to-blue-700",
    },
    {
      icon: <Globe className="h-8 w-8 text-white" />,
      title: "Global Opportunities",
      description: "Connect with employers from around the world and explore international career opportunities",
      gradient: "from-pink-600 to-purple-700",
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: "Verified Employers",
      description: "Apply with confidence knowing that all employers on our platform have been thoroughly vetted",
      gradient: "from-cyan-600 to-blue-700",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="h-full bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group">
            <CardContent className="p-6 h-full flex flex-col">
              <div
                className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-indigo-200 flex-grow">{feature.description}</p>

              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-xl"></div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
