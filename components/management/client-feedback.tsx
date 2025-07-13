"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MessageSquare, Send, User, ThumbsUp, AlertCircle } from "lucide-react"

export default function ClientFeedbackManagement() {
  const [selectedProject, setSelectedProject] = useState("")
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [category, setCategory] = useState("")

  const projects = [
    { id: "PRJ-001", name: "Luxury Villa Construction" },
    { id: "PRJ-002", name: "Office Building Renovation" },
    { id: "PRJ-003", name: "Warehouse Expansion" },
  ]

  const feedbackCategories = [
    "Quality of Work",
    "Communication",
    "Timeline Adherence",
    "Budget Management",
    "Safety Measures",
    "General Feedback",
  ]

  const feedbackHistory = [
    {
      id: "FB-001",
      project: "Luxury Villa Construction",
      category: "Quality of Work",
      rating: 5,
      feedback:
        "Excellent work on the foundation. Very impressed with the attention to detail and quality of materials used.",
      date: "Nov 10, 2024",
      status: "Acknowledged",
      response:
        "Thank you for your positive feedback! We're committed to maintaining this high standard throughout the project.",
      respondedBy: "John Smith",
      responseDate: "Nov 11, 2024",
    },
    {
      id: "FB-002",
      project: "Office Building Renovation",
      category: "Timeline Adherence",
      rating: 3,
      feedback:
        "Project is running behind schedule due to permit delays. Would appreciate better communication about timeline changes.",
      date: "Nov 8, 2024",
      status: "Under Review",
      response: null,
      respondedBy: null,
      responseDate: null,
    },
    {
      id: "FB-003",
      project: "Warehouse Expansion",
      category: "Communication",
      rating: 4,
      feedback: "Good communication overall, but would like more frequent photo updates of the progress.",
      date: "Nov 5, 2024",
      status: "Acknowledged",
      response: "We'll increase the frequency of photo updates. Thank you for the suggestion!",
      respondedBy: "Mike Davis",
      responseDate: "Nov 6, 2024",
    },
    {
      id: "FB-004",
      project: "Luxury Villa Construction",
      category: "Safety Measures",
      rating: 5,
      feedback: "Very pleased with the safety protocols being followed on site. Workers are always wearing proper PPE.",
      date: "Oct 28, 2024",
      status: "Acknowledged",
      response: "Safety is our top priority. Thank you for recognizing our efforts!",
      respondedBy: "John Smith",
      responseDate: "Oct 29, 2024",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Acknowledged":
        return "bg-green-100 text-green-800"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800"
      case "Pending":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Acknowledged":
        return <ThumbsUp className="w-4 h-4" />
      case "Under Review":
        return <AlertCircle className="w-4 h-4" />
      case "Pending":
        return <MessageSquare className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const renderStars = (currentRating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= currentRating ? "text-yellow-400 fill-current" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive && onRate ? () => onRate(star) : undefined}
          />
        ))}
      </div>
    )
  }

  const handleSubmitFeedback = () => {
    if (!selectedProject || !feedback || rating === 0) {
      alert("Please fill in all required fields")
      return
    }

    // Here you would typically send the feedback to your backend
    console.log({
      project: selectedProject,
      category,
      rating,
      feedback,
      date: new Date().toISOString(),
    })

    // Reset form
    setSelectedProject("")
    setCategory("")
    setRating(0)
    setFeedback("")

    alert("Feedback submitted successfully!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Project Feedback</h2>
          <p className="text-muted-foreground">Share your feedback and track responses</p>
        </div>
      </div>

      {/* Feedback Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Feedback Center
          </CardTitle>
          <CardDescription>Submit new feedback and view your feedback history</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="submit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
              <TabsTrigger value="history">Feedback History</TabsTrigger>
            </TabsList>

            <TabsContent value="submit" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-select">Select Project *</Label>
                  <select
                    id="project-select"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Choose a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-select">Feedback Category</Label>
                  <select
                    id="category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select category...</option>
                    {feedbackCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rating *</Label>
                <div className="flex items-center gap-2">
                  {renderStars(rating, true, setRating)}
                  <span className="text-sm text-muted-foreground ml-2">
                    {rating > 0 ? `${rating} out of 5 stars` : "Please select a rating"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-text">Your Feedback *</Label>
                <Textarea
                  id="feedback-text"
                  placeholder="Share your thoughts, concerns, or suggestions about the project..."
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <Button onClick={handleSubmitFeedback} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input placeholder="Search feedback..." className="max-w-sm" />
                <select className="px-3 py-2 border rounded-md">
                  <option value="all">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                {feedbackHistory.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{item.project}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.date}</span>
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">Your Rating:</span>
                          {renderStars(item.rating)}
                        </div>
                        <p className="text-sm">{item.feedback}</p>
                      </div>

                      {item.response && (
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">Response from {item.respondedBy}</span>
                            <span className="text-xs text-muted-foreground">• {item.responseDate}</span>
                          </div>
                          <p className="text-sm">{item.response}</p>
                        </div>
                      )}

                      {!item.response && item.status === "Under Review" && (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-yellow-800">
                              Your feedback is being reviewed by the project team.
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackHistory.length}</div>
            <p className="text-sm text-muted-foreground">Feedback submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(feedbackHistory.reduce((sum, item) => sum + item.rating, 0) / feedbackHistory.length).toFixed(1)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {renderStars(
                Math.round(feedbackHistory.reduce((sum, item) => sum + item.rating, 0) / feedbackHistory.length),
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((feedbackHistory.filter((item) => item.response).length / feedbackHistory.length) * 100)}%
            </div>
            <p className="text-sm text-muted-foreground">Feedback responded to</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
