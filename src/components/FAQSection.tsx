"use client"

import type React from "react"

import { useState } from "react"

// Define the FAQ item type
interface FAQItem {
  question: string
  answer: string
}

// Define the component props type
interface FAQSectionProps {
  className?: string
}

const faqs: FAQItem[] = [
  {
    question: "What services do you offer?",
    answer: "We specialize in recruitment, talent sourcing, and HR solutions tailored to global business needs.",
  },
  {
    question: "How experienced is your team?",
    answer:
      "Our team brings over 7 years of experience in the recruitment industry with a strong track record of successful placements.",
  },
  {
    question: "Where are your delivery centers located?",
    answer: "We operate two strategically located delivery centers to provide seamless service across time zones.",
  },
  {
    question: "Do you work with international clients?",
    answer: "Yes, we've partnered with over 20 clients globally across various industries and sectors.",
  },
  {
    question: "How do I get started with your services?",
    answer:
      "You can reach out through our contact form or schedule a free consultation. We'll guide you through the process step-by-step.",
  },
]

const FAQSection: React.FC<FAQSectionProps> = ({ className = "" }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={`max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <h2 className="text-3xl font-bold text-black mb-8 text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-700 rounded-md p-4 shadow-sm bg-white backdrop-blur-sm transition-all duration-300 hover:border-black"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left flex justify-between items-center text-lg font-medium text-black focus:outline-none"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span>{faq.question}</span>
              <span className="ml-2 flex-shrink-0">
                {openIndex === index ? (
                  <svg
                    className="h-5 w-5 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
            </button>
            <div
              id={`faq-answer-${index}`}
              className={`mt-2 text-black transition-all duration-300 overflow-hidden ${
                openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {openIndex === index && <p>{faq.answer}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQSection
