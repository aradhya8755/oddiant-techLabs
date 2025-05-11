"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create stars
    const stars: { x: number; y: number; radius: number; color: string; velocity: number }[] = []
    const createStars = () => {
      const starCount = Math.floor(canvas.width * canvas.height * 0.0003)
      for (let i = 0; i < starCount; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = Math.random() * 1.5
        const color = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`
        const velocity = Math.random() * 0.05
        stars.push({ x, y, radius, color, velocity })
      }
    }

    createStars()

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#0f0a29")
      gradient.addColorStop(1, "#1a123e")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      stars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.fill()

        // Move stars
        star.y += star.velocity
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ background: "linear-gradient(to bottom, #0f0a29, #1a123e)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0a29] to-[#1a123e] opacity-90"></div>
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(128, 90, 213, 0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(66, 153, 225, 0.2) 0%, transparent 50%)",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "linear",
        }}
      />
    </>
  )
}
