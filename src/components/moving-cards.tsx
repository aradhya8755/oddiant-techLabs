"use client"
import { motion } from "framer-motion"
import Image from "next/image"

export function MovingCards() {
  const companies = [
    { name: "Company 1", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Company 2", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Company 3", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Company 4", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Company 5", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Company 6", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Company 7", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Company 8", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Company 9", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Company 10", logo: "/placeholder.svg?height=60&width=120" },
  ]

  // Duplicate the companies for seamless looping
  const allCompanies = [...companies, ...companies]

  return (
    <div className="relative w-full overflow-hidden py-6">
      <motion.div
        className="flex space-x-16"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        {allCompanies.map((company, index) => (
          <div
            key={index}
            className="flex-shrink-0 h-16 w-32 bg-white/5 backdrop-blur-sm rounded-lg flex items-center justify-center p-2 border border-white/10"
          >
            <div className="relative h-10 w-24">
              <Image
                src={company.logo || "/placeholder.svg"}
                alt={company.name}
                fill
                className="object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
