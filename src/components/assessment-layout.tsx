import type { ReactNode } from "react"
import { AssessmentSidebar } from "./assessment-sidebar"
import { EmployeeNavbar } from "./layout/employee-navbar"

interface AssessmentLayoutProps {
  children: ReactNode
}

export function AssessmentLayout({ children }: AssessmentLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar />
      <AssessmentSidebar />
      <div className="ml-64 pt-16">{children}</div>
    </div>
  )
}
