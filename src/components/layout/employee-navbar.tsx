"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Users, Briefcase, Calendar, Settings, Search } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Overview",
    href: "/employee/dashboard",
    icon: User,
  },
  {
    label: "Candidates",
    href: "/employee/dashboard?tab=candidates",
    icon: Users,
  },
  {
    label: "Jobs",
    href: "/employee/dashboard?tab=jobs",
    icon: Briefcase,
  },
  {
    label: "Interviews",
    href: "/employee/dashboard?tab=interviews",
    icon: Calendar,
  },
  {
    label: "ATS",
    href: "/employee/dashboard?tab=ats",
    icon: Search,
  },
  {
    label: "Settings",
    href: "/employee/dashboard?tab=settings",
    icon: Settings,
  },
]

export function EmployeeNavbar() {
  const pathname = usePathname()
  const currentTab = pathname.includes("/employee/dashboard") ? pathname.split("?tab=")[1] || "overview" : ""

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-sm mb-6">
      <div className="max-w-7xl mx-auto">
        <nav className="flex overflow-x-auto">
          {navItems.map((item) => {
            const isActive = item.label.toLowerCase() === currentTab

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                  isActive
                    ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                    : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100",
                )}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
