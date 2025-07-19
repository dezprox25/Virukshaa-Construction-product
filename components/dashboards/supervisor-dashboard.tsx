"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/layout/dashboard-layout"
import AttendanceChart from "@/components/charts/attendance-chart"
import { ClipboardList, Users, Package, Camera, CheckCircle, AlertTriangle } from "lucide-react"

import ProjectsManagement from "@/components/management/supervisor-projects"
import DailyLogsManagement from "@/components/management/daily-logs"
import AttendanceManagement from "@/components/management/attendance-management"
import MaterialsManagement from "@/components/management/materials-management"
import EmployeeManagement from "@/components/management/employees-management"

export default function SupervisorDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [dailyLog, setDailyLog] = useState("")
  const [materialUsed, setMaterialUsed] = useState("")

  const todayStats = [
    { title: "Workers Present", value: "28/32", icon: Users, color: "text-green-600" },
    { title: "Tasks Completed", value: "12/15", icon: CheckCircle, color: "text-blue-600" },
    { title: "Materials Used", value: "85%", icon: Package, color: "text-orange-600" },
    { title: "Safety Issues", value: "2", icon: AlertTriangle, color: "text-red-600" },
  ]

  const currentTasks = [
    { task: "Foundation Pouring - Block A", status: "In Progress", priority: "High" },
    { task: "Steel Framework Installation", status: "Pending", priority: "Medium" },
    { task: "Electrical Wiring - Floor 2", status: "Completed", priority: "Low" },
    { task: "Plumbing Installation", status: "In Progress", priority: "High" },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  const renderContent = () => {
    switch (activeSection) {
      case "task":
        return <ProjectsManagement />
      case "employee":
        return <DailyLogsManagement />
      case "team":
        return <EmployeeManagement />
      case "attendance":
        return <AttendanceManagement />
      case "materials":
        return <MaterialsManagement />
      default:
        return (
          <div className="space-y-6">
            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {todayStats.map((stat) => (
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Log Entry */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Daily Progress Log
                  </CardTitle>
                  <CardDescription>Record today's work progress and observations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="progress" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="progress">Progress</TabsTrigger>
                      <TabsTrigger value="materials">Materials</TabsTrigger>
                      <TabsTrigger value="issues">Issues</TabsTrigger>
                    </TabsList>

                    <TabsContent value="progress" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="progress-log">Work Progress</Label>
                        <Textarea
                          id="progress-log"
                          placeholder="Describe today's work progress..."
                          value={dailyLog}
                          onChange={(e) => setDailyLog(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Camera className="w-4 h-4 mr-2" />
                          Add Photo
                        </Button>
                        <Button size="sm" variant="outline">
                          Save Log
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="materials" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="materials-used">Materials Used Today</Label>
                        <Textarea
                          id="materials-used"
                          placeholder="List materials used and quantities..."
                          value={materialUsed}
                          onChange={(e) => setMaterialUsed(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <Button size="sm">Record Materials</Button>
                    </TabsContent>

                    <TabsContent value="issues" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="safety-issues">Safety Issues / Concerns</Label>
                        <Textarea id="safety-issues" placeholder="Report any safety issues or concerns..." rows={4} />
                      </div>
                      <Button size="sm" variant="destructive">
                        Report Issue
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Attendance Chart */}
              <AttendanceChart />
            </div>

            {/* Current Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>Current task assignments and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentTasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{task.task}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Mark Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Record worker attendance for today</p>
                  <Button className="w-full" onClick={() => setActiveSection("attendance")}>
                    Take Attendance
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Material Request
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Request additional materials</p>
                  <Button className="w-full" onClick={() => setActiveSection("materials")}>
                    Request Materials
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Site Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Upload progress photos</p>
                  <Button className="w-full" onClick={() => setActiveSection("logs")}>
                    Upload Photos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <DashboardLayout userRole="supervisor" activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderContent()}
    </DashboardLayout>
  )
}
