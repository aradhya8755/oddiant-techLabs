"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function FloatingElements() {
  const [elements, setElements] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      duration: number
      delay: number
      opacity: number
      blur: number
      color: string
    }>
  >([])

  useEffect(() => {
    // Generate random floating elements
    const newElements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 150 + 50,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.15 + 0.05,
      blur: Math.random() * 40 + 20,
      color: [
        "rgba(138, 43, 226, 0.3)", // blueviolet
        "rgba(75, 0, 130, 0.3)", // indigo
        "rgba(106, 90, 205, 0.3)", // slateblue
        "rgba(123, 104, 238, 0.3)", // mediumslateblue
        "rgba(147, 112, 219, 0.3)", // mediumpurple
      ][Math.floor(Math.random() * 5)],
    }))

    setElements(newElements)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`,
            backgroundColor: element.color,
            filter: `blur(${element.blur}px)`,
            opacity: element.opacity,
          }}
          animate={{
            x: ["-20%", "20%", "-20%"],
            y: ["-20%", "20%", "-20%"],
          }}
          transition={{
            duration: element.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: element.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
