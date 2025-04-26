"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast, Toaster } from "sonner"
import { Search, Eye, Filter } from "lucide-react"

export default function AdminEmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all") // all, pending, verified, rejected

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/admin/employees")

        if (!response.ok) {
          throw new Error("Failed to fetch employees")
        }

        const data = await response.json()
        setEmployees(data.employees || [])
      } catch (error) {
        toast.error("Error loading employees")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const handleViewEmployee = (employeeId) => {
    router.push(`/admin/verify-employee/${employeeId}`)
  }

  const filteredEmployees = employees.filter((employee) => {
    // Apply search filter
    const searchMatch =
      employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.companyName?.toLowerCase().includes(searchTerm.toLowerCase())

    // Apply status filter
    let statusMatch = true
    if (filter === "pending") {
      statusMatch = employee.emailVerified && !employee.verified && !employee.rejected
    } else if (filter === "verified") {
      statusMatch = employee.verified
    } else if (filter === "rejected") {
      statusMatch = employee.rejected
    }

    return searchMatch && statusMatch
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Toaster position="top-center" />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Employee Management</h1>
          <p className="text-white">Manage and verify employee accounts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Employees</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search employees..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  className="border rounded-md px-2 py-1 text-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <div className="grid grid-cols-7 bg-gray-50 p-3 text-sm font-medium text-gray-500">
                <div className="col-span-2">Name / Company</div>
                <div className="col-span-2">Email</div>
                <div>Status</div>
                <div>Registered</div>
                <div className="text-right">Actions</div>
              </div>

              {filteredEmployees.map((employee) => (
                <div key={employee._id} className="grid grid-cols-7 border-t p-3 items-center">
                  <div className="col-span-2">
                    <p className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{employee.companyName}</p>
                  </div>
                  <div className="col-span-2 truncate">{employee.email}</div>
                  <div>
                    {employee.verified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : employee.rejected ? (
                      <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                    ) : employee.emailVerified ? (
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Unverified</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{new Date(employee.createdAt).toLocaleDateString()}</div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewEmployee(employee._id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No employees found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
