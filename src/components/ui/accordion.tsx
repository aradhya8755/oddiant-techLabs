// components/ui/accordion.tsx
import React, { useState, ReactNode } from "react"

type AccordionItemProps = {
  title: string
  children: ReactNode
}

export const AccordionItem = ({ title, children }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b">
      <button
        className="w-full text-left p-4 font-medium flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <span>{isOpen ? "-" : "+"}</span>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  )
}

type AccordionProps = {
  children: ReactNode
}

export const Accordion = ({ children }: AccordionProps) => {
  return <div className="border rounded-md">{children}</div>
}

export const AccordionTrigger = ({ children }: { children: ReactNode }) => {
  return <>{children}</> // Placeholder for compatibility
}

export const AccordionContent = ({ children }: { children: ReactNode }) => {
  return <>{children}</> // Placeholder for compatibility
}
