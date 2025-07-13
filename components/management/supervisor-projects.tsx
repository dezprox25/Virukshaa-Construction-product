"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import {
  FolderOpen,
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Camera,
  FileText,
  Search,
  Filter,
} from "lucide-react"

interface Project {
  id: number
  name: string
  status: "Planning" | "In Progress" | "On Hold" | "Completed"
  progress: number
  client: string
  startDate: string
  endDate: string
  location: string
  budget: number
  workersAssigned: number
  tasksCompleted: number
  totalTasks: number
  lastUpdate: string
  priority: "Low" | "Medium" | "High" | "Critical"
}

export default function SupervisorProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [updateData, setUpdateData] = useState({
    progressUpdate: "",
    workCompleted: "",
    materialsUsed: "",
    workersPresent: "",
    issues: "",
    nextSteps: "",
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      // Mock data for supervisor's assigned projects
      const mockProjects: Project[] = [
        {
          id: 1,
          name: "Downtown Office Complex",
          status: "In Progress",
          progress: 75,
          client: "ABC Corporation",
          startDate: "2024-01-15",
          endDate: "2024-12-15",
          location: "Downtown District",
          budget: 450000,
          workersAssigned: 32,
          tasksCompleted: 12,
          totalTasks: 15,
          lastUpdate: "2024-11-12",
          priority: "High",
        },
        {
          id: 2,
          name: "Residential Tower A",
          status: "Planning",
          progress: 25,
          client: "XYZ Developers",
          startDate: "2024-03-01",
          endDate: "2025-02-28",
          location: "Residential Complex",
          budget: 280000,
          workersAssigned: 24,
          tasksCompleted: 3,
          totalTasks: 12,
          lastUpdate: "2024-11-10",
          priority: "Medium",
        },
        {
          id: 3,
          name: "Industrial Warehouse",
          status: "In Progress",
          progress: 60,
          client: "Industrial Corp",
          startDate: "2024-02-01",
          endDate: "2024-11-30",
          location: "Industrial Zone",
          budget: 320000,
          workersAssigned: 28,
          tasksCompleted: 8,
          totalTasks: 14,
          lastUpdate: "2024-11-11",
          priority: "High",
        },
      ]
      setProjects(mockProjects)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return

    setLoading(true)
    try {
      // Mock API call to update project
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Project Updated",
        description: `${selectedProject.name} has been updated successfully.`,
      })

      setIsUpdateDialogOpen(false)
      setSelectedProject(null)
      resetUpdateForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetUpdateForm = () => {
    setUpdateData({
      progressUpdate: "",
      workCompleted: "",
      materialsUsed: "",
      workersPresent: "",
      issues: "",
      nextSteps: "",
    })
  }

  const openUpdateDialog = (project: Project) => {
    setSelectedProject(project)
    setIsUpdateDialogOpen(true)
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Planning":
        return "bg-yellow-100 text-yellow-800"
      case "On Hold":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4" />
      case "In Progress":
        return <Clock className="w-4 h-4" />
      case "On Hold":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <FolderOpen className="w-4 h-4" />
    }
  }

  const stats = [
    {
      title: "Assigned Projects",
      value: projects.length.toString(),
      icon: FolderOpen,
      color: "text-blue-600",
    },
    {
      title: "Active Projects",
      value: projects.filter((p) => p.status === "In Progress").length.toString(),
      icon: Clock,
      color: "text-green-600",
    },
    {
      title: "Total Workers",
      value: projects.reduce((sum, p) => sum + p.workersAssigned, 0).toString(),
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Avg. Progress",
      value: `${Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%`,
      icon: CheckCircle,
      color: "text-orange-600",
    },
  ]

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Projects</h2>
          <p className="text-muted-foreground">Manage and track your assigned construction projects</p>
        </div>
      </div>

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
            placeholder="Search projects..."
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
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <Badge variant="secondary" className="self-center">
          {filteredProjects.length} Projects
        </Badge>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.client}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusIcon(project.status)}
                    <span className="ml-1">{project.status}</span>
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{project.workersAssigned} Workers Assigned</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {project.tasksCompleted}/{project.totalTasks} Tasks Completed
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(project.startDate).toLocaleDateString()} -{" "}
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Last updated: {new Date(project.lastUpdate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => openUpdateDialog(project)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Update Project Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Project Progress</DialogTitle>
            <DialogDescription>{selectedProject && `Update progress for ${selectedProject.name}`}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="progressUpdate" className="text-sm font-medium">
                Progress Update *
              </label>
              <Textarea
                id="progressUpdate"
                value={updateData.progressUpdate}
                onChange={(e) => setUpdateData({ ...updateData, progressUpdate: e.target.value })}
                placeholder="Describe today's progress and achievements..."
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="workCompleted" className="text-sm font-medium">
                Work Completed Today
              </label>
              <Textarea
                id="workCompleted"
                value={updateData.workCompleted}
                onChange={(e) => setUpdateData({ ...updateData, workCompleted: e.target.value })}
                placeholder="List specific tasks and work completed..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="materialsUsed" className="text-sm font-medium">
                  Materials Used
                </label>
                <Textarea
                  id="materialsUsed"
                  value={updateData.materialsUsed}
                  onChange={(e) => setUpdateData({ ...updateData, materialsUsed: e.target.value })}
                  placeholder="List materials and quantities used..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="workersPresent" className="text-sm font-medium">
                  Workers Present
                </label>
                <Input
                  id="workersPresent"
                  value={updateData.workersPresent}
                  onChange={(e) => setUpdateData({ ...updateData, workersPresent: e.target.value })}
                  placeholder="Number of workers present"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="issues" className="text-sm font-medium">
                Issues & Concerns
              </label>
              <Textarea
                id="issues"
                value={updateData.issues}
                onChange={(e) => setUpdateData({ ...updateData, issues: e.target.value })}
                placeholder="Report any issues, delays, or safety concerns..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="nextSteps" className="text-sm font-medium">
                Next Steps
              </label>
              <Textarea
                id="nextSteps"
                value={updateData.nextSteps}
                onChange={(e) => setUpdateData({ ...updateData, nextSteps: e.target.value })}
                placeholder="Outline tomorrow's planned activities..."
                rows={3}
              />
            </div>
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Add Photos
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUpdateDialogOpen(false)
                    setSelectedProject(null)
                    resetUpdateForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Project"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "All"
              ? "Try adjusting your search or filter criteria"
              : "No projects have been assigned to you yet"}
          </p>
        </div>
      )}
    </div>
  )
}
