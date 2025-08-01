"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Search,
  Filter,
  Users,
  UserCheck,
  DollarSign,
  Briefcase,
  Grid3X3,
  List,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Clock4,
  MapPin,
  Hash,
  Eye,
  MessageCircle,
  Award,
  TrendingUp,
  FileText,
  CalendarDays,
  IndianRupee,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Employee {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  salary: number
  workType: "Daily" | "Monthly" | "Contract"
  status: "Active" | "On Leave" | "Inactive"
  joinDate: string
  endDate?: string
  username: string
  password: string
  address: string
  avatar?: string
  department?: string
  supervisor?: string
  skills?: string[]
  createdAt: string
  updatedAt: string
  attendance?: {
    present: boolean
    checkIn?: string
    checkOut?: string
    status?: "Present" | "Absent" | "Late" | "Half Day"
  }
}

export default function EmployeesManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Detail Sheet States
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [employeePerformance, setEmployeePerformance] = useState<any[]>([])
  const [employeeProjects, setEmployeeProjects] = useState<any[]>([])
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Laborer",
    salary: 0,
    workType: "Monthly" as "Daily" | "Monthly" | "Contract",
    status: "Active" as "Active" | "On Leave" | "Inactive",
    joinDate: new Date(),
    endDate: undefined as Date | undefined,
    address: "",
    username: "",
    password: "",
  })

  const roles = [
    "Mason",
    "Carpenter",
    "Electrician",
    "Plumber",
    "Heavy Equipment Operator",
    "Safety Inspector",
    "Laborer",
    "Welder",
    "Painter",
    "Roofer",
    "HVAC Technician",
    "Concrete Worker",
  ]

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees", { cache: "no-store" })
      const employees = await response.json()
      // Get today's date in YYYY-MM-DD
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, "0")
      const dd = String(today.getDate()).padStart(2, "0")
      const dateStr = `${yyyy}-${mm}-${dd}`

      // Fetch today's attendance records
      const attRes = await fetch(`/api/attendance?date=${dateStr}`)
      const attendanceRecords = await attRes.json()

      // Map employeeId => attendance info
      const attendanceMap: Record<string, any> = {}
      for (const att of attendanceRecords) {
        if (att.employeeId && typeof att.employeeId === "object") {
          attendanceMap[att.employeeId._id] = att
        } else if (att.employeeId) {
          attendanceMap[att.employeeId] = att
        }
      }

      // Merge attendance into employees
      const employeesWithAttendance = employees.map((employee: any) => {
        const att = attendanceMap[employee._id]
        return {
          ...employee,
          attendance: att
            ? {
                present: att.status === "Present",
                checkIn: att.checkIn || "",
                checkOut: att.checkOut || "",
                status: att.status,
                _attendanceId: att._id,
              }
            : undefined,
        }
      })

      setEmployees(employeesWithAttendance)
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast.error("Failed to load employees. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const openEmployeeDetail = async (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDetailSheetOpen(true)
    await fetchEmployeePerformance(employee._id)
    await fetchEmployeeProjects(employee._id)
  }

  const closeEmployeeDetail = () => {
    setIsDetailSheetOpen(false)
    setSelectedEmployee(null)
    setEmployeePerformance([])
    setEmployeeProjects([])
  }

  const fetchEmployeePerformance = async (employeeId: string) => {
    setIsLoadingPerformance(true)
    try {
      // Mock performance data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockPerformance = [
        {
          id: "1",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: "Task Completion",
          rating: 4.5,
          feedback: "Excellent work on the foundation project",
          supervisor: "John Smith",
        },
        {
          id: "2",
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          type: "Safety Compliance",
          rating: 5.0,
          feedback: "Perfect safety record this month",
          supervisor: "Jane Doe",
        },
      ]
      setEmployeePerformance(mockPerformance)
    } catch (error) {
      console.error("Error fetching performance:", error)
      toast.error("Failed to load performance data")
    } finally {
      setIsLoadingPerformance(false)
    }
  }

  const fetchEmployeeProjects = async (employeeId: string) => {
    try {
      // Mock projects data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      const mockProjects = [
        {
          id: "1",
          title: "Office Building Construction",
          status: "In Progress",
          role: "Lead Mason",
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          title: "Residential Complex Phase 2",
          status: "Completed",
          role: "Mason",
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setEmployeeProjects(mockProjects)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingEmployee ? `/api/employees/${editingEmployee._id}` : "/api/employees"
      const method = editingEmployee ? "PUT" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: editingEmployee ? formData.status : "Active",
          joinDate: formData.joinDate.toISOString(),
          endDate: formData.endDate?.toISOString(),
        }),
      })
      if (response.ok) {
        await fetchEmployees()
        setIsAddDialogOpen(false)
        setEditingEmployee(null)
        resetForm()
        toast.success(`${formData.name} has been ${editingEmployee ? "updated" : "added"} successfully.`)
      }
    } catch (error) {
      console.error("Error saving employee:", error)
      toast.error("Failed to save employee. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = async (employeeId: string, newStatus: string) => {
    try {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, "0")
      const dd = String(today.getDate()).padStart(2, "0")
      const dateStr = `${yyyy}-${mm}-${dd}`

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          date: dateStr,
          status: newStatus,
        }),
      })

      if (!response.ok) throw new Error("Failed to update attendance")

      // Update local state
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === employeeId
            ? {
                ...emp,
                attendance: {
                  ...emp.attendance,
                  present: newStatus === "Present",
                  status: newStatus as "Present" | "Absent" | "Late" | "Half Day",
                },
              }
            : emp,
        ),
      )

      toast.success(`Attendance updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating attendance:", error)
      toast.error("Failed to update attendance")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/employees/${id}`, { method: "DELETE" })
      if (response.ok) {
        setEmployees(employees.filter((e) => e._id !== id))
        if (selectedEmployee?._id === id) {
          closeEmployeeDetail()
        }
        toast.success("Employee has been removed successfully.")
      }
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast.error("Failed to delete employee. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Laborer",
      salary: 0,
      workType: "Monthly",
      status: "Active",
      joinDate: new Date(),
      endDate: undefined,
      address: "",
      username: "",
      password: "",
    })
  }

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      salary: employee.salary,
      address: employee.address,
      workType: employee.workType,
      status: employee.status,
      joinDate: new Date(employee.joinDate),
      endDate: employee.endDate ? new Date(employee.endDate) : undefined,
      username: employee.username,
      password: employee.password,
    })
    setIsAddDialogOpen(true)
  }

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || employee.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "On Leave":
        return "bg-yellow-100 text-yellow-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate statistics
  const totalEmployees = employees.length
  const presentToday = employees.filter((emp) => emp.attendance?.present).length
  const absentToday = totalEmployees - presentToday
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0

  const attendanceOptions = [
    { value: "Present", label: "Present", icon: CheckCircle, color: "bg-green-100 text-green-800" },
    { value: "Late", label: "Late", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
    { value: "Half Day", label: "Half Day", icon: Clock4, color: "bg-blue-100 text-blue-800" },
    { value: "Absent", label: "Absent", icon: XCircle, color: "bg-red-100 text-red-800" },
  ]

  const getAttendanceIcon = (status: string) => {
    const option = attendanceOptions.find((opt) => opt.value === status)
    return option ? <option.icon className="w-3 h-3 mr-1" /> : null
  }

  const getAttendanceColor = (status: string) => {
    const option = attendanceOptions.find((opt) => opt.value === status)
    return option ? option.color : "bg-gray-100 text-gray-800"
  }

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    )
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredEmployees.map((employee) => (
        <Card
          key={employee._id}
          className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          onClick={() => openEmployeeDetail(employee)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employee.avatar || "/placeholder.svg"} alt={employee.name} />
                  <AvatarFallback>
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{employee.name}</h3>
                  <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={employee.attendance?.status || (employee.attendance?.present ? "Present" : "Absent")}
                      onValueChange={(value) => handleAttendanceChange(employee._id, value)}
                    >
                      <SelectTrigger className="h-7 w-32">
                        <div className="flex items-center gap-1">
                          {getAttendanceIcon(
                            employee.attendance?.status || (employee.attendance?.present ? "Present" : "Absent"),
                          )}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {attendanceOptions.map((option) => {
                          const Icon = option.icon
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-3 h-3" />
                                {option.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{employee.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>
                  {employee.role} {employee.department && `- ${employee.department}`}
                </span>
              </div>
              {employee.supervisor && (
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <span>Supervisor: {employee.supervisor}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>Work Type: {employee.workType}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>${employee.salary.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Joined: {new Date(employee.joinDate).toLocaleDateString()}</span>
              </div>
              {employee.attendance?.checkIn && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Check-in: {employee.attendance.checkIn}</span>
                </div>
              )}
            </div>
            {employee.skills && employee.skills.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {employee.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {employee.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{employee.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => openEditDialog(employee)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700 border-green-500 hover:bg-green-50 bg-transparent"
                onClick={() => window.open(`https://wa.me/${employee.phone.replace(/[^0-9]/g, "")}`, "_blank")}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => openEmployeeDetail(employee)}>
                <Eye className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {employee.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(employee._id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Work Type</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow
                key={employee._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => openEmployeeDetail(employee)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.avatar || "/placeholder.svg"} alt={employee.name} />
                      <AvatarFallback>
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{employee.role}</div>
                    {employee.department && <div className="text-sm text-muted-foreground">{employee.department}</div>}
                  </div>
                </TableCell>
                <TableCell>{employee.workType}</TableCell>
                <TableCell>${employee.salary.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Select
                        value={employee.attendance?.status || (employee.attendance?.present ? "Present" : "Absent")}
                        onValueChange={(value) => handleAttendanceChange(employee._id, value)}
                      >
                        <SelectTrigger className="h-7 w-32">
                          <div className="flex items-center gap-1">
                            {getAttendanceIcon(
                              employee.attendance?.status || (employee.attendance?.present ? "Present" : "Absent"),
                            )}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {attendanceOptions.map((option) => {
                            const Icon = option.icon
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-3 h-3" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    {employee.attendance?.checkIn && (
                      <span className="text-xs text-muted-foreground">In: {employee.attendance.checkIn}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{employee.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(employee)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700 border-green-500 hover:bg-green-50 bg-transparent"
                      onClick={() => window.open(`https://wa.me/${employee.phone.replace(/[^0-9]/g, "")}`, "_blank")}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEmployeeDetail(employee)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {employee.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(employee._id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active workforce</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentToday}</div>
            <p className="text-xs text-muted-foreground">Checked in today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentToday}</div>
            <p className="text-xs text-muted-foreground">Not present today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Today's attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Employees Management</h2>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setLoading(true)
              fetchEmployees()
            }}
            className="ml-2"
            disabled={loading}
            title="Refresh employees"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 00-10 10h4z"
                ></path>
              </svg>
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
          </Button>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
              <DialogDescription>
                {editingEmployee ? "Update employee information" : "Create a new employee record"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workType">Work Type *</Label>
                  <select
                    id="workType"
                    value={formData.workType}
                    onChange={(e) => setFormData({ ...formData, workType: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Daily">Daily</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number.parseInt(e.target.value, 10) || 0 })}
                    placeholder="e.g., 45000"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Join Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal")}>
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(formData.joinDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.joinDate}
                        onSelect={(date) => setFormData({ ...formData, joinDate: date || new Date() })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endDate && "text-muted-foreground",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => setFormData({ ...formData, endDate: date || undefined })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {editingEmployee && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter home address"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingEmployee(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingEmployee ? "Update Employee" : "Create Employee"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <Badge variant="secondary" className="self-center">
            {filteredEmployees.length} Total
          </Badge>
        </div>
        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8 px-3"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 px-3"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Employees Display */}
      {viewMode === "grid" ? renderGridView() : renderListView()}

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No employees found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "All"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first employee"}
          </p>
          {!searchTerm && statusFilter === "All" && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Employee
            </Button>
          )}
        </div>
      )}

      {/* Employee Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-none flex flex-col">
          {selectedEmployee && (
            <div className="flex flex-col h-full">
              <SheetHeader className="shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedEmployee.avatar || "/placeholder.svg?height=64&width=64"}
                      alt={selectedEmployee.name}
                    />
                    <AvatarFallback className="text-xl">
                      {selectedEmployee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <SheetTitle className="text-2xl">{selectedEmployee.name}</SheetTitle>
                    <p className="text-muted-foreground">{selectedEmployee.role}</p>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedEmployee.status)}>{selectedEmployee.status}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      openEditDialog(selectedEmployee)
                      setIsDetailSheetOpen(false)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6 flex flex-col h-[calc(100%-100px)]">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex-1 overflow-y-auto pr-2 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          {selectedEmployee.attendance?.present ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {selectedEmployee.attendance?.present ? "Present Today" : "Absent Today"}
                            </p>
                            {selectedEmployee.attendance?.checkIn && (
                              <p className="text-xs text-muted-foreground">
                                Check-in: {selectedEmployee.attendance.checkIn}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">Work Type</p>
                            <p className="text-xs text-muted-foreground">{selectedEmployee.workType}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">{selectedEmployee.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Address</p>
                            <p className="text-sm text-muted-foreground">{selectedEmployee.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <IndianRupee className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Salary</p>
                            <p className="text-sm text-muted-foreground">${selectedEmployee.salary.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Hash className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Username</p>
                            <p className="text-sm text-muted-foreground">{selectedEmployee.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Joined</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(selectedEmployee.joinDate), "PPP")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmployee.skills.map((skill, index) => (
                            <Badge key={index} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="performance" className="flex-1 overflow-y-auto pr-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Performance Reviews</h3>
                  </div>
                  <div className="space-y-3">
                    {isLoadingPerformance ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                      </div>
                    ) : employeePerformance.length > 0 ? (
                      employeePerformance.map((review) => (
                        <Card key={review.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{review.type}</h4>
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-yellow-500" />
                                <span className="font-medium">{review.rating}/5</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{review.feedback}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                <span>By: {review.supervisor}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(review.date), "MMM dd, yyyy")}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No performance reviews yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="flex-1 overflow-y-auto pr-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Project History</h3>
                  </div>
                  <div className="space-y-3">
                    {employeeProjects.length > 0 ? (
                      employeeProjects.map((project) => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{project.title}</h4>
                              <Badge
                                className={
                                  project.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }
                                variant="secondary"
                              >
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">Role: {project.role}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                <span>Start: {format(new Date(project.startDate), "MMM dd, yyyy")}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                <span>End: {format(new Date(project.endDate), "MMM dd, yyyy")}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No projects assigned yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
