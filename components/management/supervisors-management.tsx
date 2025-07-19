// "use client"

// import React, { useState, useEffect, useMemo } from "react"
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow
// } from "@/components/ui/table"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter
// } from "@/components/ui/dialog"
// import {
//   AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
// } from "@/components/ui/alert-dialog"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Calendar } from "@/components/ui/calendar"
// import { format } from "date-fns"
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue
// } from "@/components/ui/select"
// import { useToast } from "@/components/ui/use-toast"
// import {
//   Plus, Edit, Trash2, Mail, Phone, MapPin, Award, Search, LayoutGrid, List, PlusCircle, RefreshCw, ClipboardList, Calendar as CalendarIcon
// } from "lucide-react"

// // Define the Supervisor type
// export interface Supervisor {
//   _id: string
//   name: string
//   email: string
//   phone: string
//   salary: number
//   address: string
//   status: "Active" | "On Leave" | "Inactive"
//   avatar?: string
//   createdAt?: string | Date
//   updatedAt?: string | Date
// }

// // Helper to get status color
// const getStatusColor = (status: Supervisor["status"]) => {
//   switch (status) {
//     case "Active": return "bg-green-500 text-white"
//     case "On Leave": return "bg-yellow-500 text-white"
//     case "Inactive": return "bg-red-500 text-white"
//     default: return "bg-gray-500 text-white"
//   }
// }

// const initialFormData = {
//   name: "",
//   email: "",
//   phone: "",
//   salary: 0,
//   address: "",
//   status: "Active" as "Active" | "On Leave" | "Inactive",
// };

// export default function SupervisorsManagement() {
//   const [supervisors, setSupervisors] = useState<Supervisor[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState("All")
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
//   const [attendance, setAttendance] = useState<Record<string, "Present" | "Absent">>({})

//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
//   const [formData, setFormData] = useState(initialFormData);

//   const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
//   const [taskFormData, setTaskFormData] = useState({
//     title: "",
//     description: "",
//     startDate: undefined as Date | undefined,
//     endDate: undefined as Date | undefined,
//     documentUrl: "",
//   });
//   const [selectedSupervisorForTask, setSelectedSupervisorForTask] = useState<string | null>(null);

//   const { toast } = useToast()

//   const fetchAllData = async () => {
//     setIsLoading(true);
//     try {
//       const [supervisorsRes, attendanceRes] = await Promise.all([
//         fetch('/api/supervisors'),
//         fetch(`/api/attendance?date=${new Date().toISOString().split("T")[0]}`)
//       ]);

//       if (!supervisorsRes.ok) throw new Error('Failed to fetch supervisors');
//       const supervisorsData = await supervisorsRes.json();
//       setSupervisors(supervisorsData);

//       const newAttendanceMap: Record<string, "Present" | "Absent"> = {};
//       if (attendanceRes.ok) {
//         const attendanceData: { supervisorId: { _id: string }; status: "Present" | "Absent" }[] = await attendanceRes.json();
//         attendanceData.forEach(record => {
//           if (record.supervisorId && record.supervisorId._id) {
//             newAttendanceMap[record.supervisorId._id] = record.status;
//           }
//         });
//       }
//       setAttendance(newAttendanceMap);

//     } catch (err: any) {
//       setError(err.message);
//       toast({ title: 'Error', description: err.message, variant: 'destructive' });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const filteredSupervisors = useMemo(() => {
//     return supervisors.filter((supervisor) => {
//       const searchTermLower = searchTerm.toLowerCase();
//       const matchesSearch = supervisor.name.toLowerCase().includes(searchTermLower) || supervisor.email.toLowerCase().includes(searchTermLower);
//       const matchesStatus = statusFilter === "All" || supervisor.status === statusFilter;
//       return matchesSearch && matchesStatus;
//     });
//   }, [supervisors, searchTerm, statusFilter]);

//   const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: name === 'salary' ? Number(value) : value }));
//   };

//   const handleStatusChange = (value: string) => {
//     setFormData(prev => ({ ...prev, status: value as Supervisor['status'] }));
//   };

//   const openForm = (supervisor: Supervisor | null) => {
//     if (supervisor) {
//       setSelectedSupervisor(supervisor);
//       setFormData(supervisor);
//     } else {
//       setSelectedSupervisor(null);
//       setFormData(initialFormData);
//     }
//     setIsFormOpen(true);
//   };

//   const closeForm = () => {
//     setIsFormOpen(false);
//     setSelectedSupervisor(null);
//     setFormData(initialFormData);
//   };

//   const openTaskForm = (supervisorId: string) => {
//     setSelectedSupervisorForTask(supervisorId);
//     setIsTaskFormOpen(true);
//   };

//   const closeTaskForm = () => {
//     setIsTaskFormOpen(false);
//     setSelectedSupervisorForTask(null);
//     setTaskFormData({
//       title: "",
//       description: "",
//       startDate: undefined,
//       endDate: undefined,
//       documentUrl: "",
//     });
//   };

//   const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setTaskFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleTaskDateChange = (date: Date | undefined, field: 'startDate' | 'endDate') => {
//     setTaskFormData(prev => ({ ...prev, [field]: date }));
//   };

//   const handleTaskSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedSupervisorForTask) return;

//     try {
//       const response = await fetch('/api/tasks', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...taskFormData, assignedTo: selectedSupervisorForTask }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to create task');
//       }

//       toast({ title: 'Success', description: 'Task created successfully.' });
//       closeTaskForm();
//     } catch (err: any) {
//       toast({ title: 'Error', description: err.message, variant: 'destructive' });
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const url = selectedSupervisor ? `/api/supervisors/${selectedSupervisor._id}` : '/api/supervisors';
//     const method = selectedSupervisor ? 'PUT' : 'POST';

//     try {
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) throw new Error('Failed to save supervisor');

//       toast({ title: 'Success', description: `Supervisor ${selectedSupervisor ? 'updated' : 'added'} successfully.` });
//       closeForm();
//       fetchAllData(); // Refresh data
//     } catch (err: any) {
//       toast({ title: 'Error', description: err.message, variant: 'destructive' });
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       const response = await fetch(`/api/supervisors/${id}`, { method: 'DELETE' });
//       if (!response.ok) throw new Error('Failed to delete supervisor');
//       toast({ title: 'Success', description: 'Supervisor deleted successfully.' });
//       fetchAllData(); // Refresh data
//     } catch (err: any) {
//       toast({ title: 'Error', description: err.message, variant: 'destructive' });
//     }
//   };

//   const handleToggleAttendance = async (supervisorId: string) => {
//     const currentStatus = attendance[supervisorId];
//     const newStatus = currentStatus === "Present" ? "Absent" : "Present";

//     try {
//       const response = await fetch("/api/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ supervisorId, date: new Date().toISOString().split("T")[0], status: newStatus }),
//       });

//       if (!response.ok) throw new Error("Failed to mark attendance");

//       setAttendance((prev) => ({ ...prev, [supervisorId]: newStatus }));
//       toast({ title: "Success", description: `Marked ${newStatus}.` });
//     } catch (err: any) {
//       toast({ title: "Error", description: err.message, variant: "destructive" });
//     }
//   };

//   if (isLoading && supervisors.length === 0) {
//     return <div className="flex items-center justify-center h-64">Loading...</div>;
//   }

//   if (error) {
//     return <div className="flex items-center justify-center h-64 text-red-500">Error: {error}</div>;
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold">Supervisors Management</h2>
//           <p className="text-muted-foreground">Manage and monitor all supervisors</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button onClick={() => fetchAllData()} variant="outline" disabled={isLoading}>
//             <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
//             Refresh
//           </Button>
//           <Button onClick={() => openForm(null)}>
//             <PlusCircle className="mr-2 h-5 w-5" />
//             Add Supervisor
//           </Button>
//         </div>
//       </div>

//       <div className="flex items-center gap-4">
//         <div className="relative w-full max-w-xs">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//           <Input
//             type="search"
//             placeholder="Search supervisors..."
//             className="pl-10"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <Select value={statusFilter} onValueChange={setStatusFilter}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Filter by status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="All">All Statuses</SelectItem>
//             <SelectItem value="Active">Active</SelectItem>
//             <SelectItem value="On Leave">On Leave</SelectItem>
//             <SelectItem value="Inactive">Inactive</SelectItem>
//           </SelectContent>
//         </Select>
//         <div className="flex items-center gap-2 ml-auto">
//           <Button variant={viewMode === "grid" ? "secondary" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
//             <LayoutGrid className="h-5 w-5" />
//           </Button>
//           <Button variant={viewMode === "list" ? "secondary" : "outline"} size="icon" onClick={() => setViewMode("list")}>
//             <List className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>

//       <Card>
//         <CardContent className="p-6">
//           <h3 className="text-lg font-semibold mb-4">Today's Attendance</h3>
//           <div className="grid grid-cols-2 gap-4 text-center">
//             <div>
//               <p className="text-2xl font-bold">{supervisors.length}</p>
//               <p className="text-sm text-muted-foreground">Total Supervisors</p>
//             </div>
//             <div>
//               <p className="text-2xl font-bold">{Object.values(attendance).filter((s) => s === "Present").length}</p>
//               <p className="text-sm text-muted-foreground">Present Today</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {viewMode === 'grid' ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredSupervisors.map((supervisor) => (
//             <Card key={supervisor._id} className="hover:shadow-lg transition-shadow">
//               <CardContent className="p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <Avatar className="h-12 w-12">
//                       <AvatarImage src={supervisor.avatar || "/placeholder.svg"} alt={supervisor.name} />
//                       <AvatarFallback>{supervisor.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <h3 className="font-semibold text-lg">{supervisor.name}</h3>
//                       <p className="text-sm text-muted-foreground">{supervisor.email}</p>
//                     </div>
//                   </div>
//                   <Badge className={getStatusColor(supervisor.status)}>{supervisor.status}</Badge>
//                 </div>
//                 <div className="space-y-2 mb-4">
//                   <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span>{supervisor.phone}</span></div>
//                   <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{supervisor.address}</span></div>
//                   <div className="flex items-center gap-2 text-sm"><Award className="w-4 h-4 text-muted-foreground" /><span>Salary: ${supervisor.salary.toLocaleString()}</span></div>
//                 </div>
//                 <div className="flex gap-2 mb-4">
//                   <Button
//                     variant={attendance[supervisor._id] === "Present" ? "default" : "outline"}
//                     size="sm"
//                     className="flex-1"
//                     onClick={() => handleToggleAttendance(supervisor._id)}
//                   >
//                     {attendance[supervisor._id] === "Present" ? "Mark Absent" : "Mark Present"}
//                   </Button>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => openForm(supervisor)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
//                   <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => openTaskForm(supervisor._id)}><ClipboardList className="w-4 h-4 mr-2" />Add Task</Button>
//                   <AlertDialog>
//                     <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
//                     <AlertDialogContent>
//                       <AlertDialogHeader><AlertDialogTitle>Delete Supervisor</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete {supervisor.name}? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
//                       <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(supervisor._id)}>Delete</AlertDialogAction></AlertDialogFooter>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       ) : (
//         <Card>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Contact</TableHead>
//                 <TableHead>Salary</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredSupervisors.map((supervisor) => (
//                 <TableRow key={supervisor._id}>
//                   <TableCell>
//                     <div className="flex items-center gap-3">
//                       <Avatar className="h-10 w-10">
//                         <AvatarImage src={supervisor.avatar || "/placeholder.svg"} alt={supervisor.name} />
//                         <AvatarFallback>{supervisor.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <div className="font-medium">{supervisor.name}</div>
//                         <div className="text-sm text-muted-foreground">{supervisor.email}</div>
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div>{supervisor.phone}</div>
//                     <div className="text-sm text-muted-foreground">{supervisor.address}</div>
//                   </TableCell>
//                   <TableCell>${supervisor.salary.toLocaleString()}</TableCell>
//                   <TableCell><Badge className={getStatusColor(supervisor.status)}>{supervisor.status}</Badge></TableCell>
//                   <TableCell className="text-right">
//                     <div className="flex gap-2 justify-end">
//                       <Button
//                         variant={attendance[supervisor._id] === "Present" ? "default" : "outline"}
//                         size="sm"
//                         onClick={() => handleToggleAttendance(supervisor._id)}
//                       >
//                         {attendance[supervisor._id] === "Present" ? "Mark Absent" : "Mark Present"}
//                       </Button>
//                       <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openForm(supervisor)}><Edit className="h-4 w-4" /></Button>
//                       <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openTaskForm(supervisor._id)}><ClipboardList className="h-4 w-4" /></Button>
//                       {/* <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openForm(supervisor)}><Edit className="h-4 w-4" /></Button> */}
//                       <AlertDialog>
//                         <AlertDialogTrigger asChild><Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
//                         <AlertDialogContent>
//                           <AlertDialogHeader><AlertDialogTitle>Delete Supervisor</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete {supervisor.name}? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
//                           <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(supervisor._id)}>Delete</AlertDialogAction></AlertDialogFooter>
//                         </AlertDialogContent>
//                       </AlertDialog>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Card>
//       )}

//       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>{selectedSupervisor ? "Edit Supervisor" : "Add New Supervisor"}</DialogTitle>
//             <DialogDescription>{selectedSupervisor ? "Update supervisor information" : "Create a new supervisor account"}</DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <Input name="name" placeholder="Name" value={formData.name} onChange={handleFormChange} required />
//               <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleFormChange} required />
//               <Input name="phone" placeholder="Phone" value={formData.phone} onChange={handleFormChange} required />
//               <Input name="salary" type="number" placeholder="Salary" value={formData.salary} onChange={handleFormChange} required />
//               <Input name="address" placeholder="Address" value={formData.address} onChange={handleFormChange} className="col-span-2" />
//               <Select name="status" value={formData.status} onValueChange={handleStatusChange}>
//                 <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Active">Active</SelectItem>
//                   <SelectItem value="On Leave">On Leave</SelectItem>
//                   <SelectItem value="Inactive">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
//               <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : selectedSupervisor ? "Update Supervisor" : "Create Supervisor"}</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Add New Task</DialogTitle>
//             <DialogDescription>Assign a new task to a supervisor.</DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleTaskSubmit} className="space-y-4">
//             <Input name="title" placeholder="Task Title" value={taskFormData.title} onChange={handleTaskFormChange} required />
//             <Textarea name="description" placeholder="Description (optional)" value={taskFormData.description} onChange={handleTaskFormChange} />
//             <div className="grid grid-cols-2 gap-4">
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button variant={"outline"} className="w-full justify-start text-left font-normal">
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {taskFormData.startDate ? format(taskFormData.startDate, "PPP") : <span>Start Date</span>}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar mode="single" selected={taskFormData.startDate} onSelect={(d) => handleTaskDateChange(d, 'startDate')} initialFocus />
//                 </PopoverContent>
//               </Popover>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button variant={"outline"} className="w-full justify-start text-left font-normal">
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {taskFormData.endDate ? format(taskFormData.endDate, "PPP") : <span>End Date</span>}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar mode="single" selected={taskFormData.endDate} onSelect={(d) => handleTaskDateChange(d, 'endDate')} initialFocus />
//                 </PopoverContent>
//               </Popover>
//             </div>
//             <Input name="documentUrl" placeholder="Document URL (optional)" value={taskFormData.documentUrl} onChange={handleTaskFormChange} />
//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={closeTaskForm}>Cancel</Button>
//               <Button type="submit">Create Task</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }


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
  UserCheck,
  DollarSign,
  Briefcase,
  Grid3X3,
  List,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MapPin,
  ClipboardList,
  Award
} from "lucide-react"

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
  }
}

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  salary: 0,
  address: "",
  status: 'Active' as 'Active' | 'On Leave' | 'Inactive',
  username: "",  
  password: ""   
}

export default function SupervisorsManagement() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState(initialFormData)

  // Task form state
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    documentUrl: "",
  })
  const [selectedSupervisorForTask, setSelectedSupervisorForTask] = useState<string | null>(null)

  useEffect(() => {
    fetchSupervisors()
  }, [])

  const fetchSupervisors = async () => {
    try {
      const response = await fetch("/api/supervisors", { cache: 'no-store' })
      const supervisors = await response.json()

      // Get today's date in YYYY-MM-DD
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      // Fetch today's attendance records
      const attRes = await fetch(`/api/attendance?date=${dateStr}`);
      const attendanceRecords = await attRes.json();

      // Map supervisorId => attendance info
      const attendanceMap: Record<string, any> = {};
      for (const att of attendanceRecords) {
        if (att.supervisorId && typeof att.supervisorId === 'object') {
          attendanceMap[att.supervisorId._id] = att;
        } else if (att.supervisorId) {
          attendanceMap[att.supervisorId] = att;
        }
      }

      // Merge attendance into supervisors
      const supervisorsWithAttendance = supervisors.map((supervisor: any) => {
        const att = attendanceMap[supervisor._id];
        return {
          ...supervisor,
          attendance: att
            ? {
              present: att.status === 'Present',
              checkIn: att.checkIn || '',
              checkOut: att.checkOut || '',
              _attendanceId: att._id,
            }
            : undefined,
        };
      });

      setSupervisors(supervisorsWithAttendance);
    } catch (error) {
      console.error("Error fetching supervisors:", error)
      toast.error("Failed to load supervisors. Please try again.")
    } finally {
      setLoading(false)
    }
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
        toast.success("Supervisor has been removed successfully.")
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
      password: supervisor.password
    })
    setIsAddDialogOpen(true)
  }

  const openTaskForm = (supervisorId: string) => {
    setSelectedSupervisorForTask(supervisorId)
    setIsTaskFormOpen(true)
  }

  const closeTaskForm = () => {
    setIsTaskFormOpen(false)
    setSelectedSupervisorForTask(null)
    setTaskFormData({
      title: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      documentUrl: "",
    })
  }

  const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTaskFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTaskDateChange = (date: Date | undefined, field: 'startDate' | 'endDate') => {
    setTaskFormData(prev => ({ ...prev, [field]: date }))
  }

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupervisorForTask) return

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskFormData,
          assignedTo: selectedSupervisorForTask,
          startDate: taskFormData.startDate?.toISOString(),
          endDate: taskFormData.endDate?.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create task')
      }

      toast.success('Task created successfully.')
      closeTaskForm()
    } catch (err: any) {
      toast.error(err.message)
    }
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

  // Calculate statistics
  const totalSupervisors = supervisors.length
  const presentToday = supervisors.filter(sup => sup.attendance?.present).length
  const absentToday = totalSupervisors - presentToday
  const attendanceRate = totalSupervisors > 0 ? Math.round((presentToday / totalSupervisors) * 100) : 0

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
        <Card key={supervisor._id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={supervisor.avatar || "/placeholder.svg"} alt={supervisor.name} />
                  <AvatarFallback>
                    {supervisor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{supervisor.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {supervisor.attendance?.present ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Present
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        <XCircle className="w-3 h-3 mr-1" />
                        Absent
                      </Badge>
                    )}
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
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>${supervisor.salary.toLocaleString()}</span>
              </div>
              {supervisor.attendance?.checkIn && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Check-in: {supervisor.attendance.checkIn}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
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
                className="flex-1 bg-transparent"
                onClick={() => openTaskForm(supervisor._id)}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Task
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
              <TableRow key={supervisor._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={supervisor.avatar || "/placeholder.svg"} alt={supervisor.name} />
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
                <TableCell>${supervisor.salary.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(supervisor.status)}>{supervisor.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <button
                        className={`rounded px-2 py-1 flex items-center gap-1 text-xs font-medium transition-colors ${supervisor.attendance?.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        onClick={async () => {
                          // Compute new status
                          const newPresent = !supervisor.attendance?.present;
                          // Get today's date in YYYY-MM-DD
                          const today = new Date();
                          const yyyy = today.getFullYear();
                          const mm = String(today.getMonth() + 1).padStart(2, '0');
                          const dd = String(today.getDate()).padStart(2, '0');
                          const dateStr = `${yyyy}-${mm}-${dd}`;
                          // Send to API
                          try {
                            await fetch('/api/attendance', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                supervisorId: supervisor._id,
                                date: dateStr,
                                status: newPresent ? 'Present' : 'Absent',
                              })
                            });
                          } catch (e) {
                            // Optionally show an error toast
                          }
                          // Refetch supervisors and attendance to sync UI with DB
                          fetchSupervisors();
                        }}
                        title="Toggle Present/Absent"
                        type="button"
                      >
                        {supervisor.attendance?.present ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {supervisor.attendance?.present ? 'Present' : 'Absent'}
                      </button>
                    </div>
                    {supervisor.attendance?.checkIn && (
                      <span className="text-xs text-muted-foreground">
                        In: {supervisor.attendance.checkIn}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(supervisor)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTaskForm(supervisor._id)}
                    >
                      <ClipboardList className="w-4 h-4" />
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
            <p className="text-xs text-muted-foreground">
              Active workforce
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentToday}</div>
            <p className="text-xs text-muted-foreground">
              Checked in today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentToday}</div>
            <p className="text-xs text-muted-foreground">
              Not present today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Today's attendance
            </p>
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
            onClick={() => { setLoading(true); fetchSupervisors(); }}
            className="ml-2"
            disabled={loading}
            title="Refresh supervisors"
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
              Add Supervisor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{editingSupervisor ? 'New Password' : 'Password *'}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingSupervisor ? 'Leave blank to keep current' : 'Enter password'}
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
                    onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value, 10) || 0 })}
                    placeholder="e.g., 65000"
                    required
                  />
                </div>
              </div>

              {editingSupervisor && (
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
            {filteredSupervisors.length} Total
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

      {/* Supervisors Display */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}

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

      {/* Task Assignment Dialog */}
      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Assign a new task to a supervisor.</DialogDescription>
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
                placeholder="Description (optional)"
                value={taskFormData.description}
                onChange={handleTaskFormChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !taskFormData.startDate && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {taskFormData.startDate ? format(taskFormData.startDate, "PPP") : <span>Start Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent mode="single" selected={taskFormData.startDate} onSelect={(d) => handleTaskDateChange(d, 'startDate')} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !taskFormData.endDate && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {taskFormData.endDate ? format(taskFormData.endDate, "PPP") : <span>End Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent mode="single" selected={taskFormData.endDate} onSelect={(d) => handleTaskDateChange(d, 'endDate')} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentUrl">Document URL</Label>
              <Input
                id="documentUrl"
                name="documentUrl"
                placeholder="Document URL (optional)"
                value={taskFormData.documentUrl}
                onChange={handleTaskFormChange}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={closeTaskForm}>Cancel</Button>
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}