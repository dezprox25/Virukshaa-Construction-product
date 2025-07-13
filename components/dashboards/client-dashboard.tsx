"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FolderOpen,
  DollarSign,
  Calendar,
  MessageSquare,
  Camera,
  Home,
  CreditCard,
  Settings,
  Bell,
  TrendingUp,
  Clock,
  Menu,
  LogOut,
  User,
} from "lucide-react"
import ClientProjectsManagement from "@/components/management/client-projects"
import ClientPaymentsManagement from "@/components/management/client-payments"
import ClientFeedbackManagement from "@/components/management/client-feedback"
import ClientSettingsManagement from "@/components/management/client-settings"

const sidebarItems = [
  { title: "Dashboard", icon: Home, key: "dashboard" },
  { title: "My Projects", icon: FolderOpen, key: "projects" },
  { title: "Payments", icon: CreditCard, key: "payments" },
  { title: "Feedback", icon: MessageSquare, key: "feedback" },
  { title: "Settings", icon: Settings, key: "settings" },
]

export default function ClientDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  const projectStats = [
    { title: "Active Projects", value: "3", icon: FolderOpen, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "Total Investment", value: "$1.2M", icon: DollarSign, color: "text-green-600", bgColor: "bg-green-50" },
    { title: "Avg. Progress", value: "68%", icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-50" },
    { title: "Pending Reviews", value: "2", icon: MessageSquare, color: "text-purple-600", bgColor: "bg-purple-50" },
  ]

  const myProjects = [
    {
      name: "Luxury Villa Construction",
      progress: 75,
      status: "On Track",
      budget: "$450,000",
      completion: "Dec 2024",
      manager: "John Smith",
      location: "Beverly Hills, CA",
      lastUpdate: "2 hours ago",
    },
    {
      name: "Office Building Renovation",
      progress: 45,
      status: "Delayed",
      budget: "$280,000",
      completion: "Feb 2025",
      manager: "Sarah Johnson",
      location: "Downtown LA",
      lastUpdate: "1 day ago",
    },
    {
      name: "Warehouse Expansion",
      progress: 90,
      status: "Nearly Complete",
      budget: "$320,000",
      completion: "Nov 2024",
      manager: "Mike Davis",
      location: "Industrial District",
      lastUpdate: "3 hours ago",
    },
  ]

  const recentUpdates = [
    {
      project: "Luxury Villa Construction",
      update: "Foundation work completed. Starting with ground floor construction.",
      date: "2 hours ago",
      photos: 3,
      type: "milestone",
    },
    {
      project: "Office Building Renovation",
      update: "Electrical wiring installation in progress. 60% completed.",
      date: "1 day ago",
      photos: 5,
      type: "progress",
    },
    {
      project: "Warehouse Expansion",
      update: "Final inspections scheduled for next week.",
      date: "2 days ago",
      photos: 2,
      type: "schedule",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Track":
        return "bg-green-100 text-green-800 border-green-200"
      case "Delayed":
        return "bg-red-100 text-red-800 border-red-200"
      case "Nearly Complete":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUpdateTypeIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return <Calendar className="w-4 h-4 text-blue-600" />
      case "progress":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "schedule":
        return <Clock className="w-4 h-4 text-orange-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getSectionTitle = () => {
    const section = sidebarItems.find((item) => item.key === activeSection)
    return section ? section.title : "Dashboard"
  }

  const renderContent = () => {
    switch (activeSection) {
      case "projects":
        return <ClientProjectsManagement />
      case "payments":
        return <ClientPaymentsManagement />
      case "feedback":
        return <ClientFeedbackManagement />
      case "settings":
        return <ClientSettingsManagement />
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, Michael!</h1>
              <p className="text-gray-600">Here's an overview of your construction projects and recent activity.</p>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projectStats.map((stat) => (
                <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">Updated just now</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* My Projects */}
              <div className="xl:col-span-2">
                <Card className="h-fit">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">My Projects</CardTitle>
                        <CardDescription>Overview of your active construction projects</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setActiveSection("projects")}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {myProjects.map((project, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
                              <p className="text-sm text-gray-500">{project.location}</p>
                            </div>
                            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <span className="font-medium">Budget:</span> {project.budget}
                            </div>
                            <div>
                              <span className="font-medium">Completion:</span> {project.completion}
                            </div>
                            <div>
                              <span className="font-medium">Manager:</span> {project.manager}
                            </div>
                            <div>
                              <span className="font-medium">Progress:</span> {project.progress}%
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xs text-gray-500">Last update: {project.lastUpdate}</span>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Updates */}
              <div>
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="text-xl">Recent Updates</CardTitle>
                    <CardDescription>Latest progress from your projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentUpdates.map((update, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">{getUpdateTypeIcon(update.type)}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm mb-1">{update.project}</h4>
                              <p className="text-sm text-gray-600 mb-2">{update.update}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{update.date}</span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Camera className="w-3 h-3" />
                                  {update.photos}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => setActiveSection("feedback")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    Submit Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Share your thoughts on project progress and quality</p>
                  <Button className="w-full">Give Feedback</Button>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => setActiveSection("payments")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">View payment schedules and transaction history</p>
                  <Button className="w-full">View Payments</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Bell className="w-5 h-5 text-purple-600" />
                    </div>
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Stay updated with project notifications and alerts</p>
                  <Button className="w-full">View All</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Client Portal</h2>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              ×
            </Button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveSection(item.key)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeSection === item.key
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Client Portal</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{getSectionTitle()}</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback className="bg-blue-100 text-blue-600">MC</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Michael Chen</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {localStorage.getItem("userEmail") || "michael.chen@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveSection("settings")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveSection("settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
