"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface CandidateSelectionContextType {
  selectedCandidates: string[]
  toggleCandidateSelection: (candidateId: string) => void
  selectAllCandidates: (candidateIds: string[]) => void
  clearSelectedCandidates: () => void
  isSelected: (candidateId: string) => boolean
}

const CandidateSelectionContext = createContext<CandidateSelectionContextType | undefined>(undefined)

export function CandidateSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId)
      } else {
        return [...prev, candidateId]
      }
    })
  }

  const selectAllCandidates = (candidateIds: string[]) => {
    if (selectedCandidates.length === candidateIds.length) {
      setSelectedCandidates([])
    } else {
      setSelectedCandidates(candidateIds)
    }
  }

  const clearSelectedCandidates = () => {
    setSelectedCandidates([])
  }

  const isSelected = (candidateId: string) => {
    return selectedCandidates.includes(candidateId)
  }

  return (
    <CandidateSelectionContext.Provider
      value={{
        selectedCandidates,
        toggleCandidateSelection,
        selectAllCandidates,
        clearSelectedCandidates,
        isSelected,
      }}
    >
      {children}
    </CandidateSelectionContext.Provider>
  )
}

export function useCandidateSelection() {
  const context = useContext(CandidateSelectionContext)
  if (context === undefined) {
    throw new Error("useCandidateSelection must be used within a CandidateSelectionProvider")
  }
  return context
}
