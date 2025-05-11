"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Particle {
  x: number
  y: number
  size: number
  color: string
  originalX: number
  originalY: number
  vx: number
  vy: number
  ease: number
}

export function ParticleText({ text = "Discover Your Potential" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const particles = useRef<Particle[]>([])
  const mouse = useRef({ x: 0, y: 0, radius: 150 })
  const animationFrameId = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = container.offsetWidth
      canvas.height = 200
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Initialize particles
    const initParticles = () => {
      particles.current = []
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set font properties
      ctx.font = "bold 60px sans-serif"
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Draw text
      ctx.fillText(text, canvas.width / 2, canvas.height / 2)

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Create particles from text pixels
      for (let y = 0; y < canvas.height; y += 5) {
        for (let x = 0; x < canvas.width; x += 5) {
          const index = (y * canvas.width + x) * 4
          const alpha = data[index + 3]

          if (alpha > 128) {
            const size = Math.random() * 2 + 1
            const color = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 255}, ${Math.random() * 0.5 + 0.5})`

            particles.current.push({
              x: x + Math.random() * 10 - 5,
              y: y + Math.random() * 10 - 5,
              size,
              color,
              originalX: x,
              originalY: y,
              vx: 0,
              vy: 0,
              ease: Math.random() * 0.05 + 0.02,
            })
          }
        }
      }
    }

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.current.x = e.clientX - rect.left
      mouse.current.y = e.clientY - rect.top
    }

    // Handle mouse leave
    const handleMouseLeave = () => {
      mouse.current.x = undefined as any
      mouse.current.y = undefined as any
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach((particle) => {
        let dx = mouse.current.x - particle.x
        let dy = mouse.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const forceDirectionX = dx / distance
        const forceDirectionY = dy / distance

        const maxDistance = mouse.current.radius
        let force = (maxDistance - distance) / maxDistance

        if (force < 0) force = 0

        const directionX = forceDirectionX * force * -1
        const directionY = forceDirectionY * force * -1

        if (distance < mouse.current.radius) {
          particle.x += directionX
          particle.y += directionY
        } else {
          if (particle.x !== particle.originalX) {
            dx = particle.originalX - particle.x
            particle.x += dx * particle.ease
          }
          if (particle.y !== particle.originalY) {
            dy = particle.originalY - particle.y
            particle.y += dy * particle.ease
          }
        }

        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId.current = requestAnimationFrame(animate)
    }

    // Initialize
    initParticles()
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [text])

  return (
    <motion.div
      ref={containerRef}
      className="w-full relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      <canvas ref={canvasRef} className="w-full h-[200px]" />
      <h2 className="sr-only">{text}</h2>
    </motion.div>
  )
}
