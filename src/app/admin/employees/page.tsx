"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast, Toaster } from "sonner"
import { RotateCw, Search, Eye, Filter } from 'lucide-react'

export default function AdminEmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all") // all, pending, verified, rejected
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to fetch employees data
  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/employees", {
        // Add cache: 'no-store' to prevent caching and ensure fresh data
        cache: "no-store",
        headers: {
          pragma: "no-cache",
          "cache-control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Fix: Ensure employees is always an array
      if (data && Array.isArray(data.employees)) {
        setEmployees(data.employees)
      } else if (Array.isArray(data)) {
        setEmployees(data)
      } else {
        console.error("Unexpected data format:", data)
        setEmployees([])
        toast.error("Received invalid data format from server")
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error)
      toast.error("Failed to fetch employees")
      setEmployees([]) // Ensure employees is an array even on error
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchEmployees()

    // Set up polling for real-time updates
    const intervalId = setInterval(() => {
      fetchEmployees()
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(intervalId) // Clean up on unmount
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchEmployees()
      toast.success("Data refreshed successfully")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleViewEmployee = (employeeId) => {
    router.push(`/admin/verify-employee/${employeeId}`)
  }

  // Ensure employees is always an array before filtering
  const filteredEmployees = Array.isArray(employees) 
    ? employees.filter((employee) => {
        const searchTermLower = searchTerm.toLowerCase()
        const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase()
        const email = employee.email?.toLowerCase() || ""
        const companyName = employee.companyName?.toLowerCase() || ""

        const matchesSearchTerm =
          fullName.includes(searchTermLower) || email.includes(searchTermLower) || companyName.includes(searchTermLower)

        let matchesFilter = true
        if (filter !== "all") {
          if (filter === "verified") {
            matchesFilter = employee.verified === true
          } else if (filter === "rejected") {
            matchesFilter = employee.rejected === true
          } else if (filter === "pending") {
            matchesFilter = !employee.verified && !employee.rejected
          }
        }

        return matchesSearchTerm && matchesFilter
      })
    : []

  const getStatusBadge = (employee) => {
    if (employee.verified) {
      return <Badge className="bg-green-300 text-green-700 hover:bg-black">verified</Badge>
    } else if (employee.rejected) {
      return <Badge className="bg-red-200 text-red-700 hover:bg-black">rejected</Badge>
    } else {
      return <Badge className="bg-yellow-200 text-yellow-700 hover:bg-black">pending</Badge>
    }
  }

  return (
    <div className="container mx-auto py-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
      <Toaster richColors />
      <h1 className="text-3xl font-semibold mb-6 text-white">Manage Employees</h1>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <div className="flex flex-col md:flex-row items-center gap-2 w-full">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
            <Input
              type="search"
              placeholder="Search by name, email, or company..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="ghost" disabled={isRefreshing} onClick={handleRefresh} className="flex-shrink-0 text-black bg-white hover:bg-green-600 hover:text-black">
            <RotateCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            <select className="border rounded px-2 py-1" value={filter} onChange={(e) => setFilter(e.target.value)}> 
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No employees found matching your criteria</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee._id || employee.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {employee.firstName || ''} {employee.lastName || ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{employee.email || ''}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{employee.companyName || ''}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{getStatusBadge(employee)}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Button variant="outline" size="sm" onClick={() => handleViewEmployee(employee._id || employee.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}