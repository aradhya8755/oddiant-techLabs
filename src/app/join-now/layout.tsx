import type React from "react"
import { Toaster } from "sonner"

export default function JoinNowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      {children}
    </div>
  )
}
