"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Download, PlusCircle, Filter, Save, X, Edit } from 'lucide-react'
import { toast } from "sonner"
import { jsPDF } from "jspdf"

type User = {
  _id: string
  name: string
  email: string
  role: "client" | "supervisor" | "supplier" | "employee"
  salary?: number
  projectTotalAmount?: number // For clients
  supplierAmount?: number // For suppliers - deprecated, use totalSupplyValue
  totalSupplyValue?: number // New: total value of all materials
  totalPaid: number
  dueAmount: number
  lastPaymentDate?: string
  status: "active" | "inactive"
  phone?: string
  address?: string
  // Supplier-specific material fields
  projectMaterials?: Array<{
    projectId: string
    projectName?: string
    materialType: string
    quantity: number
    pricePerUnit: number
    totalAmount: number
    paidAmount?: number
    dueAmount?: number
  }>
  [key: string]: any
}

const PayrollManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("supervisor")
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<User | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Helper function to fetch data with error handling
  const fetchWithErrorHandling = async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error)
      return []
    }
  }

  // Helper function to calculate due amount based on role
  const calculateDueAmount = (user: User): number => {
    switch (user.role) {
      case "employee":
      case "supervisor":
        return Math.max(0, (user.salary || 0) - (user.totalPaid || 0))
      case "client":
        return Math.max(0, (user.projectTotalAmount || 0) - (user.totalPaid || 0))
      case "supplier":
        if (user.projectMaterials && user.projectMaterials.length > 0) {
          const totalMaterialValue = user.projectMaterials.reduce((sum, material) => sum + material.totalAmount, 0)
          const totalMaterialPaid = user.projectMaterials.reduce((sum, material) => sum + (material.paidAmount || 0), 0)
          return Math.max(0, totalMaterialValue - totalMaterialPaid)
        }
        return Math.max(0, (user.totalSupplyValue || 0) - (user.totalPaid || 0))
      default:
        return user.dueAmount || 0
    }
  }

  // Enhanced role-specific data transformation with supplier-specific fields
  const transformUserData = (user: any, role: string): User => {
    console.log(`Transforming ${role} data:`, user)
    const baseUser = {
      _id: user._id || user.id || Math.random().toString(36).substr(2, 9),
      name:
        user.name || user.fullName || (user.firstName && user.lastName)
          ? `${user.firstName} ${user.lastName}`.trim()
          : user.companyName || "Unknown",
      email: user.email || user.emailAddress || `${role}-${Date.now()}@example.com`,
      role: role as User["role"],
      status: user.status || user.employeeStatus || "active",
      phone: user.phone || user.phoneNumber || user.mobile || "",
      address: user.address || user.location || "",
      lastPaymentDate:
        user.lastPaymentDate || user.lastPayment || user.lastSalaryDate || new Date().toISOString().split("T")[0],
      totalPaid: Number(user.totalPaid || user.paidAmount || user.totalSalaryPaid || user.amountPaid || 0),
      ...user,
    }

    // Enhanced role-specific calculations with proper due amount calculation
    let transformedUser: User
    switch (role) {
      case "employee":
        const employeeSalary =
          typeof user.salary === "string"
            ? Number.parseFloat(user.salary.replace(/[^0-9.]/g, ""))
            : Number(
              user.salary ||
              user.monthlySalary ||
              user.basicSalary ||
              user.grossSalary ||
              user.netSalary ||
              user.amount ||
              0,
            )
        transformedUser = {
          ...baseUser,
          salary: employeeSalary,
          dueAmount: 0, // Will be calculated below
        }
        break
      case "supervisor":
        const supervisorSalary =
          typeof user.salary === "string"
            ? Number.parseFloat(user.salary.replace(/[^0-9.]/g, ""))
            : Number(user.salary || user.monthlySalary || user.supervisorSalary || 0)
        transformedUser = {
          ...baseUser,
          salary: supervisorSalary,
          dueAmount: 0, // Will be calculated below
        }
        break
      case "client":
        const projectAmount = Number(
          user.projectTotalAmount || user.totalAmount || user.contractValue || user.projectValue || user.amount || 0,
        )
        transformedUser = {
          ...baseUser,
          projectTotalAmount: projectAmount,
          dueAmount: 0, // Will be calculated below
        }
        break
      case "supplier":
        // Enhanced supplier data transformation with material details
        const projectMaterials = user.projectMaterials || []
        let totalSupplyValue = 0
        let totalSupplierPaid = 0

        // Calculate totals from project materials
        if (Array.isArray(projectMaterials)) {
          projectMaterials.forEach((material: any) => {
            const materialTotal = (Number(material.quantity) || 0) * (Number(material.pricePerUnit) || 0)
            const materialPaid = Number(material.paidAmount) || 0
            totalSupplyValue += materialTotal
            totalSupplierPaid += materialPaid
          })
        }

        transformedUser = {
          ...baseUser,
          name: user.companyName || user.name || "Unknown Supplier",
          totalSupplyValue: totalSupplyValue || Number(user.totalSupplyValue) || 0,
          projectMaterials: projectMaterials.map((material: any) => ({
            projectId: material.projectId || '',
            projectName: material.projectName || '',
            materialType: material.materialType || 'Unknown Material',
            quantity: Number(material.quantity) || 0,
            pricePerUnit: Number(material.pricePerUnit) || 0,
            totalAmount: (Number(material.quantity) || 0) * (Number(material.pricePerUnit) || 0),
            paidAmount: Number(material.paidAmount) || 0,
            dueAmount: ((Number(material.quantity) || 0) * (Number(material.pricePerUnit) || 0)) - (Number(material.paidAmount) || 0)
          })),
          totalPaid: totalSupplierPaid || Number(user.totalPaid) || 0,
          dueAmount: 0, // Will be calculated below
        }
        break
      default:
        transformedUser = {
          ...baseUser,
          dueAmount: Number(user.dueAmount || user.pendingAmount || 0),
        }
    }

    // Calculate due amount using the helper function
    transformedUser.dueAmount = calculateDueAmount(transformedUser)
    console.log(`Transformed ${role}:`, transformedUser)
    return transformedUser
  }

  // Enhanced fetch data with better employee handling
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        const endpoints = [
          { url: "/api/employees", role: "employee" },
          { url: "/api/clients", role: "client" },
          { url: "/api/suppliers", role: "supplier" },
          { url: "/api/supervisors", role: "supervisor" },
        ]

        const results = await Promise.all(
          endpoints.map(async ({ url, role }) => {
            try {
              console.log(`Fetching ${role} data from ${url}`)
              const data = await fetchWithErrorHandling(url)
              console.log(`${role} raw data:`, data)
              if (!Array.isArray(data)) {
                console.warn(`${role} data is not an array:`, data)
                return []
              }
              const transformedData = data.map((item) => transformUserData(item, role))
              console.log(`${role} transformed data:`, transformedData)
              return transformedData
            } catch (error) {
              console.error(`Error processing ${url}:`, error)
              toast.error(`Failed to load ${role} data`)
              return []
            }
          }),
        )

        const allUsers = results.flat()
        console.log("All users combined:", allUsers)

        // Check specifically for employees
        const employees = allUsers.filter((user) => user.role === "employee")
        console.log("Employees found:", employees.length, employees)

        if (allUsers.length === 0) {
          console.warn("No data received from APIs")
          toast.warning("No data found. Please check your API endpoints.")
        } else {
          setUsers(allUsers)
          toast.success(`Loaded ${allUsers.length} records (${employees.length} employees)`)
        }
      } catch (error) {
        console.error("Error in fetchAllData:", error)
        toast.error("Failed to load data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  // Update filtered users when search term or role filter changes
  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesRole = selectedRole === "all" || user.role === selectedRole
      const matchesSearch =
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.role === "supplier" && user.projectMaterials &&
          user.projectMaterials.some(material =>
            material.materialType.toLowerCase().includes(searchTerm.toLowerCase())
          ))
      return matchesRole && matchesSearch
    })
    setFilteredUsers(filtered)
  }, [searchTerm, users, selectedRole])

  const handleEdit = (user: User) => {
    setEditingId(user._id)
    setEditForm({ ...user })
  }

  // Enhanced save logic with supplier support
  const handleSave = async () => {
    if (!editForm || !editForm.role || isSaving) return
    setIsSaving(true)
    const apiPath = `/api/${editForm.role.toLowerCase()}s`
    const userId = editForm._id
    const originalUser = users.find((u) => u._id === userId)
    const originalPaid = originalUser ? originalUser.totalPaid : 0
    const paymentAmount = editForm.totalPaid - originalPaid

    try {
      // Enhanced role-specific data preparation
      let apiData = { ...editForm }
      switch (editForm.role) {
        case "employee":
          // Try multiple field names that employee APIs might expect
          apiData = {
            ...editForm,
            salary: editForm.salary,
            monthlySalary: editForm.salary,
            basicSalary: editForm.salary,
            grossSalary: editForm.salary,
            totalPaid: editForm.totalPaid,
            paidAmount: editForm.totalPaid,
            totalSalaryPaid: editForm.totalPaid,
            amountPaid: editForm.totalPaid,
            dueAmount: editForm.dueAmount,
            pendingAmount: editForm.dueAmount,
            lastPaymentDate: editForm.lastPaymentDate,
            lastSalaryDate: editForm.lastPaymentDate,
          }
          console.log("Employee API data:", apiData)
          break
        case "supervisor":
          apiData = {
            ...editForm,
            salary: editForm.salary,
            monthlySalary: editForm.salary,
            supervisorSalary: editForm.salary,
          }
          break
        case "client":
          apiData = {
            ...editForm,
            projectTotalAmount: editForm.projectTotalAmount,
            totalAmount: editForm.projectTotalAmount,
            contractValue: editForm.projectTotalAmount,
          }
          break
        case "supplier":
          // For suppliers, we need to handle material-level payments differently
          // Don't try to update individual material payments through the payroll system
          // Instead, just update the overall payment tracking
          apiData = {
            _id: editForm._id,
            name: editForm.name,
            email: editForm.email,
            role: editForm.role,
            dueAmount: editForm.dueAmount,
            status: editForm.status,
            totalPaid: editForm.totalPaid,
            lastPaymentDate: editForm.lastPaymentDate,
            // Don't send material-specific data as it should be managed in supplier management
          }
          break
      }

      console.log(`Saving ${editForm.role} to ${apiPath}/${userId}:`, apiData)
      const response = await fetch(`${apiPath}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API Error for ${editForm.role}:`, response.status, errorText)
        throw new Error(`Failed to save ${editForm.role}: ${response.status} - ${errorText}`)
      }

      const updatedUser = await response.json()
      console.log(`Updated ${editForm.role} response:`, updatedUser)

      // Transform the updated user data
      const transformedUser = transformUserData(updatedUser, editForm.role)

      // Ensure due amount is properly calculated
      transformedUser.dueAmount = calculateDueAmount(transformedUser)

      // Update local state
      setUsers((prev) => prev.map((u) => (u._id === transformedUser._id ? transformedUser : u)))

      // Log the payment transaction only if a payment was made
      if (paymentAmount > 0) {
        try {
          const payrollData = {
            user: userId,
            userRole: editForm.role,
            amount: paymentAmount,
            paymentDate: new Date(),
            status: "paid",
            notes: `Payment of ₹${paymentAmount} recorded for ${editForm.role} ${editForm.name}.`,
          }
          console.log("Logging payroll transaction:", payrollData)
          await fetch("/api/payroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payrollData),
          })
        } catch (payrollError) {
          console.warn("Failed to log payroll transaction:", payrollError)
          // Don't fail the main operation if payroll logging fails
        }
      }

      setEditForm(null)
      setEditingId(null)
      toast.success(
        `${editForm.role.charAt(0).toUpperCase() + editForm.role.slice(1)} ${editForm.name} updated successfully!`,
      )
    } catch (error) {
      console.error(`Save error for ${editForm.role}:`, error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(`Failed to save ${editForm.role}. Error: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Enhanced input change handling with supplier-specific calculations
  const handleInputChange = (field: string, value: string | number) => {
    setEditForm((prev) => {
      if (!prev) return prev
      const newForm = { ...prev, [field]: value }
      // Convert values to numbers for calculation
      const numericValue = Number(value) || 0

      // Role-specific due amount calculation that updates immediately
      switch (prev.role) {
        case "employee":
        case "supervisor":
          const currentSalary = field === "salary" ? numericValue : Number(newForm.salary) || 0
          const currentPaid = field === "totalPaid" ? numericValue : Number(newForm.totalPaid) || 0
          newForm.salary = currentSalary
          newForm.totalPaid = currentPaid
          newForm.dueAmount = Math.max(0, currentSalary - currentPaid)
          console.log(
            `${prev.role} calculation: salary=${currentSalary}, paid=${currentPaid}, due=${newForm.dueAmount}`,
          )
          break
        case "client":
          const currentProjectAmount =
            field === "projectTotalAmount" ? numericValue : Number(newForm.projectTotalAmount) || 0
          const currentClientPaid = field === "totalPaid" ? numericValue : Number(newForm.totalPaid) || 0
          newForm.projectTotalAmount = currentProjectAmount
          newForm.totalPaid = currentClientPaid
          newForm.dueAmount = Math.max(0, currentProjectAmount - currentClientPaid)
          console.log(
            `Client calculation: project=${currentProjectAmount}, paid=${currentClientPaid}, due=${newForm.dueAmount}`,
          )
          break
        case "supplier":
          // For suppliers, we handle material-level payments
          if (field === "totalPaid") {
            const newTotalPaid = numericValue
            const currentTotalValue = newForm.totalSupplyValue || 0
            newForm.totalPaid = newTotalPaid
            newForm.dueAmount = Math.max(0, currentTotalValue - newTotalPaid)

            // Update individual material paid amounts proportionally if needed
            if (newForm.projectMaterials && newForm.projectMaterials.length > 0) {
              const totalMaterialValue = newForm.projectMaterials.reduce((sum, m) => sum + m.totalAmount, 0)
              if (totalMaterialValue > 0) {
                newForm.projectMaterials = newForm.projectMaterials.map(material => ({
                  ...material,
                  paidAmount: (material.totalAmount / totalMaterialValue) * newTotalPaid,
                  dueAmount: material.totalAmount - ((material.totalAmount / totalMaterialValue) * newTotalPaid)
                }))
              }
            }
          } else if (field === "totalSupplyValue") {
            newForm.totalSupplyValue = numericValue
            newForm.dueAmount = Math.max(0, numericValue - (newForm.totalPaid || 0))
          }

          console.log(
            `Supplier calculation: totalValue=${newForm.totalSupplyValue}, paid=${newForm.totalPaid}, due=${newForm.dueAmount}`,
          )
          break
        default:
          // For any other roles, just update the field
          newForm[field] = numericValue
          break
      }

      // Update last payment date if payment was increased
      if (field === "totalPaid" && numericValue > (prev.totalPaid || 0)) {
        newForm.lastPaymentDate = new Date().toISOString()
        console.log("Updated last payment date:", newForm.lastPaymentDate)
      }

      console.log("Updated form:", newForm)
      return newForm
    })
  }

  const handleExportToPDF = () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const currentDate = new Date().toLocaleDateString()
      doc.setFontSize(18)
      doc.text("Payroll Management Report", 14, 22)
      doc.setFontSize(10)
      doc.text(`Generated on: ${currentDate}`, 14, 30)

      const roles = ["employee", "supervisor", "client", "supplier"]
      let startY = 40

      roles.forEach((role) => {
        const roleUsers = users.filter((user) => user.role === role)
        if (roleUsers.length === 0) return

        doc.setFontSize(14)
        doc.text(`${role.charAt(0).toUpperCase() + role.slice(1)}s`, 14, startY)
        startY += 10

        // Different headers for suppliers
        const headers = role === "supplier"
          ? ["Name", "Email", "Materials", "Total Value", "Paid", "Due", "Status"]
          : ["Name", "Email", "Phone", "Amount", "Total Paid", "Due", "Last Payment", "Status"]
        const columnWidths = role === "supplier"
          ? [25, 35, 40, 25, 20, 20, 15]
          : [25, 40, 25, 20, 20, 20, 25, 15]

        let x = 5
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        headers.forEach((header, i) => {
          doc.text(header, x, startY)
          x += columnWidths[i]
        })
        startY += 4
        doc.line(5, startY, 5 + columnWidths.reduce((a, b) => a + b, 0), startY)
        startY += 4

        doc.setFont("helvetica", "normal")
        roleUsers.forEach((user) => {
          if (startY > 280) {
            doc.addPage()
            startY = 20
          }

          let row: string[]
          if (role === "supplier") {
            const materialsText = user.projectMaterials && user.projectMaterials.length > 0
              ? user.projectMaterials.slice(0, 2).map(m =>
                `${m.materialType} (${m.quantity}×₹${m.pricePerUnit})`
              ).join(", ") + (user.projectMaterials.length > 2 ? "..." : "")
              : "No materials"

            row = [
              user.name || "N/A",
              user.email || "N/A",
              materialsText,
              `₹${(user.totalSupplyValue || 0).toFixed(2)}`,
              `₹${user.totalPaid?.toFixed(2) || "0.00"}`,
              `₹${user.dueAmount?.toFixed(2) || "0.00"}`,
              user.status || "N/A",
            ]
          } else {
            // Get the appropriate amount based on role
            let amount = "N/A"
            switch (user.role) {
              case "employee":
              case "supervisor":
                amount = user.salary ? `₹${user.salary.toFixed(2)}` : "N/A"
                break
              case "client":
                amount = user.projectTotalAmount ? `₹${user.projectTotalAmount.toFixed(2)}` : "N/A"
                break
            }

            row = [
              user.name || "N/A",
              user.email || "N/A",
              user.phone || "N/A",
              amount,
              `₹${user.totalPaid?.toFixed(2) || "0.00"}`,
              `₹${user.dueAmount?.toFixed(2) || "0.00"}`,
              user.lastPaymentDate ? new Date(user.lastPaymentDate).toLocaleDateString() : "N/A",
              user.status || "N/A",
            ]
          }

          x = 5
          row.forEach((cell, i) => {
            const splitText = doc.splitTextToSize(cell, columnWidths[i] - 2)
            doc.text(splitText, x + 1, startY + 5)
            x += columnWidths[i]
          })
          startY += 10
          if (startY < 280) {
            doc.line(5, startY, 5 + columnWidths.reduce((a, b) => a + b, 0), startY)
            startY += 2
          }
        })
        startY += 15
      })

      doc.save(`payroll-report-${new Date().toISOString().split("T")[0]}.pdf`)
      toast.success("PDF exported successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm(null)
  }

  // Get users by role for stats with role-specific calculations
  const getStatsForRole = (role: string) => {
    const roleUsers = users.filter((user) => user.role === role)
    let totalAmount = 0
    let totalDue = 0
    roleUsers.forEach((user) => {
      switch (role) {
        case "employee":
        case "supervisor":
          totalAmount += user.salary || 0
          break
        case "client":
          totalAmount += user.projectTotalAmount || 0
          break
        case "supplier":
          totalAmount += user.totalSupplyValue || 0
          break
      }
      totalDue += user.dueAmount || 0
    })
    return { totalAmount, totalDue, count: roleUsers.length }
  }

  const stats = [
    {
      title: "Supervisors",
      role: "supervisor",
      ...getStatsForRole("supervisor"),
      description: "Supervisor salaries",
      color: "bg-purple-100 text-purple-800",
    },
    {
      title: "Employees",
      role: "employee",
      ...getStatsForRole("employee"),
      description: "Employee salaries",
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Clients",
      role: "client",
      ...getStatsForRole("client"),
      description: "Project values",
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Suppliers",
      role: "supplier",
      ...getStatsForRole("supplier"),
      description: "Material costs",
      color: "bg-amber-100 text-amber-800",
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get the appropriate amount field based on role
  const getAmountForRole = (user: User) => {
    switch (user.role) {
      case "employee":
      case "supervisor":
        return user.salary || 0
      case "client":
        return user.projectTotalAmount || 0
      case "supplier":
        return user.totalSupplyValue || 0
      default:
        return 0
    }
  }

  // Get the appropriate amount field name for display
  const getAmountFieldName = (role: string) => {
    switch (role) {
      case "client":
        return "Project Amount"
      case "supplier":
        return "Material Cost"
      default:
        return "Salary"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll Management</h2>
          <p className="text-muted-foreground">Manage payments, salaries, and financial transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 bg-transparent"
            onClick={handleExportToPDF}
            disabled={isExporting}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              {isExporting ? "Exporting..." : "Export"}
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Payment</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`shadow-sm cursor-pointer transition-all hover:scale-105 ${selectedRole === stat.role ? `${stat.color}` : ""
              }`}
            onClick={() => setSelectedRole(stat.role)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="h-8 w-8 rounded-full flex items-center justify-center">{stat.count}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stat.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {stat.totalDue > 0 ? `${formatCurrency(stat.totalDue)} due` : "All caught up"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Table */}
      <Card>
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={selectedRole === "supplier" ? "Search suppliers or materials..." : "Search users..."}
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="rounded-b-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {/* <TableHead>Role</TableHead> */}
                <TableHead>Email</TableHead>
                {selectedRole === "supplier" ? (
                  <>
                    <TableHead>Materials</TableHead>
                    <TableHead className="text-right">Total Supply Value</TableHead>
                  </>
                ) : (
                  <TableHead className="text-right">{getAmountFieldName(selectedRole)}</TableHead>
                )}
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      <div className="font-medium">{user.name}</div>
                      {user.phone && <div className="text-xs text-muted-foreground">{user.phone}</div>}
                    </TableCell>
                    {/* <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell> */}
                    <TableCell>{user.email}</TableCell>
                    {selectedRole === "supplier" ? (
                      <>
                        <TableCell>
                          {user.projectMaterials && user.projectMaterials.length > 0 ? (
                            <div className="space-y-1 max-w-xs">
                              {user.projectMaterials.slice(0, 2).map((material, idx) => (
                                <div key={idx} className="text-xs border-l-2 border-blue-200 pl-2">
                                  <div className="font-medium text-blue-900">{material.materialType}</div>
                                  <div className="text-muted-foreground hidden">
                                    Qty: {material.quantity} × ₹{material.pricePerUnit?.toFixed(2) || '0.00'}
                                  </div>
                                  <div className="text-green-700 font-medium hidden">
                                    Total: ₹{material.totalAmount?.toFixed(2) || '0.00'}
                                  </div>
                                </div>
                              ))}
                              {user.projectMaterials.length > 2 && (
                                <div className="text-xs text-muted-foreground font-medium">
                                  +{user.projectMaterials.length - 2} more materials
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">No materials assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === user._id && editForm ? (
                            <span className="text-muted-foreground">
                              ₹{(editForm.totalSupplyValue || 0).toFixed(2)}
                            </span>
                          ) : (
                            formatCurrency(user.totalSupplyValue || 0)
                          )}

                          <div className="text-green-700 font-medium hidden">
                            Total: ₹{user.totalSupplyValue?.toFixed(2) || '0.00'}
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <TableCell className="text-right">
                        {editingId === user._id && editForm ? (
                          <Input
                            type="number"
                            value={
                              user.role === "client"
                                ? editForm.projectTotalAmount || ""
                                : editForm.salary || ""
                            }
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const field = user.role === "client" ? "projectTotalAmount" : "salary"
                              handleInputChange(field, Number(e.target.value))
                            }}
                            className="w-24"
                          />
                        ) : (
                          formatCurrency(getAmountForRole(user))
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {editingId === user._id && editForm ? (
                        <Input
                          type="number"
                          value={editForm.totalPaid || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("totalPaid", Number(e.target.value))
                          }
                          className="w-24"
                        />
                      ) : (
                        formatCurrency(user.totalPaid)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === user._id && editForm ? (
                        <span className="text-muted-foreground">{formatCurrency(editForm.dueAmount || 0)}</span>
                      ) : user.dueAmount > 0 ? (
                        <span className="text-red-600">{formatCurrency(user.dueAmount)}</span>
                      ) : (
                        <span className="text-green-600">Paid</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === user._id && editForm ? (
                        <span className="text-xs text-muted-foreground">
                          {new Date(editForm.lastPaymentDate || Date.now()).toLocaleDateString()}
                        </span>
                      ) : user.lastPaymentDate ? (
                        new Date(user.lastPaymentDate).toLocaleDateString()
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      {editingId === user._id ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={selectedRole === "supplier" ? 12 : 9} className="h-24 text-center">
                    No users found for "{selectedRole}".
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

export default PayrollManagement
