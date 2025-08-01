"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageCircle } from "lucide-react"
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  IndianRupee,
  Grid3X3,
  List,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MapPin,
  ClipboardList,
  Eye,
  UserPlus,
  CalendarPlus,
  FileText,
  Folder,
  Hash,
} from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

// Define attendance status type
type AttendanceStatus = "Present" | "Absent"

// Define Project interface
interface IProject {
  _id: string
  title: string
  description?: string
  status?: string
  createdAt: string
  updatedAt: string
}

interface Supervisor {
  _id: string
  name: string
  email: string
  phone: string
  salary: number
  address: string
  status: "Active" | "On Leave" | "Inactive"
  avatar?: string
  createdAt: string
  updatedAt: string
  username: string
  password: string
  attendance?: {
    present: boolean
    checkIn?: string
    checkOut?: string
    status?: AttendanceStatus
    _attendanceId?: string
  }
}

interface Task {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: "Pending" | "In Progress" | "Completed"
  documentUrl?: string
  createdAt: string
  projectId?: string
  supervisorId?: string
}

interface Employee {
  _id: string
  name: string
  email: string
  position: string
  avatar?: string
}

interface FormData {
  name: string
  email: string
  phone: string
  salary: number
  address: string
  status: "Active" | "On Leave" | "Inactive"
  username: string
  password: string
}

interface TaskFormData {
  title: string
  description: string
  startDate: Date | undefined
  endDate: Date | undefined
  projectId: string
  documentType: string
  documentUrl: string
  file: File | undefined
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  salary: 0,
  address: "",
  status: "Active",
  username: "",
  password: "",
}

const initialTaskFormData: TaskFormData = {
  title: "",
  description: "",
  startDate: undefined,
  endDate: undefined,
  projectId: "",
  documentType: "",
  documentUrl: "",
  file: undefined,
}

// Attendance options and icon logic
const attendanceOptions = [
  { value: "Present" as AttendanceStatus, label: "Present", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  { value: "Absent" as AttendanceStatus, label: "Absent", icon: XCircle, color: "bg-red-100 text-red-800" },
]

// const getAttendanceIcon = (status: string) => {
//   const option = attendanceOptions.find((opt) => opt.value === status)
//   return option ? <option.icon className="w-3 h-3 mr-1" /> : null
// }

// MonthAttendanceCard component
function MonthAttendanceCard({ supervisorId, month }: { supervisorId: string; month: string }) {
  const [rate, setRate] = useState<null | { attendanceRate: number; totalWorkingDays: number; presentDays: number }>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(month)

  useEffect(() => {
    async function fetchRate() {
      setLoading(true)
      try {
        const res = await fetch(`/api/attendance/monthly?supervisorId=${supervisorId}&month=${selectedMonth}`)
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setRate(data)
      } catch {
        setRate(null)
      } finally {
        setLoading(false)
      }
    }
    if (supervisorId && selectedMonth) fetchRate()
  }, [supervisorId, selectedMonth])

  // Generate last 12 months for dropdown with display names
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return {
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
    }
  })

  const selectedMonthLabel = months.find((m) => m.value === selectedMonth)?.label || selectedMonth

  return (
    <Card className="w-full min-w-[220px]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-base">{selectedMonthLabel}</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="Select month"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : rate ? (
          <div className="flex flex-col items-center">
            <p className="text-3xl font-bold text-primary">{rate.attendanceRate}%</p>
            <p className="text-xs text-muted-foreground mb-1">Attendance Rate</p>
            <p className="text-xs">
              {rate.presentDays} / {rate.totalWorkingDays} working days present
            </p>
          </div>
        ) : (
          <p className="text-xs text-red-500">No data</p>
        )}
      </CardContent>
    </Card>
  )
}

// Updated Calendar view for supervisor monthly attendance
const SupervisorAttendanceCalendar = ({ supervisorId, month }: { supervisorId: string; month: string }) => {
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "Present" | "Absent">>({})
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(month)
  const [presentDays, setPresentDays] = useState(0)
  const [totalMonthDays, setTotalMonthDays] = useState(0)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true)
        const [year, monthNum] = selectedMonth.split("-").map(Number)
        const startDate = new Date(Date.UTC(year, monthNum - 1, 1))
        const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999))

        const response = await fetch(
          `/api/attendance?supervisorId=${supervisorId}` +
          `&startDate=${startDate.toISOString()}` +
          `&endDate=${endDate.toISOString()}`,
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch attendance data: ${response.status}`)
        }

        const attendanceData = await response.json()
        const map: Record<string, "Present" | "Absent"> = {}

        if (Array.isArray(attendanceData)) {
          attendanceData.forEach((record) => {
            if (record.date) {
              const date = new Date(record.date)
              if (!isNaN(date.getTime())) {
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                const dateKey = localDate.toISOString().split("T")[0]
                if (record.status === "Present" || record.status === "Absent") {
                  map[dateKey] = record.status
                }
              }
            }
          })
        }

        // Fill in all days of the month
        const daysInMonth = endDate.getUTCDate()
        let presentCount = 0
        
        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(Date.UTC(year, monthNum - 1, d))
          const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          const dateKey = localDate.toISOString().split("T")[0]
          const dayOfWeek = date.getUTCDay()
          
          // Count present days (excluding future dates)
          if (map[dateKey] === "Present" && date <= new Date()) {
            presentCount++
          }

          if (map[dateKey] === undefined) {
            // All Sundays are marked as Absent (leave), other days default to Absent
            map[dateKey] = dayOfWeek === 0 ? "Absent" : "Absent"
          } else if (dayOfWeek === 0) {
            // Force all Sundays to be Absent regardless of data
            map[dateKey] = "Absent"
          }
        }
        
        setPresentDays(presentCount)
        setTotalMonthDays(daysInMonth)

        setAttendanceMap(map)
      } catch (err) {
        console.error("Error fetching attendance:", err)
      } finally {
        setLoading(false)
      }
    }

    if (supervisorId && selectedMonth) {
      fetchAttendance()
    }
  }, [supervisorId, selectedMonth])

  // Generate last 12 months for dropdown with unique keys
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    // Use the full date string as the key to ensure uniqueness
    const dateKey = d.toISOString().slice(0, 7)
    return {
      value: dateKey,
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
      key: `month-${dateKey}` // Add a unique key for React
    }
  })

  // Calendar grid logic
  const [year, monthNum] = selectedMonth.split("-").map(Number)
  const firstDay = new Date(Date.UTC(year, monthNum - 1, 1))
  const lastDay = new Date(Date.UTC(year, monthNum, 0))
  const daysInMonth = lastDay.getUTCDate()
  const startDayIdx = firstDay.getUTCDay()

  const calendarData = useMemo(() => {
    const days: Array<{ date: number; isCurrentMonth: boolean; isPresent?: boolean }> = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayIdx; i++) {
      days.push({ date: 0, isCurrentMonth: false })
    }

    // Add days of the current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(Date.UTC(year, monthNum - 1, d))
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      const dateKey = localDate.toISOString().split("T")[0]
      const dayOfWeek = date.getUTCDay()

      let status = attendanceMap[dateKey]
      // Force Sundays to be Absent
      if (dayOfWeek === 0) {
        status = "Absent"
      }

      days.push({
        date: d,
        isCurrentMonth: true,
        isPresent: status === "Present" ? true : status === "Absent" ? false : undefined,
      })
    }

    // Fill remaining cells to complete the grid (42 total cells for 6 weeks)
    while (days.length < 42) {
      days.push({ date: 0, isCurrentMonth: false })
    }

    return days
  }, [selectedMonth, attendanceMap, year, monthNum, daysInMonth, startDayIdx])

  if (loading) {
    return <div className="text-center py-4">Loading calendar...</div>
  }

  const selectedMonthLabel = months.find((m) => m.value === selectedMonth)?.label || selectedMonth

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Month Selection */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-base">{selectedMonthLabel}</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="Select month"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-center font-medium text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((day, index) => (
          <div
            key={index}
            className={`
              aspect-square p-2 text-sm rounded-md flex items-center justify-center
              ${!day.isCurrentMonth ? "text-muted-foreground/50" : ""}
              ${day.isPresent === true
                ? "bg-green-100 text-green-800"
                : day.isPresent === false
                  ? "bg-red-100 text-red-800"
                  : day.isCurrentMonth
                    ? "bg-background"
                    : ""
              }
            `}
          >
            {day.isCurrentMonth ? day.date : ""}
          </div>
        ))}
      </div>

      {/* Legend */}
      
      {/* Attendance Summary */}
      <div className="mt-4 mb-2 text-center">
        <p className="text-sm font-medium">
          {presentDays} {presentDays !== 1 ? '' : ''} / {totalMonthDays} day{totalMonthDays !== 1 ? 's' : ''} this month
        </p>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded border"></div>
          <span className="text-sm text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded border"></div>
          <span className="text-sm text-muted-foreground">Absent/Leave</span>
        </div>
      </div>
    </div>
  )
}

export default function SupervisorsManagement() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [formData, setFormData] = useState<FormData>(initialFormData)

  // Detail Panel States
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)
  const [supervisorTasks, setSupervisorTasks] = useState<Task[]>([])
  const [supervisorEmployees, setSupervisorEmployees] = useState<Employee[]>([])

  // Task form state
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [taskFormData, setTaskFormData] = useState<TaskFormData>(initialTaskFormData)
  const [availableProjects, setAvailableProjects] = useState<IProject[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)

  // Employee assignment state
  const [isEmployeeAssignOpen, setIsEmployeeAssignOpen] = useState(false)
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  // Task editing state
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isEditTaskFormOpen, setIsEditTaskFormOpen] = useState(false)

  useEffect(() => {
    fetchSupervisors()
    fetchAvailableEmployees()
    fetchProjects()
  }, [])

  // Fetch all available projects
  const fetchProjects = async () => {
    setIsLoadingProjects(true)
    try {
      const response = await fetch("/api/projects")
      if (!response.ok) throw new Error("Failed to fetch projects")
      const data: IProject[] = await response.json()
      console.log("Fetched projects:", data) // Debug log
      setAvailableProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
      setAvailableProjects([])
    } finally {
      setIsLoadingProjects(false)
    }
  }

  // Fetch all available employees
  const fetchAvailableEmployees = async () => {
    setLoadingEmployees(true)
    try {
      const response = await fetch("/api/employees")
      if (!response.ok) {
        throw new Error("Failed to fetch employees")
      }
      const data: Employee[] = await response.json()
      setAvailableEmployees(data)
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast.error("Failed to load employees")
    } finally {
      setLoadingEmployees(false)
    }
  }

  // Handle employee assignment
  const handleEmployeeAssign = async (employeeId: string) => {
    if (!selectedSupervisor?._id) return

    try {
      const response = await fetch(`/api/supervisors/${selectedSupervisor._id}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to assign employee")
      }

      // Refresh supervisor's employee list
      fetchSupervisorEmployees(selectedSupervisor._id)
      setIsEmployeeAssignOpen(false)
      toast.success("Employee assigned successfully")
    } catch (error) {
      console.error("Error assigning employee:", error)
      toast.error(error instanceof Error ? error.message : "Failed to assign employee")
    }
  }

  // Fetch employees assigned to a supervisor
  const fetchSupervisorEmployees = async (supervisorId: string) => {
    if (!supervisorId) return

    try {
      const response = await fetch(`/api/supervisors/${supervisorId}/employees`)
      if (!response.ok) {
        throw new Error("Failed to fetch assigned employees")
      }
      const data: Employee[] = await response.json()
      setSupervisorEmployees(data)
    } catch (error) {
      console.error("Error fetching supervisor employees:", error)
      toast.error("Failed to load assigned employees")
    }
  }

  // Fetch tasks for a specific supervisor
  const fetchSupervisorTasks = async (supervisorId: string) => {
    if (!supervisorId) return

    setIsLoadingTasks(true)
    try {
      const response = await fetch(`/api/tasks?supervisorId=${supervisorId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch tasks")
      }
      const data: Task[] = await response.json()
      setSupervisorTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error(error instanceof Error ? error.message : "Failed to load tasks")
    } finally {
      setIsLoadingTasks(false)
    }
  }

  // Open task form and reset form data
  const openTaskForm = () => {
    setTaskFormData(initialTaskFormData)
    setIsTaskFormOpen(true)
  }

  // Handle task form input changes
  const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTaskFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle project select
  const handleProjectChange = (value: string) => {
    console.log("Selected project ID:", value) // Debug log
    setTaskFormData((prev) => ({ ...prev, projectId: value }))
  }

  // Handle document type select
  const handleDocumentTypeChange = (value: string) => {
    setTaskFormData((prev) => ({ ...prev, documentType: value, file: undefined, documentUrl: "" }))
  }

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setTaskFormData((prev) => ({ ...prev, file }))
    // Placeholder: Upload logic (replace with actual API call)
    // Example: const url = await uploadFileToServer(file)
    // setTaskFormData((prev) => ({ ...prev, documentUrl: url }))
  }

  // Handle task date changes
  const handleTaskDateChange = (date: Date | undefined, field: "startDate" | "endDate") => {
    setTaskFormData((prev) => ({
      ...prev,
      [field]: date,
    }))
  }

  // Submit task form
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSupervisor?._id) {
      toast.error("No supervisor selected")
      return
    }

    if (!taskFormData.title || !taskFormData.startDate || !taskFormData.endDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskFormData,
          supervisorId: selectedSupervisor._id,
          status: "Pending",
          startDate: taskFormData.startDate?.toISOString(),
          endDate: taskFormData.endDate?.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create task")
      }

      const newTask: Task = await response.json()
      setSupervisorTasks((prev) => [...prev, newTask])
      setIsTaskFormOpen(false)
      toast.success("Task created successfully")

      // Refresh tasks after creation
      await fetchSupervisorTasks(selectedSupervisor._id)
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("Failed to create task")
    }
  }

  // Open edit task form
  const openEditTaskForm = (task: Task) => {
    setEditingTask(task)
    setTaskFormData({
      title: task.title,
      description: task.description,
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate),
      projectId: task.projectId || "",
      documentType: task.documentUrl ? "document" : "",
      documentUrl: task.documentUrl || "",
      file: undefined,
    })
    setIsEditTaskFormOpen(true)
  }

  // Close edit task form
  const closeEditTaskForm = () => {
    setIsEditTaskFormOpen(false)
    setEditingTask(null)
    setTaskFormData(initialTaskFormData)
  }

  // Handle task edit submission
  const handleTaskEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingTask?._id) {
      toast.error("No task selected for editing")
      return
    }

    if (!taskFormData.title || !taskFormData.startDate || !taskFormData.endDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch(`/api/tasks/${editingTask._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskFormData,
          startDate: taskFormData.startDate?.toISOString(),
          endDate: taskFormData.endDate?.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update task")
      }

      const updatedTask: Task = await response.json()
      setSupervisorTasks((prev) => prev.map((task) => (task._id === editingTask._id ? updatedTask : task)))
      setIsEditTaskFormOpen(false)
      setEditingTask(null)
      toast.success("Task updated successfully")

      // Refresh tasks after update
      if (selectedSupervisor?._id) {
        await fetchSupervisorTasks(selectedSupervisor._id)
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
    }
  }

  // Handle task deletion
  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete task")
      }

      setSupervisorTasks((prev) => prev.filter((task) => task._id !== taskId))
      toast.success("Task deleted successfully")
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
    }
  }

  // Update task status
  const updateTaskStatus = async (taskId: string, status: "Pending" | "In Progress" | "Completed") => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error("Failed to update task status")

      setSupervisorTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, status } : task)))
      toast.success("Task status updated")
    } catch (error) {
      console.error("Error updating task status:", error)
      toast.error("Failed to update task status")
    }
  }

  // Open supervisor details and load related data
  // const openSupervisorDetails = async (supervisor: Supervisor) => {
  //   setSelectedSupervisor(supervisor)
  //   setIsDetailPanelOpen(true)
  //   if (supervisor._id) {
  //     await fetchSupervisorTasks(supervisor._id)
  //     await fetchSupervisorEmployees(supervisor._id)
  //   }
  // }

  const fetchSupervisors = async () => {
    try {
      const response = await fetch("/api/supervisors", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to fetch supervisors")
      }
      const supervisors: Supervisor[] = await response.json()

      // Get today's date in YYYY-MM-DD
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, "0")
      const dd = String(today.getDate()).padStart(2, "0")
      const dateStr = `${yyyy}-${mm}-${dd}`

      // Fetch today's attendance records
      const attRes = await fetch(`/api/attendance?date=${dateStr}`)
      const attendanceRecords = await attRes.json()

      // Map supervisorId => attendance info
      const attendanceMap: Record<string, any> = {}
      for (const att of attendanceRecords) {
        if (att.supervisorId && typeof att.supervisorId === "object") {
          attendanceMap[att.supervisorId._id] = att
        } else if (att.supervisorId) {
          attendanceMap[att.supervisorId] = att
        }
      }

      // Merge attendance into supervisors
      const supervisorsWithAttendance = supervisors.map((supervisor) => {
        const att = attendanceMap[supervisor._id]
        return {
          ...supervisor,
          attendance: att
            ? {
              present: att.status === "Present",
              checkIn: att.checkIn || "",
              checkOut: att.checkOut || "",
              status: att.status as AttendanceStatus,
              _attendanceId: att._id,
            }
            : {
              present: false,
              status: "Absent" as AttendanceStatus,
            },
        }
      })

      setSupervisors(supervisorsWithAttendance)
    } catch (error) {
      console.error("Error fetching supervisors:", error)
      toast.error("Failed to load supervisors. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const openSupervisorDetail = async (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor)
    setIsDetailPanelOpen(true)
    await fetchSupervisorTasks(supervisor._id)
    await fetchSupervisorEmployees(supervisor._id)
  }

  const closeSupervisorDetail = () => {
    setIsDetailPanelOpen(false)
    setSelectedSupervisor(null)
    setSupervisorTasks([])
    setSupervisorEmployees([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingSupervisor ? `/api/supervisors/${editingSupervisor._id}` : "/api/supervisors"
      const method = editingSupervisor ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: editingSupervisor ? formData.status : "Active",
        }),
      })

      if (response.ok) {
        await fetchSupervisors()
        setIsAddDialogOpen(false)
        setEditingSupervisor(null)
        resetForm()
        toast.success(`${formData.name} has been ${editingSupervisor ? "updated" : "added"} successfully.`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save supervisor")
      }
    } catch (error) {
      console.error("Error saving supervisor:", error)
      toast.error("Failed to save supervisor. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/supervisors/${id}`, { method: "DELETE" })
      if (response.ok) {
        setSupervisors(supervisors.filter((s) => s._id !== id))
        if (selectedSupervisor?._id === id) {
          closeSupervisorDetail()
        }
        toast.success("Supervisor has been removed successfully.")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete supervisor")
      }
    } catch (error) {
      console.error("Error deleting supervisor:", error)
      toast.error("Failed to delete supervisor. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
  }

  const openEditDialog = (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor)
    setFormData({
      name: supervisor.name,
      email: supervisor.email,
      phone: supervisor.phone,
      salary: supervisor.salary,
      address: supervisor.address,
      status: supervisor.status,
      username: supervisor.username,
      password: supervisor.password,
    })
    setIsAddDialogOpen(true)
  }

  const closeTaskForm = () => {
    setIsTaskFormOpen(false)
    setTaskFormData(initialTaskFormData)
  }

  const filteredSupervisors = supervisors.filter((supervisor) => {
    const matchesSearch =
      supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supervisor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || supervisor.status === statusFilter
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate statistics
  const totalSupervisors = supervisors.length
  const presentToday = supervisors.filter((sup) => sup.attendance?.present).length
  const absentToday = totalSupervisors - presentToday
  const attendanceRate = totalSupervisors > 0 ? Math.round((presentToday / totalSupervisors) * 100) : 0

  // Fixed attendance change handler
  const handleAttendanceChange = async (supervisorId: string, status: AttendanceStatus) => {
    try {
      // Get today's date
      const today = new Date()
      const dateStr = today.toISOString().split("T")[0] // YYYY-MM-DD format

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supervisorId,
          status,
          date: dateStr,
          checkIn: status === "Present" ? new Date().toLocaleTimeString() : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update attendance")
      }

      // Update local state immediately for better UX
      setSupervisors((prev) =>
        prev.map((supervisor) =>
          supervisor._id === supervisorId
            ? {
              ...supervisor,
              attendance: {
                ...supervisor.attendance,
                status: status,
                present: status === "Present",
                checkIn: status === "Present" ? new Date().toLocaleTimeString() : supervisor.attendance?.checkIn,
              },
            }
            : supervisor,
        ),
      )

      toast.success(`Attendance updated to ${status}`)
    } catch (error) {
      console.error("Error updating attendance:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update attendance")
    }
  }

  // supervisor project details
  const [supervisorProjects, setSupervisorProjects] = useState<IProject[]>([])

  useEffect(() => {
    if (!selectedSupervisor) {
      setSupervisorProjects([])
      return
    }
    // Replace this with your actual fetch logic
    fetch(`/api/projects?supervisorId=${selectedSupervisor._id}`)
      .then((res) => res.json())
      .then((data) => setSupervisorProjects(data))
      .catch(() => setSupervisorProjects([]))
  }, [selectedSupervisor])

  if (loading && supervisors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading supervisors...</p>
        </div>
      </div>
    )
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSupervisors.map((supervisor) => (
        <Card
          key={supervisor._id}
          className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          onClick={() => openSupervisorDetail(supervisor)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={supervisor.avatar || "/placeholder.svg?height=48&width=48"} alt={supervisor.name} />
                  <AvatarFallback>
                    {supervisor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{supervisor.name}</h3>
                  {/* Attendance Selector */}
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={supervisor.attendance?.status || "Absent"}
                      onValueChange={(value) => handleAttendanceChange(supervisor._id, value as AttendanceStatus)}

                    >
                      <SelectTrigger className={`h-7 w-32 ${supervisor.attendance?.status === "Present" ? "bg-green-100" : "bg-red-100"}`}>
                        <div className="flex items-center gap-1">
                          {/* {getAttendanceIcon(supervisor.attendance?.status || "Absent")} */}
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
              <Badge className={getStatusColor(supervisor.status)}>{supervisor.status}</Badge>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{supervisor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{supervisor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{supervisor.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IndianRupee className="w-4 h-4 text-muted-foreground" />
                <span>{supervisor.salary.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => openEditDialog(supervisor)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-600 hover:text-green-700 border-green-500 hover:bg-green-50"
                onClick={() => window.open(`https://wa.me/${supervisor.phone.replace(/[^0-9]/g, '')}`, '_blank')}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => openSupervisorDetail(supervisor)}>
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
                    <AlertDialogTitle>Delete Supervisor</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {supervisor.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(supervisor._id)}>Delete</AlertDialogAction>
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
              <TableHead>Supervisor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSupervisors.map((supervisor) => (
              <TableRow
                key={supervisor._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => openSupervisorDetail(supervisor)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={supervisor.avatar || "/placeholder.svg?height=40&width=40"}
                        alt={supervisor.name}
                      />
                      <AvatarFallback>
                        {supervisor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{supervisor.name}</div>
                      <div className="text-sm text-muted-foreground">{supervisor.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{supervisor.phone}</div>
                    <div className="text-muted-foreground">{supervisor.address}</div>
                  </div>
                </TableCell>
                <TableCell className="flex items-center gap-1"><IndianRupee className="w-4 h-4 text-muted-foreground" />{supervisor.salary.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(supervisor.status)}>{supervisor.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Select
                        value={supervisor.attendance?.status || "Absent"}
                        onValueChange={(value) => handleAttendanceChange(supervisor._id, value as AttendanceStatus)}
                      >
                        <SelectTrigger className={`h-7 w-32 ${supervisor.attendance?.status === "Present" ? "bg-green-100" : "bg-red-100"}`}>
                          <div className="flex items-center gap-1">
                            {/* {getAttendanceIcon(supervisor.attendance?.status || "Absent")} */}
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
                    {supervisor.attendance?.checkIn && (
                      <span className="text-xs text-muted-foreground">In: {supervisor.attendance.checkIn}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(supervisor)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-600 hover:text-green-700 border-green-500 hover:bg-green-50"
                      onClick={() => window.open(`https://wa.me/${supervisor.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openSupervisorDetail(supervisor)}>
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
                          <AlertDialogTitle>Delete Supervisor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {supervisor.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(supervisor._id)}>Delete</AlertDialogAction>
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
            <CardTitle className="text-sm font-medium">Total Supervisors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSupervisors}</div>
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
          <h2 className="text-2xl font-bold">Supervisors Management</h2>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setLoading(true)
              fetchSupervisors()
            }}
            className="ml-2"
            disabled={loading}
            title="Refresh supervisors"
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
              Add Supervisor
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            aria-label={editingSupervisor ? "Edit supervisor form" : "Add new supervisor form"}
          >
            <DialogHeader>
              <DialogTitle>{editingSupervisor ? "Edit Supervisor" : "Add New Supervisor"}</DialogTitle>
              <DialogDescription>
                {editingSupervisor ? "Update supervisor information" : "Create a new supervisor record"}
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
                  <Label htmlFor="password">{editingSupervisor ? "New Password" : "Password *"}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingSupervisor ? "Leave blank to keep current" : "Enter password"}
                    required={!editingSupervisor}
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
                  <Label htmlFor="salary">Salary *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number.parseInt(e.target.value, 10) || 0 })}
                    placeholder="e.g., 65000"
                    required
                  />
                </div>
              </div>
              {editingSupervisor && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as FormData["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
                    setEditingSupervisor(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingSupervisor ? "Update Supervisor" : "Create Supervisor"}
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
              placeholder="Search supervisors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary" className="self-center">
            {filteredSupervisors.length} Total
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

      {/* Supervisors Display */}
      {viewMode === "grid" ? renderGridView() : renderListView()}

      {filteredSupervisors.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No supervisors found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "All"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first supervisor"}
          </p>
          {!searchTerm && statusFilter === "All" && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Supervisor
            </Button>
          )}
        </div>
      )}

      {/* Supervisor Detail Sheet */}
      <Sheet open={isDetailPanelOpen} onOpenChange={setIsDetailPanelOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-none flex flex-col">
          {selectedSupervisor && (
            <div className="flex flex-col h-full">
              <SheetHeader className="shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedSupervisor.avatar || "/placeholder.svg?height=64&width=64"}
                      alt={selectedSupervisor.name}
                    />
                    <AvatarFallback className="text-xl">
                      {selectedSupervisor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <SheetTitle className="text-2xl">{selectedSupervisor.name}</SheetTitle>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedSupervisor.status)}>{selectedSupervisor.status}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      openEditDialog(selectedSupervisor)
                      setIsDetailPanelOpen(false)
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
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="employees">Team</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="flex-1 overflow-y-auto pr-2 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          {selectedSupervisor.attendance?.present ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {selectedSupervisor.attendance?.present ? "Present Today" : "Absent Today"}
                            </p>
                            {selectedSupervisor.attendance?.checkIn && (
                              <p className="text-xs text-muted-foreground">
                                Check-in: {selectedSupervisor.attendance.checkIn}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Assigned projects</p>
                        <div className="space-y-1">
                          {Array.from(
                            new Set(
                              supervisorTasks
                                .filter(task => task.projectId)
                                .map(task => {
                                  if (typeof task.projectId === 'object') {
                                    return (task.projectId as IProject)?.title || null;
                                  }
                                  const project = supervisorProjects.find(p => p._id === task.projectId);
                                  return project?.title || null;
                                })
                                .filter(Boolean)
                            )
                          ).map((projectTitle, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Folder className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{projectTitle}</span>
                            </div>
                          ))}
                          {supervisorTasks.length === 0 && (
                            <p className="text-xs text-muted-foreground">No projects assigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Attendance Rate */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Monthly Attendance Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        {/* First card (current month summary) */}
                        {/* <MonthAttendanceCard
                          key={`${selectedSupervisor._id}-${new Date().toISOString().slice(0, 7)}`}
                          supervisorId={selectedSupervisor._id}
                          month={new Date().toISOString().slice(0, 7)}
                        /> */}
                        {/* Second card (previous month calendar) */}
                        <div className="space-y-2">
                          <SupervisorAttendanceCalendar
                            key={`${selectedSupervisor._id}-${new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)}`}
                            supervisorId={selectedSupervisor._id}
                            month={new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

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
                            <p className="text-sm text-muted-foreground">{selectedSupervisor.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">{selectedSupervisor.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Address</p>
                            <p className="text-sm text-muted-foreground">{selectedSupervisor.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <IndianRupee className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Salary</p>
                            <p className="text-sm text-muted-foreground">
                              ${selectedSupervisor.salary.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Hash className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Username</p>
                            <p className="text-sm text-muted-foreground">{selectedSupervisor.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Joined</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(selectedSupervisor.createdAt), "PPP")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tasks" className="flex-1 overflow-y-auto pr-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Assigned Tasks</h3>
                    <Button size="sm" onClick={openTaskForm}>
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {isLoadingTasks ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                      </div>
                    ) : supervisorTasks.length > 0 ? (
                      supervisorTasks.map((task) => (
                        <Card key={task._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{task.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={cn(
                                    "cursor-pointer hover:opacity-80 transition-opacity",
                                    getTaskStatusColor(task.status),
                                  )}
                                  variant="secondary"
                                  onClick={() => {
                                    const statuses: Array<Task["status"]> = ["Pending", "In Progress", "Completed"]
                                    const currentIndex = statuses.indexOf(task.status)
                                    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
                                    updateTaskStatus(task._id, nextStatus)
                                  }}
                                >
                                  {task.status}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditTaskForm(task)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="h-7 w-7 p-0">
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{task.title}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleTaskDelete(task._id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                            )}
                            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                              {task.projectId && (
                                <div className="flex items-center gap-2">
                                  <Folder className="w-3 h-3" />
                                  <span>
                                    {typeof task.projectId === 'object'
                                      ? (task.projectId as IProject)?.title || 'No project assigned'
                                      : 'No project assigned'
                                    }
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{format(new Date(task.startDate), "MMM dd, yyyy")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Due: {format(new Date(task.endDate), "MMM dd, yyyy")}</span>
                                </div>
                              </div>
                            </div>
                            {task.documentUrl && (
                              <div className="mt-2">
                                <a
                                  href={task.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  View Document
                                </a>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No tasks assigned yet</p>
                        <Button variant="outline" size="sm" onClick={openTaskForm} className="mt-2 bg-transparent">
                          <CalendarPlus className="w-4 h-4 mr-2" />
                          Add First Task
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="employees" className="flex-1 overflow-y-auto pr-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Team Members</h3>
                    <Button size="sm" onClick={() => setIsEmployeeAssignOpen(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Employee
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {supervisorEmployees.length > 0 ? (
                      supervisorEmployees.map((employee) => (
                        <Card key={employee._id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={employee.avatar || "/placeholder.svg?height=40&width=40"}
                                  alt={employee.name}
                                />
                                <AvatarFallback>
                                  {employee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-medium">{employee.name}</h4>
                                <p className="text-sm text-muted-foreground">{employee.position}</p>
                                <p className="text-xs text-muted-foreground">{employee.email}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 border rounded-lg bg-muted/10">
                        <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <h4 className="font-medium mb-1">No Team Members</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          This supervisor doesn't have any team members assigned yet.
                        </p>
                        <Button size="sm" onClick={() => setIsEmployeeAssignOpen(true)}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Assign Team Member
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Task Assignment Dialog */}
      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="max-w-2xl" aria-label="Add new task form">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Assign a new task to {selectedSupervisor?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Task Title"
                value={taskFormData.title}
                onChange={handleTaskFormChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Task description..."
                value={taskFormData.description}
                onChange={handleTaskFormChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !taskFormData.startDate && "text-muted-foreground",
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {taskFormData.startDate ? format(taskFormData.startDate, "PPP") : <span>Start Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={taskFormData.startDate}
                      onSelect={(d) => handleTaskDateChange(d, "startDate")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !taskFormData.endDate && "text-muted-foreground",
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {taskFormData.endDate ? format(taskFormData.endDate, "PPP") : <span>End Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={taskFormData.endDate}
                      onSelect={(d) => handleTaskDateChange(d, "endDate")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Project *</Label>
              <Select value={taskFormData.projectId} onValueChange={handleProjectChange} required>
                <SelectTrigger id="projectId" className="w-full">
                  <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project"} />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={taskFormData.documentType} onValueChange={handleDocumentTypeChange}>
                <SelectTrigger id="documentType" className="w-full">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {taskFormData.documentType && (
              <div className="space-y-2">
                <Label htmlFor="file">
                  Upload {taskFormData.documentType.charAt(0).toUpperCase() + taskFormData.documentType.slice(1)}
                </Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept={
                    taskFormData.documentType === "image"
                      ? "image/*"
                      : taskFormData.documentType === "pdf"
                        ? ".pdf"
                        : ".doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.pdf"
                  }
                  onChange={handleFileChange}
                />
                {taskFormData.file && (
                  <div className="text-xs text-muted-foreground">Selected: {taskFormData.file.name}</div>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={closeTaskForm}>
                Cancel
              </Button>
              <Button type="submit">Assign Task</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskFormOpen} onOpenChange={setIsEditTaskFormOpen}>
        <DialogContent className="max-w-2xl" aria-label="Edit task form">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details for {selectedSupervisor?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaskEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Task Title *</Label>
              <Input
                id="edit-title"
                name="title"
                placeholder="Task Title"
                value={taskFormData.title}
                onChange={handleTaskFormChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Task description..."
                value={taskFormData.description}
                onChange={handleTaskFormChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !taskFormData.startDate && "text-muted-foreground",
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {taskFormData.startDate ? format(taskFormData.startDate, "PPP") : <span>Start Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={taskFormData.startDate}
                      onSelect={(d) => handleTaskDateChange(d, "startDate")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !taskFormData.endDate && "text-muted-foreground",
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {taskFormData.endDate ? format(taskFormData.endDate, "PPP") : <span>End Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={taskFormData.endDate}
                      onSelect={(d) => handleTaskDateChange(d, "endDate")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-projectId">Project *</Label>
              <Select value={taskFormData.projectId} onValueChange={handleProjectChange} required>
                <SelectTrigger id="edit-projectId" className="w-full">
                  <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project"} />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-documentType">Document Type</Label>
              <Select value={taskFormData.documentType} onValueChange={handleDocumentTypeChange}>
                <SelectTrigger id="edit-documentType" className="w-full">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {taskFormData.documentType && (
              <div className="space-y-2">
                <Label htmlFor="edit-file">
                  Upload {taskFormData.documentType.charAt(0).toUpperCase() + taskFormData.documentType.slice(1)}
                </Label>
                <Input
                  id="edit-file"
                  name="file"
                  type="file"
                  accept={
                    taskFormData.documentType === "image"
                      ? "image/*"
                      : taskFormData.documentType === "pdf"
                        ? ".pdf"
                        : ".doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.pdf"
                  }
                  onChange={handleFileChange}
                />
                {taskFormData.file && (
                  <div className="text-xs text-muted-foreground">Selected: {taskFormData.file.name}</div>
                )}
                {taskFormData.documentUrl && !taskFormData.file && (
                  <div className="text-xs text-muted-foreground">Current: Document attached</div>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={closeEditTaskForm}>
                Cancel
              </Button>
              <Button type="submit">Update Task</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Employee Assignment Dialog */}
      <Dialog open={isEmployeeAssignOpen} onOpenChange={setIsEmployeeAssignOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Assign Employee to {selectedSupervisor?.name}</DialogTitle>
            <DialogDescription>
              Select an employee to assign to this supervisor. Click on any employee to assign them.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {loadingEmployees ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
              </div>
            ) : availableEmployees.length > 0 ? (
              <div className="space-y-2">
                {availableEmployees.map((employee) => {
                  const isAlreadyAssigned = supervisorEmployees.some((emp) => emp._id === employee._id)
                  return (
                    <div
                      key={employee._id}
                      className={cn(
                        "flex items-center justify-between p-3 border rounded-lg transition-colors",
                        isAlreadyAssigned
                          ? "bg-muted border-muted cursor-not-allowed opacity-60"
                          : "hover:bg-accent cursor-pointer",
                      )}
                      onClick={() => !isAlreadyAssigned && handleEmployeeAssign(employee._id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={employee.avatar || "/placeholder.svg?height=40&width=40"}
                            alt={employee.name}
                          />
                          <AvatarFallback>
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAlreadyAssigned ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Assigned
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline">
                            <UserPlus className="w-4 h-4 mr-1" />
                            Assign
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No employees available to assign</p>
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEmployeeAssignOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


