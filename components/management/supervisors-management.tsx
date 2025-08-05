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
import { SupervisorLeaveApprovalModal } from "./SupervisorLeaveApprovalModal"
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
  Calculator,
  HelpCircle,
} from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define attendance status type
type AttendanceStatus = "Present" | "Absent" | null

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
  salary: number // This is now daily salary
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
  salary: number // Daily salary
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

// Updated attendance options to include "No Status"
const attendanceOptions = [
  { value: "Present" as const, label: "Present", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  { value: "Absent" as const, label: "Absent", icon: XCircle, color: "bg-red-100 text-red-800" },
]

// Combined Attendance and Salary View Component
function CombinedAttendanceView({
  supervisorId,
  dailySalary,
  initialMonth,
}: {
  supervisorId: string
  dailySalary: number
  initialMonth?: string
}) {
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || new Date().toISOString().slice(0, 7))
  const [presentDays, setPresentDays] = useState(0)
  const [paidLeaveDays, setPaidLeaveDays] = useState(0)
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState(0)
  const [pendingLeaveDays, setPendingLeaveDays] = useState(0)
  const [totalMonthDays, setTotalMonthDays] = useState(0)
  const [attendanceRate, setAttendanceRate] = useState(0)

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
        const map: Record<string, AttendanceStatus> = {}

        // Process attendance records and store their status and leave information
        if (Array.isArray(attendanceData)) {
          attendanceData.forEach((record) => {
            if (record.date) {
              const date = new Date(record.date)
              if (!isNaN(date.getTime())) {
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                const dateKey = localDate.toISOString().split("T")[0]
                // Store the full record in the map to access all fields later
                map[dateKey] = record.status || 'Absent' // Default to 'Absent' if status is missing
              }
            }
          })
        }

        // Calculate stats from attendance records
        const daysInMonth = endDate.getUTCDate()
        let presentCount = 0
        let paidLeaveCount = 0
        let unpaidLeaveCount = 0
        let pendingLeaveCount = 0
        let totalWorkingDays = 0

        // First, process all attendance records to get leave statuses
        if (Array.isArray(attendanceData)) {
          attendanceData.forEach((record) => {
            console.log("📊 Processing attendance record:", {
              date: record.date,
              status: record.status,
              isLeaveApproved: record.isLeaveApproved,
              isLeavePaid: record.isLeavePaid,
              leaveReason: record.leaveReason
            });
            
            if (record.status === "Present") {
              presentCount++
            } else if (record.status === "Absent") {
              if (record.isLeaveApproved === true) {
                if (record.isLeavePaid === true) {
                  paidLeaveCount++
                  console.log("✅ Counted as Paid Leave")
                } else {
                  unpaidLeaveCount++
                  console.log("❌ Counted as Unpaid Leave")
                }
              } else if (record.isLeaveApproved === false || record.isLeaveApproved === undefined) {
                pendingLeaveCount++
                console.log("⏳ Counted as Pending Leave")
              }
            }
          })
        }

        // Then calculate working days and present days
        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(Date.UTC(year, monthNum - 1, d))
          const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          const dateKey = localDate.toISOString().split("T")[0]
          const dayOfWeek = date.getUTCDay()

          // Only count past dates and today for statistics
          if (date <= new Date()) {
            // Skip Sundays from working days calculation
            if (dayOfWeek !== 0) {
              totalWorkingDays++
              if (map[dateKey] === "Present") {
                presentCount++
              }
            }
          }
        }

        setPresentDays(presentCount)
        setPaidLeaveDays(paidLeaveCount)
        setUnpaidLeaveDays(unpaidLeaveCount)
        setPendingLeaveDays(pendingLeaveCount)
        setTotalMonthDays(totalWorkingDays)

        // Calculate attendance rate based on (present days + paid leave) / total working days
        const effectivePresentDays = presentCount + paidLeaveCount
        setAttendanceRate(totalWorkingDays > 0 ? Math.round((effectivePresentDays / totalWorkingDays) * 100) : 0)

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

  // Generate last 12 months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const dateKey = d.toISOString().slice(0, 7)
    return {
      value: dateKey,
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
    }
  })

  // Calendar grid logic
  const [year, monthNum] = selectedMonth.split("-").map(Number)
  const firstDay = new Date(Date.UTC(year, monthNum - 1, 1))
  const lastDay = new Date(Date.UTC(year, monthNum, 0))
  const daysInMonth = lastDay.getUTCDate()
  const startDayIdx = firstDay.getUTCDay()

  // Define attendance record type
  type AttendanceRecord = {
    status: "Present" | "Absent"
    date?: string | Date
    isLeaveApproved?: boolean
    isLeavePaid?: boolean
    leaveReason?: string
  }

  // Fetch attendance data
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])

  // Create a map of date to leave info for quick lookup
  const leaveInfoMap = useMemo(() => {
    const map: Record<string, { status: "paid" | "unpaid" | "pending"; reason?: string }> = {}
    if (Array.isArray(attendanceData)) {
      attendanceData.forEach((record: AttendanceRecord) => {
        if (record.status === "Absent" && record.date) {
          const date = new Date(record.date)
          const dateKey = date.toISOString().split("T")[0]
          if (record.isLeaveApproved === true) {
            map[dateKey] = {
              status: record.isLeavePaid ? "paid" : "unpaid",
              reason: record.leaveReason,
            }
          } else if (record.isLeaveApproved === undefined) {
            map[dateKey] = {
              status: "pending",
              reason: record.leaveReason,
            }
          }
        }
      })
    }
    return map
  }, [attendanceData])

  // Fetch attendance data when supervisorId or selectedMonth changes
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch(`/api/attendance?supervisorId=${supervisorId}&month=${selectedMonth}`)
        if (response.ok) {
          const data = await response.json()
          setAttendanceData(data)
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error)
      }
    }

    if (supervisorId && selectedMonth) {
      fetchAttendanceData()
    }
  }, [supervisorId, selectedMonth])

  const calendarData = useMemo(() => {
    const days: Array<{
      date: number
      isCurrentMonth: boolean
      status?: AttendanceStatus
      isFuture: boolean
      isSunday: boolean
      dateKey?: string
      leaveInfo?: {
        status: "paid" | "unpaid" | "pending"
        reason?: string
      }
    }> = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayIdx; i++) {
      days.push({ date: 0, isCurrentMonth: false, isFuture: false, isSunday: false })
    }

    // Add days of the current month
    const today = new Date()
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(Date.UTC(year, monthNum - 1, d))
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      const dateKey = localDate.toISOString().split("T")[0]
      const dayOfWeek = date.getUTCDay()
      const isFuture = date > today
      const isSunday = dayOfWeek === 0

      days.push({
        date: d,
        isCurrentMonth: true,
        status: attendanceMap[dateKey] || null,
        isFuture,
        isSunday,
        dateKey,
        leaveInfo: leaveInfoMap[dateKey],
      })
    }

    // Fill remaining cells to complete the grid (42 total cells for 6 weeks)
    while (days.length < 42) {
      days.push({ date: 0, isCurrentMonth: false, isFuture: false, isSunday: false })
    }

    return days
  }, [selectedMonth, attendanceMap, year, monthNum, daysInMonth, startDayIdx])

  const selectedMonthLabel = months.find((m) => m.value === selectedMonth)?.label || selectedMonth
  // Calculate total salary including paid leave days
  const totalSalary = (presentDays + paidLeaveDays) * dailySalary

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Attendance & Salary Details
            </CardTitle>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="gap-6">
            {/* Summary Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="text-3xl font-bold text-primary mb-1">{attendanceRate}%</div>
                      <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="text-3xl font-bold text-green-600 flex items-center gap-1">
                        <IndianRupee className="w-6 h-6" />
                        {totalSalary.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Salary</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Breakdown */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Salary Breakdown
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Rate:</span>
                      <span className="font-medium">₹{dailySalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Present Days:</span>
                      <span className="font-medium">{presentDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid Leave:</span>
                      <span className="font-medium text-green-600">+{paidLeaveDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unpaid Leave:</span>
                      <span className="font-medium text-amber-600">{unpaidLeaveDays} days</span>
                    </div>
                    {pendingLeaveDays > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending Approval:</span>
                        <span className="font-medium text-blue-600">{pendingLeaveDays} days</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Working Days:</span>
                      <span className="font-medium">{totalMonthDays} days</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Monthly Earnings:</span>
                      <div className="text-right">
                        <div className="text-green-600">₹{totalSalary.toLocaleString()}</div>
                        {pendingLeaveDays > 0 && (
                          <div className="text-xs text-muted-foreground font-normal">
                            +{pendingLeaveDays} day{pendingLeaveDays !== 1 ? "s" : ""} pending
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    <div>Calculation: </div>
                    <div>
                      ₹{dailySalary} × ({presentDays} present + {paidLeaveDays} paid leave) = ₹
                      {totalSalary.toLocaleString()}
                    </div>
                    {unpaidLeaveDays > 0 && (
                      <div className="text-amber-600 mt-1">
                        Note: {unpaidLeaveDays} unpaid leave day{unpaidLeaveDays !== 1 ? "s" : ""} not included
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar View */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {selectedMonthLabel} Calendar
                </h4>
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-center font-medium text-muted-foreground">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-2">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar Grid */}
                <TooltipProvider>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarData.map((day, index) => {
                      let cellClass = "aspect-square p-2 text-sm rounded-md flex items-center justify-center"
                      let tooltipContent = ""

                      if (!day.isCurrentMonth) {
                        cellClass += " text-muted-foreground/50"
                      } else if (day.isSunday) {
                        cellClass += " bg-gray-50 text-gray-400 border"
                        tooltipContent = "Sunday (Holiday)"
                      } else if (day.isFuture) {
                        cellClass += " bg-background border text-muted-foreground"
                        tooltipContent = "Future date"
                      } else if (day.status === "Present") {
                        cellClass += " bg-green-100 text-green-800 font-medium border-green-200"
                        tooltipContent = "Present"
                      } else if (day.status === "Absent" && day.leaveInfo) {
                        // Handle leave status with appropriate colors
                        if (day.leaveInfo.status === "paid") {
                          cellClass += " bg-blue-100 text-blue-800 font-medium border-blue-200"
                          tooltipContent = "Paid Leave"
                        } else if (day.leaveInfo.status === "unpaid") {
                          cellClass += " bg-amber-100 text-amber-800 font-medium border-amber-200"
                          tooltipContent = "Unpaid Leave"
                        } else if (day.leaveInfo.status === "pending") {
                          cellClass += " bg-gray-100 text-gray-800 font-medium border-gray-200"
                          tooltipContent = "Leave Pending Approval"
                        }
                        // Add leave reason to tooltip if available
                        if (day.leaveInfo.reason) {
                          tooltipContent += `\nReason: ${day.leaveInfo.reason}`
                        }
                      } else if (day.status === "Absent") {
                        cellClass += " bg-red-100 text-red-800 font-medium border-red-200"
                        tooltipContent = "Absent (No Leave)"
                      } else {
                        cellClass += " bg-background border hover:bg-muted/50"
                        tooltipContent = "No attendance record"
                      }

                      const cellContent = (
                        <div className={cellClass} key={index}>
                          {day.isCurrentMonth ? day.date : ""}
                          {day.isCurrentMonth && !day.status && !day.isFuture && !day.isSunday && (
                            <HelpCircle className="w-2 h-2 ml-1 text-muted-foreground" />
                          )}
                        </div>
                      )

                      return day.isCurrentMonth && tooltipContent ? (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
                          <TooltipContent>
                            <p>{tooltipContent}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div key={index}>{cellContent}</div>
                      )
                    })}
                  </div>
                </TooltipProvider>

                {/* Legend */}
                <div className="flex justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border-green-200 border rounded"></div>
                    <span className="text-muted-foreground">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border-red-200 border rounded"></div>
                    <span className="text-muted-foreground">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-background border rounded"></div>
                    <span className="text-muted-foreground">No Record</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-50 border rounded"></div>
                    <span className="text-muted-foreground">Holiday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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

  // Leave approval state
  const [showLeaveApproval, setShowLeaveApproval] = useState(false)
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("")
  const [leaveDates, setLeaveDates] = useState<Date[]>([])
  const [leaveReason, setLeaveReason] = useState("")
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false)

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

      // Merge attendance into supervisors - only set if explicitly recorded
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
                status: null as AttendanceStatus, // No status set
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
  const presentToday = supervisors.filter((sup) => sup.attendance?.status === "Present").length
  const absentToday = supervisors.filter((sup) => sup.attendance?.status === "Absent").length
  const noStatusToday = totalSupervisors - presentToday - absentToday
  const attendanceRate = totalSupervisors > 0 ? Math.round((presentToday / totalSupervisors) * 100) : 0

  // IMPROVED: Update attendance function with better error handling and logging
  const updateAttendance = async (
    supervisorId: string,
    status: AttendanceStatus,
    dateStr: string,
    leaveReason: string | null = null,
    isPaid = true,
  ): Promise<boolean> => {
    console.log("🔄 Starting attendance update:", {
      supervisorId,
      status,
      dateStr,
      leaveReason,
      isPaid,
    })

    try {
      // Prepare the request body
      const requestBody: any = {
        supervisorId,
        status,
        date: dateStr,
      }

      // Add leave-related fields only for Absent status
      if (status === "Absent") {
        requestBody.leaveReason = leaveReason || "Not specified"
        requestBody.isPaid = isPaid
        requestBody.isLeaveApproved = true // Auto-approve for now
        requestBody.checkOut = new Date().toISOString()
      } else {
        requestBody.checkIn = new Date().toISOString()
      }

      console.log("📤 Sending request body:", requestBody)

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📥 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API Error Response:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` }
        }

        throw new Error(errorData.message || `Failed to update attendance (${response.status})`)
      }

      const attendanceData = await response.json()
      console.log("✅ Attendance updated successfully:", attendanceData)

      // Update local state
      setSupervisors((prevSupervisors) =>
        prevSupervisors.map((supervisor) => {
          if (supervisor._id === supervisorId) {
            return {
              ...supervisor,
              attendance: {
                ...supervisor.attendance,
                present: status === "Present",
                status,
                checkIn: status === "Present" ? new Date().toLocaleTimeString() : supervisor.attendance?.checkIn,
                checkOut: status === "Absent" ? new Date().toLocaleTimeString() : supervisor.attendance?.checkOut,
                _attendanceId: attendanceData._id || supervisor.attendance?._attendanceId,
              },
            }
          }
          return supervisor
        }),
      )

      return true
    } catch (error) {
      console.error("❌ Error updating attendance:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update attendance"
      toast.error(errorMessage)
      return false
    }
  }

  // Handle leave approval with better error handling and logging
  const handleApproveLeave = async (reason: string, isPaid: boolean, dates: Date[]): Promise<boolean> => {
    console.log("🔄 Starting leave approval process:", {
      selectedSupervisorId,
      leaveDates: dates.map((d) => d.toISOString().split("T")[0]),
      reason,
      isPaid,
    })

    if (!selectedSupervisorId) {
      const errorMsg = "No supervisor selected for leave"
      console.error("❌", errorMsg)
      toast.error(errorMsg)
      return false
    }

    if (!dates || dates.length === 0) {
      const errorMsg = "No dates selected for leave"
      console.error("❌", errorMsg)
      toast.error(errorMsg)
      return false
    }

    if (!reason.trim()) {
      const errorMsg = "Please provide a reason for the leave"
      console.error("❌", errorMsg)
      toast.error(errorMsg)
      return false
    }

    setIsSubmittingLeave(true)

    try {
      // Process each date individually
      const results = await Promise.all(
        dates.map(async (date) => {
          if (!(date instanceof Date) || isNaN(date.getTime())) {
            console.error("❌ Invalid date:", date)
            return { date: 'invalid', success: false }
          }
          
          const dateStr = date.toISOString().split("T")[0]
          console.log(`📅 Processing leave for date: ${dateStr}`)
          
          try {
            const success = await updateAttendance(
              selectedSupervisorId,
              "Absent",
              dateStr,
              reason,
              isPaid
            )
            
            return { date: dateStr, success }
          } catch (error) {
            console.error(`❌ Error processing date ${dateStr}:`, error)
            return { date: dateStr, success: false, error: error.message }
          }
        })
      )

      // Check if all updates were successful
      const allSuccessful = results.every((r) => r.success)
      const anySuccessful = results.some((r) => r.success)

      if (allSuccessful) {
        console.log("✅ All leave dates processed successfully")
        toast.success("Leave approved successfully")
        // Refresh the supervisors list to update the attendance data
        await fetchSupervisors()
        return true
      } else if (anySuccessful) {
        console.warn("⚠️ Some leave dates were not processed successfully")
        toast.warning("Some leave dates were not processed. Please check the supervisor's attendance.")
        await fetchSupervisors()
        return false
      } else {
        throw new Error("Failed to process any leave days")
      }
    } catch (error) {
      console.error("❌ Error processing leave:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to process leave request"
      toast.error(errorMessage)
      return false
    } finally {
      console.log("🔄 Cleaning up leave approval state")
      setIsSubmittingLeave(false)
      setShowLeaveApproval(false)
      setLeaveReason("")
      setLeaveDates([])
      setSelectedSupervisorId("")
    }
  }

  // Handle attendance change
  const handleAttendanceChange = async (supervisorId: string, status: "Present" | "Absent") => {
    console.log("🎯 Handling attendance change:", { supervisorId, status })

    try {
      const today = new Date()
      const dateStr = today.toISOString().split("T")[0] // YYYY-MM-DD format
      const supervisor = supervisors.find((s) => s._id === supervisorId)

      if (!supervisor) {
        throw new Error("Supervisor not found")
      }

      // If marking as present, update immediately
      if (status === "Present") {
        await updateAttendance(supervisorId, "Present", dateStr)
        return
      }
      
      // If marking as absent, handle leave approval flow
      console.log("📋 Preparing leave approval for supervisor:", supervisor.name)
      
      // Create a new date object to ensure reactivity
      const currentDate = new Date()
      console.log("📅 Setting leave date:", currentDate.toISOString())
      
      // First set the supervisor ID and reset reason
      setSelectedSupervisorId(supervisorId)
      setLeaveReason("")
      
      // Set the dates and immediately open the modal
      setLeaveDates([currentDate])
      
      // Use a small timeout to ensure state is updated before opening modal
      setTimeout(() => {
        console.log("🚀 Opening modal with dates:", [currentDate].map(d => d.toISOString().split('T')[0]))
        setShowLeaveApproval(true)
      }, 50)

      // For present status, update directly
      console.log("✅ Marking as present directly")
      const success = await updateAttendance(supervisorId, status, dateStr)
      if (success) {
        toast.success(`Marked as ${status} successfully`)
        await fetchSupervisors() // Refresh data
      }
    } catch (error) {
      console.error("❌ Error updating attendance:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update attendance")
    } finally {
      setLeaveDates([])
    }
  }

  // IMPROVED: Handle leave approval with better error handling and logging
  // const handleApproveLeave = async (reason: string, isPaid: boolean): Promise<boolean> => {
  //   console.log("🔄 Starting leave approval process:", {
  //     selectedSupervisorId,
  //     leaveDates: leaveDates.map((d) => d.toISOString().split("T")[0]),
  //     reason,
  //     isPaid,
  //   })

  //   if (!selectedSupervisorId || leaveDates.length === 0) {
  //     const errorMsg = "No supervisor or dates selected for leave"
  //     console.error("❌", errorMsg)
  //     toast.error(errorMsg)
  //     return false
  //   }

  //   if (!reason.trim()) {
  //     const errorMsg = "Please provide a reason for the leave"
  //     console.error("❌", errorMsg)
  //     toast.error(errorMsg)
  //     return false
  //   }

  //   setIsSubmittingLeave(true)

  //   try {
  //     console.log("📋 Processing leave for", leaveDates.length, "day(s)")

  //     // Process each leave date
  //     const results = await Promise.all(
  //       leaveDates.map(async (date, index) => {
  //         try {
  //           const dateStr = date.toISOString().split("T")[0]
  //           console.log(`📅 Processing date ${index + 1}/${leaveDates.length}:`, dateStr)

  //           const result = await updateAttendance(selectedSupervisorId, "Absent", dateStr, reason.trim(), isPaid)

  //           console.log(`${result ? "✅" : "❌"} Date ${dateStr} processed:`, result)
  //           return result
  //         } catch (error) {
  //           console.error(`❌ Error processing leave for date ${date}:`, error)
  //           return false
  //         }
  //       }),
  //     )

  //     const successCount = results.filter(Boolean).length
  //     const totalCount = results.length

  //     console.log(`📊 Leave processing complete: ${successCount}/${totalCount} successful`)

  //     if (successCount === totalCount) {
  //       toast.success(`Successfully processed ${totalCount} day(s) of ${isPaid ? "paid" : "unpaid"} leave`)
  //       // Refresh the supervisors list to reflect the changes
  //       await fetchSupervisors()
  //       return true
  //     } else if (successCount > 0) {
  //       toast.warning(`Updated ${successCount} of ${totalCount} days. Some updates may have failed.`)
  //       await fetchSupervisors()
  //       return false
  //     } else {
  //       throw new Error("Failed to process any leave days")
  //     }
  //   } catch (error) {
  //     console.error("❌ Error processing leave:", error)
  //     const errorMessage = error instanceof Error ? error.message : "Failed to process leave request"
  //     toast.error(errorMessage)
  //     return false
  //   } finally {
  //     console.log("🔄 Cleaning up leave approval state")
  //     setIsSubmittingLeave(false)
  //     setShowLeaveApproval(false)
  //     setLeaveReason("")
  //     setLeaveDates([])
  //     setSelectedSupervisorId("")
  //   }
  // }

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
                      value={supervisor.attendance?.status || ""}
                      onValueChange={(value) => handleAttendanceChange(supervisor._id, value as AttendanceStatus)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-7 w-32",
                          supervisor.attendance?.status === "Present" && "bg-green-100 border-green-200",
                          supervisor.attendance?.status === "Absent" && "bg-red-100 border-red-200",
                          !supervisor.attendance?.status && "bg-gray-50 border-gray-200",
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <SelectValue placeholder="Set Status" />
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
                <span>₹{supervisor.salary.toLocaleString()}/day</span>
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
                className="text-green-600 hover:text-green-700 border-green-500 hover:bg-green-50 bg-transparent"
                onClick={() => window.open(`https://wa.me/${supervisor.phone.replace(/[^0-9]/g, "")}`, "_blank")}
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
              <TableHead>Daily Salary</TableHead>
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
                <TableCell className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4 text-muted-foreground" />
                  {supervisor.salary.toLocaleString()}/day
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(supervisor.status)}>{supervisor.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Select
                        value={supervisor.attendance?.status || ""}
                        onValueChange={(value) => handleAttendanceChange(supervisor._id, value as AttendanceStatus)}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-7 w-32",
                            supervisor.attendance?.status === "Present" && "bg-green-100 border-green-200",
                            supervisor.attendance?.status === "Absent" && "bg-red-100 border-red-200",
                            !supervisor.attendance?.status && "bg-gray-50 border-gray-200",
                          )}
                        >
                          <div className="flex items-center gap-1">
                            <SelectValue placeholder="Set Status" />
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
                      className="text-green-600 hover:text-green-700 border-green-500 hover:bg-green-50 bg-transparent"
                      onClick={() => window.open(`https://wa.me/${supervisor.phone.replace(/[^0-9]/g, "")}`, "_blank")}
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

  // Render the leave approval modal
  const renderLeaveApprovalModal = () => (
    <SupervisorLeaveApprovalModal
      isOpen={showLeaveApproval}
      onClose={() => setShowLeaveApproval(false)}
      onApprove={handleApproveLeave}
      supervisorName={selectedSupervisorId ? supervisors.find(s => s._id === selectedSupervisorId)?.name || 'Supervisor' : 'Supervisor'}
      selectedDates={leaveDates}
      reason={leaveReason}
      onReasonChange={setLeaveReason}
      isSubmitting={isSubmittingLeave}
    />
  )

  return (
    <div className="container mx-auto p-4 space-y-6">
      {renderLeaveApprovalModal()}

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
            <p className="text-xs text-muted-foreground">Marked present</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentToday}</div>
            <p className="text-xs text-muted-foreground">Marked absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Status</CardTitle>
            <HelpCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{noStatusToday}</div>
            <p className="text-xs text-muted-foreground">Not marked yet</p>
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
                  <Label htmlFor="salary">Daily Salary (₹) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number.parseInt(e.target.value, 10) || 0 })}
                    placeholder="e.g., 1500 (per day)"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Enter daily salary amount</p>
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
                          {selectedSupervisor.attendance?.status === "Present" ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : selectedSupervisor.attendance?.status === "Absent" ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <HelpCircle className="w-5 h-5 text-gray-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {selectedSupervisor.attendance?.status === "Present"
                                ? "Present Today"
                                : selectedSupervisor.attendance?.status === "Absent"
                                  ? "Absent Today"
                                  : "No Status Set"}
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
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">Daily Rate</p>
                            <p className="text-lg font-bold flex items-center gap-1">
                              <IndianRupee className="w-4 h-4" />
                              {selectedSupervisor.salary.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Combined Attendance and Salary View */}
                  <CombinedAttendanceView
                    supervisorId={selectedSupervisor._id}
                    dailySalary={selectedSupervisor.salary}
                    initialMonth={new Date().toISOString().slice(0, 7)}
                  />

                  {/* Project Assignment Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Project Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Assigned projects</p>
                          <div className="space-y-1">
                            {Array.from(
                              new Set(
                                supervisorTasks
                                  .filter((task) => task.projectId)
                                  .map((task) => {
                                    if (typeof task.projectId === "object") {
                                      return (task.projectId as IProject)?.title || null
                                    }
                                    const project = supervisorProjects.find((p) => p._id === task.projectId)
                                    return project?.title || null
                                  })
                                  .filter(Boolean),
                              ),
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
                            <p className="font-medium">Daily Salary</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{selectedSupervisor.salary.toLocaleString()}/day
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
                                    {typeof task.projectId === "object"
                                      ? (task.projectId as IProject)?.title || "No project assigned"
                                      : "No project assigned"}
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

      {/* Leave Approval Modal */}
      <SupervisorLeaveApprovalModal
        isOpen={showLeaveApproval}
        onClose={() => {
          setShowLeaveApproval(false)
          setSelectedSupervisorId("")
          setLeaveReason("")
          setLeaveDates([])
        }}
        onApprove={handleApproveLeave}
        isSubmitting={isSubmittingLeave}
        supervisorName={supervisors.find((s) => s._id === selectedSupervisorId)?.name || "Supervisor"}
        selectedDates={leaveDates}
        onDatesChange={setLeaveDates}
        reason={leaveReason}
        onReasonChange={setLeaveReason}
      />
    </div>
  )
}
