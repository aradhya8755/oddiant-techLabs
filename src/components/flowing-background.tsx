"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function FlowingBackground() {
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

    // Create flowing lines
    const lines: {
      x: number
      y: number
      length: number
      angle: number
      speed: number
      width: number
      color: string
      opacity: number
      curve: number
    }[] = []

    const createLines = () => {
      const lineCount = Math.floor((canvas.width * canvas.height) / 40000)
      for (let i = 0; i < lineCount; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const length = Math.random() * 150 + 50
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 0.5 + 0.1
        const width = Math.random() * 2 + 0.5
        const opacity = Math.random() * 0.5 + 0.1
        const curve = (Math.random() - 0.5) * 0.2
        const color = `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(
          Math.random() * 100 + 100,
        )}, ${Math.floor(Math.random() * 255)}, ${opacity})`
        lines.push({ x, y, length, angle, speed, width, color, opacity, curve })
      }
    }

    createLines()

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#080515")
      gradient.addColorStop(1, "#0f0828")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw flowing lines
      lines.forEach((line) => {
        ctx.beginPath()
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.width

        // Create curved path
        const startX = line.x
        const startY = line.y
        const endX = startX + Math.cos(line.angle) * line.length
        const endY = startY + Math.sin(line.angle) * line.length
        const controlX = (startX + endX) / 2 + Math.cos(line.angle + Math.PI / 2) * line.curve * line.length
        const controlY = (startY + endY) / 2 + Math.sin(line.angle + Math.PI / 2) * line.curve * line.length

        ctx.moveTo(startX, startY)
        ctx.quadraticCurveTo(controlX, controlY, endX, endY)
        ctx.stroke()

        // Move line
        line.x += Math.cos(line.angle) * line.speed
        line.y += Math.sin(line.angle) * line.speed
        line.angle += line.curve * 0.01

        // Reset line if it goes off screen
        if (
          line.x < -line.length ||
          line.x > canvas.width + line.length ||
          line.y < -line.length ||
          line.y > canvas.height + line.length
        ) {
          line.x = Math.random() * canvas.width
          line.y = Math.random() * canvas.height
          line.angle = Math.random() * Math.PI * 2
          line.curve = (Math.random() - 0.5) * 0.2
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
        style={{ background: "linear-gradient(to bottom, #080515, #0f0828)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080515] to-[#0f0828] opacity-90"></div>
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
