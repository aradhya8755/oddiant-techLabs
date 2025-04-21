"use client"

import { useEffect, useRef, useState } from "react"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider, type KeenSliderPlugin } from "keen-slider/react"
import {
  FaLaptopCode,
  FaBuilding,
  FaLandmark,
  FaChartLine,
  FaInternetExplorer,
  FaHeadset,
  FaUniversity,
  FaCloud,
  FaHeartbeat,
  FaConciergeBell,
  FaNotesMedical,
  FaPrescriptionBottle,
} from "react-icons/fa"

// Add KeenSlider autoplay/timelapse plugin
const autoSlide: KeenSliderPlugin = (slider) => {
  let timeout: ReturnType<typeof setTimeout>
  let mouseOver = false
  function clearNextTimeout() {
    clearTimeout(timeout)
  }
  function nextTimeout() {
    clearTimeout(timeout)
    if (mouseOver) return
    timeout = setTimeout(() => {
      slider.next()
    }, 2000)
  }
  slider.on("created", () => {
    slider.container.addEventListener("mouseenter", () => {
      mouseOver = true
      clearNextTimeout()
    })
    slider.container.addEventListener("mouseleave", () => {
      mouseOver = false
      nextTimeout()
    })
    nextTimeout()
  })
  slider.on("dragStarted", clearNextTimeout)
  slider.on("animationEnded", nextTimeout)
  slider.on("updated", nextTimeout)
}

// AnimatedCounter component
const AnimatedCounter = ({
  end,
  duration = 2,
  prefix = "",
  suffix = "+",
  colorClass = "",
}: { end: number; duration?: number; prefix?: string; suffix?: string; colorClass?: string }) => {
  const [count, setCount] = useState(0)
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let start = 0
    const increment = end / (duration * 30) // total frames based on duration
    function updateCounter() {
      start += increment
      if (start >= end) {
        setCount(end)
        return
      }
      setCount(Math.floor(start))
      ref.current = setTimeout(updateCounter, 33)
    }
    updateCounter()
    return () => {
      if (ref.current) clearTimeout(ref.current)
    }
  }, [end, duration])

  return (
    <span className={`text-4xl md:text-5xl font-bold ${colorClass}`}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}

export default function App({ showAboutSection = true }: { showAboutSection?: boolean }) {
  // Success Matrix data
  const metrics = [
    {
      label: "Years Experience",
      value: 7,
      color: "text-blue-400",
      bg: "bg-black",
      text: "text-blue-300",
      suffix: "+",
    },
    {
      label: "Global Clients",
      value: 20,
      color: "text-green-400",
      bg: "bg-white",
      text: "text-green-500",
      suffix: "+",
    },
    {
      label: "Placements & Counting",
      value: 1234,
      color: "text-purple-400",
      bg: "bg-white",
      text: "text-purple-400",
      suffix: "",
    },
    {
      label: "Delivery Center",
      value: 2,
      color: "text-yellow-400",
      bg: "bg-black",
      text: "text-yellow-300",
      suffix: "",
    },
  ]

  const industries = [
    "Information Technology (IT)",
    "Non-IT",
    "FinTech",
    "Sales",
    "Internet businesses",
    "BPO/ITES",
    "NBFCs",
    "SaaS companies",
    "HealthTech",
    "Hospitality",
    "Healthcare",
    "Pharmaceuticals",
  ]

  // Paired icons for each industry
  const industryIcons = [
    <FaLaptopCode key="it-icon" size={38} />, // Information Technology (IT)
    <FaBuilding key="non-it-icon" size={38} />, // Non-IT
    <FaLandmark key="fintech-icon" size={38} />, // FinTech
    <FaChartLine key="sales-icon" size={38} />, // Sales
    <FaInternetExplorer key="internet-icon" size={38} />, // Internet businesses
    <FaHeadset key="bpo-icon" size={38} />, // BPO/ITES
    <FaUniversity key="nbfc-icon" size={38} />, // NBFCs
    <FaCloud key="saas-icon" size={38} />, // SaaS companies
    <FaHeartbeat key="healthtech-icon" size={38} />, // HealthTech
    <FaConciergeBell key="hospitality-icon" size={38} />, // Hospitality
    <FaNotesMedical key="healthcare-icon" size={38} />, // Healthcare
    <FaPrescriptionBottle key="pharma-icon" size={38} />, // Pharmaceuticals
  ]

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      slides: { perView: 4, spacing: 20 },
      breakpoints: {
        "(max-width: 900px)": { slides: { perView: 2.5, spacing: 12 } },
        "(max-width: 640px)": { slides: { perView: 1.25, spacing: 10 } },
      },
    },
    [autoSlide],
  )

  return (
    <>
      {/* Success Matrix Section */}
      <section className="max-w-3xl w-full bg-gradient-to-br from-slate-900/40 to-violet-950/50 p-5 md:p-8 rounded-2xl mb-16 shadow-custom-shadow hover:shadow-hover-shadow hover:scale-105 transition-transform duration-300">
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8 text-center tracking-widest">
          Success Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Success Matrix Cards */}
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`rounded-xl flex flex-col items-center justify-center aspect-square shadow-lg ${m.bg} transition-all duration-500 ease-out`}
              style={{ animation: `fade-in-up 1s ${0.2 * i}s both` }}
            >
              <AnimatedCounter end={m.value} duration={3} colorClass={m.color} suffix={m.suffix} />
              <div className={`mt-2 text-base md:text-lg font-medium ${m.text} opacity-70 text-center px-2`}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Served Industries Section as SLIDER */}
      {showAboutSection && (
        <section className="max-w-4xl w-full flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6 text-center tracking-widest">
            Served Industries
          </h2>
          <div className="relative w-full">
            <div ref={sliderRef} className="keen-slider px-6">
              {industries.map((industry, i) => (
                <div key={industry} className="keen-slider__slide flex items-center justify-center">
                  <div
                    className="group w-28 h-28 flex flex-col items-center justify-center rounded-full bg-white/10 text-white shadow-xl border border-violet-300/30 transition-all duration-300 ease-out hover:scale-110 hover:shadow-2xl before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-violet-500/50 before:blur-xl before:scale-110 before:z-[-1]"
                    style={{ boxShadow: "0 0 40px 4px #a78bfa44", animation: "pop-in 0.7s both" }}
                  >
                    <span className="relative z-10 flex flex-col items-center justify-center w-full">
                      <span className="mb-2 text-violet-200 drop-shadow-md">{industryIcons[i]}</span>
                      <span className="text-center px-2 text-sm font-semibold text-white drop-shadow-md">
                        {industry}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Arrows */}
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-violet-900/60 hover:bg-violet-800 text-white rounded-full w-10 h-10 shadow-lg z-10 flex items-center justify-center"
              aria-label="Previous"
              onClick={() => slider.current?.prev()}
              style={{ left: -12 }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-violet-900/60 hover:bg-violet-800 text-white rounded-full w-10 h-10 shadow-lg z-10 flex items-center justify-center"
              aria-label="Next"
              onClick={() => slider.current?.next()}
              style={{ right: -12 }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </section>
      )}

      {/* Animations style */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.6); }
          80% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
