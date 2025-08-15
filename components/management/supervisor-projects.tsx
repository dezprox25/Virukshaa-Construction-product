"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react"
interface TaskItem {
  _id: string
  title: string
  status: "Pending" | "In Progress" | "Completed"
  priority: "Low" | "Medium" | "High"
  projectTitle?: string
  startDate?: string
  endDate?: string
}

export default function SupervisorProjects() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const supervisorId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
      const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
      if (!supervisorId || role !== 'supervisor') {
        setTasks([])
        return
      }
      const res = await fetch(`/api/tasks?supervisorId=${encodeURIComponent(supervisorId)}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to load tasks')
      }
      const data = await res.json()
      const mapped: TaskItem[] = (data || []).map((t: any) => ({
        _id: t._id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        projectTitle: t.projectTitle || t.projectId?.title,
        startDate: t.startDate,
        endDate: t.endDate,
      }))
      setTasks(mapped)
    } catch (e: any) {
      setError(e?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === "All" || t.status === statusFilter
    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter
    const term = searchTerm.trim().toLowerCase()
    const matchesSearch =
      term === "" ||
      t.title.toLowerCase().includes(term) ||
      (t.projectTitle || "").toLowerCase().includes(term)
    return matchesStatus && matchesPriority && matchesSearch
  })

  const stats = [
    { title: "Assigned Tasks", value: tasks.length.toString(), icon: FolderOpen, color: "text-blue-600" },
    { title: "In Progress", value: tasks.filter(t => t.status === 'In Progress').length.toString(), icon: Clock, color: "text-green-600" },
    { title: "Completed", value: tasks.filter(t => t.status === 'Completed').length.toString(), icon: CheckCircle, color: "text-purple-600" },
    { title: "Pending", value: tasks.filter(t => t.status === 'Pending').length.toString(), icon: AlertCircle, color: "text-orange-600" },
  ]

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Tasks</h2>
          <p className="text-muted-foreground">Manage and track tasks assigned to you</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tasks or projects..."
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
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <Badge variant="secondary" className="self-center">
          {filteredTasks.length} Tasks
        </Badge>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.projectTitle || "Unassigned Project"}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                {task.startDate && (
                  <div>
                    <span className="font-medium text-foreground">Start:</span> {new Date(task.startDate).toLocaleDateString()}
                  </div>
                )}
                {task.endDate && (
                  <div>
                    <span className="font-medium text-foreground">Due:</span> {new Date(task.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "All" || priorityFilter !== "All"
              ? "Try adjusting your search or filter criteria"
              : "No tasks have been assigned to you yet"}
          </p>
        </div>
      )}
    </div>
  )
}
