"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, User, DollarSign, Camera, MessageSquare, FileText, Star } from "lucide-react"

export default function ClientProjectsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const projects = [
    {
      id: "PRJ-001",
      name: "Luxury Villa Construction",
      description: "Modern 4-bedroom villa with swimming pool and garden",
      progress: 75,
      status: "On Track",
      budget: "$450,000",
      spent: "$337,500",
      startDate: "Jan 15, 2024",
      expectedCompletion: "Dec 15, 2024",
      actualCompletion: null,
      manager: "John Smith",
      location: "Beverly Hills, CA",
      contractor: "Elite Construction Co.",
      milestones: [
        { name: "Foundation", status: "Completed", date: "Feb 20, 2024" },
        { name: "Structure", status: "Completed", date: "May 15, 2024" },
        { name: "Roofing", status: "In Progress", date: "Nov 30, 2024" },
        { name: "Interior", status: "Pending", date: "Dec 15, 2024" },
      ],
      recentUpdates: [
        { date: "Nov 12, 2024", update: "Roofing work 80% complete", photos: 5 },
        { date: "Nov 10, 2024", update: "Electrical rough-in completed", photos: 3 },
      ],
    },
    {
      id: "PRJ-002",
      name: "Office Building Renovation",
      description: "Complete renovation of 5-story office building",
      progress: 45,
      status: "Delayed",
      budget: "$280,000",
      spent: "$140,000",
      startDate: "Mar 1, 2024",
      expectedCompletion: "Feb 28, 2025",
      actualCompletion: null,
      manager: "Sarah Johnson",
      location: "Downtown LA",
      contractor: "Urban Renovations LLC",
      milestones: [
        { name: "Demolition", status: "Completed", date: "Apr 15, 2024" },
        { name: "Structural Work", status: "In Progress", date: "Dec 30, 2024" },
        { name: "MEP Installation", status: "Pending", date: "Jan 31, 2025" },
        { name: "Finishing", status: "Pending", date: "Feb 28, 2025" },
      ],
      recentUpdates: [
        { date: "Nov 11, 2024", update: "Structural work delayed due to permit issues", photos: 2 },
        { date: "Nov 8, 2024", update: "Floor 3 structural work completed", photos: 4 },
      ],
    },
    {
      id: "PRJ-003",
      name: "Warehouse Expansion",
      description: "Expansion of existing warehouse facility",
      progress: 90,
      status: "Nearly Complete",
      budget: "$320,000",
      spent: "$304,000",
      startDate: "Aug 1, 2024",
      expectedCompletion: "Nov 30, 2024",
      actualCompletion: null,
      manager: "Mike Davis",
      location: "Industrial District",
      contractor: "Industrial Builders Inc.",
      milestones: [
        { name: "Site Preparation", status: "Completed", date: "Aug 15, 2024" },
        { name: "Foundation", status: "Completed", date: "Sep 15, 2024" },
        { name: "Structure", status: "Completed", date: "Oct 30, 2024" },
        { name: "Final Inspection", status: "In Progress", date: "Nov 30, 2024" },
      ],
      recentUpdates: [
        { date: "Nov 13, 2024", update: "Final inspections scheduled for next week", photos: 3 },
        { date: "Nov 9, 2024", update: "All electrical and plumbing work completed", photos: 6 },
      ],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Track":
        return "bg-green-100 text-green-800"
      case "Delayed":
        return "bg-red-100 text-red-800"
      case "Nearly Complete":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status.toLowerCase().includes(statusFilter.toLowerCase())
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Projects</h2>
          <p className="text-muted-foreground">Track and manage your construction projects</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="on track">On Track</option>
          <option value="delayed">Delayed</option>
          <option value="nearly complete">Nearly Complete</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="h-fit">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="mt-1">{project.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>Budget: {project.budget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>Spent: {project.spent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{project.manager}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{project.expectedCompletion}</span>
                </div>
              </div>

              {/* Recent Updates */}
              <div>
                <h4 className="font-medium mb-2">Recent Updates</h4>
                <div className="space-y-2">
                  {project.recentUpdates.slice(0, 2).map((update, index) => (
                    <div key={index} className="p-2 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{update.date}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Camera className="w-3 h-3" />
                          {update.photos}
                        </div>
                      </div>
                      <p className="text-sm">{update.update}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{project.name}</DialogTitle>
                      <DialogDescription>{project.description}</DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="milestones">Milestones</TabsTrigger>
                        <TabsTrigger value="updates">Updates</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Project Manager</Label>
                            <p className="text-sm text-muted-foreground">{project.manager}</p>
                          </div>
                          <div>
                            <Label>Contractor</Label>
                            <p className="text-sm text-muted-foreground">{project.contractor}</p>
                          </div>
                          <div>
                            <Label>Location</Label>
                            <p className="text-sm text-muted-foreground">{project.location}</p>
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <p className="text-sm text-muted-foreground">{project.startDate}</p>
                          </div>
                        </div>
                        <div>
                          <Label>Progress: {project.progress}%</Label>
                          <Progress value={project.progress} className="mt-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Total Budget</Label>
                            <p className="text-lg font-semibold">{project.budget}</p>
                          </div>
                          <div>
                            <Label>Amount Spent</Label>
                            <p className="text-lg font-semibold">{project.spent}</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="milestones" className="space-y-4">
                        {project.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{milestone.name}</h4>
                              <p className="text-sm text-muted-foreground">Expected: {milestone.date}</p>
                            </div>
                            <Badge className={getMilestoneColor(milestone.status)}>{milestone.status}</Badge>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="updates" className="space-y-4">
                        {project.recentUpdates.map((update, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">{update.date}</span>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Camera className="w-4 h-4" />
                                {update.photos} photos
                              </div>
                            </div>
                            <p>{update.update}</p>
                            <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                              View Photos
                            </Button>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="documents" className="space-y-4">
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Project documents will be available here</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Feedback
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Project Feedback</DialogTitle>
                      <DialogDescription>Share your feedback about {project.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Rating</Label>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-5 h-5 text-yellow-400 fill-current cursor-pointer" />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="feedback">Your Feedback</Label>
                        <Textarea
                          id="feedback"
                          placeholder="Share your thoughts about the project progress..."
                          rows={4}
                        />
                      </div>
                      <Button className="w-full">Submit Feedback</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No projects found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
