"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building2,
  MapPin,
  Globe,
  Search,
  Filter,
  User,
  FileText,
  Grid3X3,
  List,
  CheckCircle,
  XCircle,
  RefreshCw,
  Users,
  DollarSign,
  Calendar,
  Eye,
  Hash,
  ClipboardList,
  FolderOpen,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  Save,
  X
} from "lucide-react"

interface Client {
  _id: string
  name: string
  email: string
  phone: string
  company?: string
  address: string
  city: string
  state: string
  postalCode: string
  projectTotalAmount: number
  taxId?: string
  website?: string
  status: 'Active' | 'Inactive'
  createdAt: string
  updatedAt: string
  avatar?: string
}

interface Project {
  id?: string
  _id?: string
  title: string
  name?: string
  description: string
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
  startDate: string
  endDate: string
  budget: number
  progress: number
  clientId: string
  client?: string
  manager?: string
  createdAt: string
  tasks: Task[]
}

interface Task {
  _id?: string
  title: string
  description: string
  status: 'Not Started' | 'In Progress' | 'Completed'
  assignedTo?: string
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
  projectId?: string
}

interface Invoice {
  _id: string
  invoiceNumber: string
  amount: number
  status: 'Pending' | 'Paid' | 'Overdue'
  dueDate: string
  createdAt: string
}

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  projectTotalAmount: "",
  taxId: "",
  website: "",
  status: "Active" as 'Active' | 'Inactive',
  avatar: "",
}

const initialProjectData: Omit<Project, 'id' | '_id' | 'client' | 'createdAt' | 'tasks'> = {
  title: "",
  description: "",
  status: "Planning",
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  budget: 0,
  progress: 0,
  clientId: "" // Adding required field
}

const initialTaskData = {
  title: "",
  description: "",
  status: "Not Started" as const,
  assignedTo: "",
  dueDate: new Date().toISOString().split('T')[0],
  priority: "Medium" as const
}

export default function ClientsManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState(initialFormData)

  // Detail Panel States
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)
  const [clientProjects, setClientProjects] = useState<Project[]>([])
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  
  // Project Form States
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [projectFormData, setProjectFormData] = useState(initialProjectData)
  const [projectTasks, setProjectTasks] = useState<Task[]>([])
  const [isSubmittingProject, setIsSubmittingProject] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskFormData, setTaskFormData] = useState(initialTaskData)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  // Local storage for projects
  const [allProjects, setAllProjects] = useState<Project[]>([])

  useEffect(() => {
    fetchClients()
    loadProjectsFromStorage()
  }, [])

  // Load projects from localStorage
  const loadProjectsFromStorage = () => {
    try {
      const storedProjects = localStorage.getItem('clientProjects')
      if (storedProjects) {
        setAllProjects(JSON.parse(storedProjects))
      }
    } catch (error) {
      console.error('Error loading projects from storage:', error)
    }
  }

  // Save projects to localStorage
  const saveProjectsToStorage = (projects: Project[]) => {
    try {
      localStorage.setItem('clientProjects', JSON.stringify(projects))
      setAllProjects(projects)
    } catch (error) {
      console.error('Error saving projects to storage:', error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients", { cache: 'no-store' })
      if (!response.ok) {
        const mockClients: Client[] = [
          {
            _id: "1",
            name: "John Smith",
            email: "john.smith@techcorp.com",
            phone: "+1 (555) 123-4567",
            company: "TechCorp Solutions",
            address: "123 Business Ave, Suite 100",
            city: "San Francisco",
            state: "CA",
            postalCode: "94105",
            projectTotalAmount: 150000,
            taxId: "12-3456789",
            website: "https://techcorp.com",
            status: "Active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
          },
          {
            _id: "2",
            name: "Sarah Johnson",
            email: "sarah@innovatedesign.com",
            phone: "+1 (555) 987-6543",
            company: "Innovate Design Studio",
            address: "456 Creative Blvd",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            projectTotalAmount: 85000,
            taxId: "98-7654321",
            website: "https://innovatedesign.com",
            status: "Active",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
            avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
          },
          {
            _id: "3",
            name: "Michael Chen",
            email: "m.chen@globalventures.com",
            phone: "+1 (555) 456-7890",
            company: "Global Ventures Inc",
            address: "789 Enterprise Way",
            city: "Austin",
            state: "TX",
            postalCode: "73301",
            projectTotalAmount: 220000,
            taxId: "45-6789012",
            website: "https://globalventures.com",
            status: "Inactive",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date().toISOString(),
            avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150"
          }
        ]
        setClients(mockClients)
        return
      }
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast.error("Failed to load clients. Using demo data.")
      const mockClients: Client[] = [
        {
          _id: "1",
          name: "John Smith",
          email: "john.smith@techcorp.com",
          phone: "+1 (555) 123-4567",
          company: "TechCorp Solutions",
          address: "123 Business Ave, Suite 100",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          projectTotalAmount: 150000,
          taxId: "12-3456789",
          website: "https://techcorp.com",
          status: "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
        },
        {
          _id: "2",
          name: "Sarah Johnson",
          email: "sarah@innovatedesign.com",
          phone: "+1 (555) 987-6543",
          company: "Innovate Design Studio",
          address: "456 Creative Blvd",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          projectTotalAmount: 85000,
          taxId: "98-7654321",
          website: "https://innovatedesign.com",
          status: "Active",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
        }
      ]
      setClients(mockClients)
    } finally {
      setLoading(false)
    }
  }

  // Fetch projects for a specific client
  const fetchClientProjects = (clientId: string) => {
    setIsLoadingProjects(true)
    try {
      const projects = allProjects.filter(project => project.clientId === clientId)
      setClientProjects(projects)
    } catch (error) {
      console.error('Error fetching client projects:', error)
      setClientProjects([])
    } finally {
      setIsLoadingProjects(false)
    }
  }

  // Fetch invoices for a specific client
  const fetchClientInvoices = async (clientId: string) => {
    if (!clientId) return
    
    setIsLoadingInvoices(true)
    try {
      const response = await fetch(`/api/invoices?clientId=${clientId}`)
      if (!response.ok) {
        const mockInvoices: Invoice[] = [
          {
            _id: "i1",
            invoiceNumber: "INV-2024-001",
            amount: 25000,
            status: "Paid",
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: "i2",
            invoiceNumber: "INV-2024-002",
            amount: 15000,
            status: "Pending",
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
          }
        ]
        setClientInvoices(mockInvoices)
        return
      }
      const data = await response.json()
      setClientInvoices(data)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      const mockInvoices: Invoice[] = [
        {
          _id: "i1",
          invoiceNumber: "INV-2024-001",
          amount: 25000,
          status: "Paid",
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setClientInvoices(mockInvoices)
    } finally {
      setIsLoadingInvoices(false)
    }
  }

  // Open client details and load related data
  const openClientDetails = async (client: Client) => {
    setSelectedClient(client)
    setIsDetailPanelOpen(true)
    if (client._id) {
      fetchClientProjects(client._id)
      await fetchClientInvoices(client._id)
    }
  }

  const closeClientDetails = () => {
    setIsDetailPanelOpen(false)
    setSelectedClient(null)
    setClientProjects([])
    setClientInvoices([])
  }

  // Project Management Functions
  const openNewProjectDialog = () => {
    setProjectFormData(initialProjectData)
    setProjectTasks([])
    setIsProjectDialogOpen(true)
  }

  const closeProjectDialog = () => {
    setIsProjectDialogOpen(false)
    setProjectFormData(initialProjectData)
    setProjectTasks([])
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return

    setIsSubmittingProject(true)
    try {
      const newProject: Project = {
        _id: Date.now().toString(),
        title: projectFormData.title,
        description: projectFormData.description,
        status: projectFormData.status,
        startDate: projectFormData.startDate,
        endDate: projectFormData.endDate,
        budget: projectFormData.budget,
        progress: projectFormData.progress,
        clientId: selectedClient._id,
        client: selectedClient.name,
        manager: projectFormData.manager,
        createdAt: new Date().toISOString(),
        tasks: projectTasks.map(task => ({
          ...task,
          _id: task._id || Date.now().toString() + Math.random().toString()
        }))
      }

      const updatedProjects = [...allProjects, newProject]
      saveProjectsToStorage(updatedProjects)
      
      // Update client projects display
      fetchClientProjects(selectedClient._id)
      
      toast.success("Project created successfully!")
      closeProjectDialog()
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error("Failed to create project")
    } finally {
      setIsSubmittingProject(false)
    }
  }

  // Task Management Functions
  const openTaskDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task)
      setTaskFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        assignedTo: task.assignedTo || "",
        dueDate: task.dueDate,
        priority: task.priority
      })
    } else {
      setEditingTask(null)
      setTaskFormData(initialTaskData)
    }
    setIsTaskDialogOpen(true)
  }

  const closeTaskDialog = () => {
    setIsTaskDialogOpen(false)
    setEditingTask(null)
    setTaskFormData(initialTaskData)
  }

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const taskData: Task = {
      _id: editingTask?._id || Date.now().toString() + Math.random().toString(),
      title: taskFormData.title,
      description: taskFormData.description,
      status: taskFormData.status,
      assignedTo: taskFormData.assignedTo,
      dueDate: taskFormData.dueDate,
      priority: taskFormData.priority
    }

    if (editingTask) {
      setProjectTasks(projectTasks.map(task => 
        task._id === editingTask._id ? taskData : task
      ))
    } else {
      setProjectTasks([...projectTasks, taskData])
    }

    closeTaskDialog()
    toast.success(`Task ${editingTask ? 'updated' : 'added'} successfully!`)
  }

  const deleteTask = (taskId: string) => {
    setProjectTasks(projectTasks.filter(task => task._id !== taskId))
    toast.success("Task deleted successfully!")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingClient ? `/api/clients/${editingClient._id}` : "/api/clients"
      const method = editingClient ? "PUT" : "POST"

      const payload = {
        ...formData,
        projectTotalAmount: Number(formData.projectTotalAmount) || 0,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await fetchClients()
        setIsAddDialogOpen(false)
        setEditingClient(null)
        resetForm()
        toast.success(`${formData.name} has been ${editingClient ? "updated" : "added"} successfully.`)
      }
    } catch (error) {
      console.error("Error saving client:", error)
      toast.error("Failed to save client. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (client: Client) => {
    const newStatus = client.status === 'Active' ? 'Inactive' : 'Active'
    try {
      const response = await fetch(`/api/clients/${client._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success(`Client status updated to ${newStatus}`)
        fetchClients()
      } else {
        toast.error('Failed to update client status.')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('An error occurred while updating status.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, { method: "DELETE" })
      if (response.ok) {
        setClients(clients.filter((c) => c._id !== id))
        if (selectedClient?._id === id) {
          closeClientDetails()
        }
        toast.success("Client has been removed successfully.")
      }
    } catch (error) {
      console.error("Error deleting client:", error)
      toast.error("Failed to delete client. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
  }

  const openEditDialog = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company || "",
      address: client.address,
      city: client.city,
      state: client.state,
      postalCode: client.postalCode,
      projectTotalAmount: client.projectTotalAmount?.toString() || "",
      taxId: client.taxId || "",
      website: client.website || "",
      status: client.status,
      avatar: client.avatar || "",
    })
    setIsAddDialogOpen(true)
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Planning":
        return "bg-yellow-100 text-yellow-800"
      case "On Hold":
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
      case "Not Started":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate statistics
  const totalClients = clients.length
  const activeClients = clients.filter(client => client.status === 'Active').length
  const inactiveClients = clients.filter(client => client.status === 'Inactive').length
  const totalRevenue = clients.reduce((sum, client) => sum + (client.projectTotalAmount || 0), 0)

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    )
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredClients.map((client) => (
        <Card 
          key={client._id} 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          onClick={() => openClientDetails(client)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={client.avatar || "/placeholder.svg"} alt={client.name} />
                  <AvatarFallback>
                    {client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                  <p className="text-sm text-muted-foreground">{client.company}</p>
                </div>
              </div>
              <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="truncate">
                  {client.city}, {client.state}
                </span>
              </div>
              {client.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {client.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>${client.projectTotalAmount?.toLocaleString() || "0"}</span>
              </div>
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => openEditDialog(client)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openClientDetails(client)}
              >
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
                    <AlertDialogTitle>Delete Client</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {client.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(client._id)}>Delete</AlertDialogAction>
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
              <TableHead>Client</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow 
                key={client._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => openClientDetails(client)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={client.avatar || "/placeholder.svg"} alt={client.name} />
                      <AvatarFallback>
                        {client.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">{client.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{client.company}</div>
                  {client.website && (
                    <a
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {client.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{client.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{client.city}, {client.state}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">${client.projectTotalAmount?.toLocaleString() || "0"}</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(client)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openClientDetails(client)}
                    >
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
                          <AlertDialogTitle>Delete Client</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {client.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(client._id)}>Delete</AlertDialogAction>
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
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Registered clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Clients</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveClients}</div>
            <p className="text-xs text-muted-foreground">
              Currently inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Project value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Clients Management</h2>
          <Button
            size="icon"
            variant="outline"
            onClick={() => { setLoading(true); fetchClients(); }}
            className="ml-2"
            disabled={loading}
            title="Refresh clients"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 00-10 10h4z"></path>
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
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            aria-label={editingClient ? "Edit client form" : "Add new client form"}
          >
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
              <DialogDescription>
                {editingClient ? "Update client information" : "Create a new client record"}
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
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
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter street address"
                    rows={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteAddress">Site Address *</Label>
                  <Textarea
                    id="siteAddress"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter site address"
                    rows={2}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State/Province"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="Postal Code"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectTotalAmount">Project Total Amount *</Label>
                  <Input
                    id="projectTotalAmount"
                    type="number"
                    value={formData.projectTotalAmount}
                    onChange={(e) => setFormData({ ...formData, projectTotalAmount: e.target.value })}
                    placeholder="Total Amount"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="Enter tax ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'Active' | 'Inactive' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingClient(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingClient ? "Update Client" : "Create Client"}
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
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary" className="self-center">
            {filteredClients.length} Total
          </Badge>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 px-3"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 px-3"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Clients Display */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No clients found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "All"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first client"}
          </p>
          {!searchTerm && statusFilter === "All" && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Client
            </Button>
          )}
        </div>
      )}

      {/* Project Form Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a project for {selectedClient?.name} with tasks and details
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleProjectSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                  placeholder="Enter project title"
                  required
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="manager">Project Manager</Label>
                <Input
                  id="manager"
                  value={projectFormData.manager}
                  onChange={(e) => setProjectFormData({ ...projectFormData, manager: e.target.value })}
                  placeholder="Enter manager name"
                />
              </div> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={projectFormData.description}
                onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={projectFormData.status} 
                  onValueChange={(value) => setProjectFormData({ ...projectFormData, status: value as Project['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={projectFormData.startDate}
                  onChange={(e) => setProjectFormData({ ...projectFormData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={projectFormData.endDate}
                  onChange={(e) => setProjectFormData({ ...projectFormData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={projectFormData.budget}
                  onChange={(e) => setProjectFormData({ ...projectFormData, budget: Number(e.target.value) })}
                  placeholder="Enter budget amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={projectFormData.progress}
                  onChange={(e) => setProjectFormData({ ...projectFormData, progress: Number(e.target.value) })}
                  placeholder="Enter progress percentage"
                />
              </div>
            </div>

            {/* Tasks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Project Tasks</h3>
                <Button type="button" variant="outline" onClick={() => openTaskDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>

              {projectTasks.length > 0 ? (
                <div className="space-y-3">
                  {projectTasks.map((task) => (
                    <Card key={task._id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge className={getTaskStatusColor(task.status)} variant="secondary">
                              {task.status}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)} variant="secondary">
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}</span>
                            </div>
                            {task.assignedTo && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{task.assignedTo}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openTaskDialog(task)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTask(task._id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No tasks added yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => openTaskDialog()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Task
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeProjectDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingProject}>
                {isSubmittingProject ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Form Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Update task details" : "Add a new task to the project"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title *</Label>
              <Input
                id="taskTitle"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea
                id="taskDescription"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskStatus">Status</Label>
                <Select 
                  value={taskFormData.status} 
                  onValueChange={(value) => setTaskFormData({ ...taskFormData, status: value as Task['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskPriority">Priority</Label>
                <Select 
                  value={taskFormData.priority} 
                  onValueChange={(value) => setTaskFormData({ ...taskFormData, priority: value as Task['priority'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={taskFormData.assignedTo}
                  onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
                  placeholder="Enter assignee name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDueDate">Due Date</Label>
                <Input
                  id="taskDueDate"
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeTaskDialog}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTask ? "Update Task" : "Add Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Client Detail Sheet */}
      <Sheet open={isDetailPanelOpen} onOpenChange={setIsDetailPanelOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-none">
          {selectedClient && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedClient.avatar || "/placeholder.svg"} alt={selectedClient.name} />
                    <AvatarFallback className="text-xl">
                      {selectedClient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <SheetTitle className="text-2xl">{selectedClient.name}</SheetTitle>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedClient.status)}>
                        {selectedClient.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      openEditDialog(selectedClient)
                      setIsDetailPanelOpen(false)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">{clientProjects.length} Projects</p>
                            <p className="text-xs text-muted-foreground">Active projects</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">{clientInvoices.length} Invoices</p>
                            <p className="text-xs text-muted-foreground">Total invoices</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Client Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Company</p>
                            <p className="text-sm text-muted-foreground">{selectedClient.company || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Address</p>
                            <p className="text-sm text-muted-foreground">{selectedClient.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-sm text-muted-foreground">{selectedClient.city}, {selectedClient.state} {selectedClient.postalCode}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Project Total</p>
                            <p className="text-sm text-muted-foreground">${selectedClient.projectTotalAmount?.toLocaleString() || "0"}</p>
                          </div>
                        </div>
                        {selectedClient.taxId && (
                          <div className="flex items-center gap-3">
                            <Hash className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Tax ID</p>
                              <p className="text-sm text-muted-foreground">{selectedClient.taxId}</p>
                            </div>
                          </div>
                        )}
                        {selectedClient.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Website</p>
                              <a
                                href={selectedClient.website.startsWith('http') ? selectedClient.website : `https://${selectedClient.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {selectedClient.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Client Since</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(selectedClient.createdAt), "PPP")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projects" className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Client Projects</h3>
                    <Button size="sm" onClick={openNewProjectDialog}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Project
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {isLoadingProjects ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                      </div>
                    ) : clientProjects.length > 0 ? (
                      clientProjects.map((project) => (
                        <Card key={project._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{project.title}</h4>
                              <Badge className={getProjectStatusColor(project.status)} variant="secondary">
                                {project.status}
                              </Badge>
                            </div>
                            {project.description && (
                              <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                            )}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{format(new Date(project.startDate), "MMM dd, yyyy")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  <span>${project.budget.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ClipboardList className="w-3 h-3" />
                                  <span>{project.tasks.length} Tasks</span>
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{project.progress}% complete</p>
                            
                            {/* Show tasks summary if available */}
                            {project.tasks.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-green-600">
                                    {project.tasks.filter(t => t.status === 'Completed').length} Completed
                                  </span>
                                  <span className="text-blue-600">
                                    {project.tasks.filter(t => t.status === 'In Progress').length} In Progress
                                  </span>
                                  <span className="text-gray-600">
                                    {project.tasks.filter(t => t.status === 'Not Started').length} Not Started
                                  </span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No projects found</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={openNewProjectDialog}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Project
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="invoices" className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Invoices</h3>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Invoice
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {isLoadingInvoices ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                      </div>
                    ) : clientInvoices.length > 0 ? (
                      clientInvoices.map((invoice) => (
                        <Card key={invoice._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Due: {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge className={getInvoiceStatusColor(invoice.status)} variant="secondary">
                                  {invoice.status}
                                </Badge>
                                <p className="text-lg font-semibold mt-1">${invoice.amount.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Created: {format(new Date(invoice.createdAt), "MMM dd, yyyy")}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No invoices found</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Invoice
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}