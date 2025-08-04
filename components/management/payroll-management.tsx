// "use client"

// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Search, Download, PlusCircle, Filter, Save, X, Edit } from "lucide-react";
// import { toast } from "sonner";
// import { jsPDF } from "jspdf";

// type User = {
//   _id: string;
//   name: string;
//   email: string;
//   role: 'client' | 'supervisor' | 'supplier' | 'employee';
//   salary?: number;
//   totalPaid: number;
//   dueAmount: number;
//   lastPaymentDate?: string;
//   status: 'active' | 'inactive';
//   phone?: string;
//   address?: string;
//   [key: string]: any; // For dynamic property access
// };

// const PayrollManagement = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedRole, setSelectedRole] = useState('supervisor'); // Default to 'employee'
//   const [isLoading, setIsLoading] = useState(true);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editForm, setEditForm] = useState<User | null>(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isExporting, setIsExporting] = useState(false);

//   // Helper function to fetch data with error handling
//   const fetchWithErrorHandling = async (url: string) => {
//     try {
//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const contentType = response.headers.get('content-type');
//       if (!contentType || !contentType.includes('application/json')) {
//         throw new Error('Response is not JSON');
//       }
//       return await response.json();
//     } catch (error) {
//       console.error(`Error fetching from ${url}:`, error);
//       return []; // Return empty array on error
//     }
//   };

//   // Fetch data from all endpoints
//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         setIsLoading(true);
//         const endpoints = [
//           { url: '/api/employees', role: 'employee' },
//           { url: '/api/clients', role: 'client' },
//           { url: '/api/suppliers', role: 'supplier' },
//           { url: '/api/supervisors', role: 'supervisor' }
//         ];

//         // Fetch data from all endpoints
//         const results = await Promise.all(
//           endpoints.map(async ({ url, role }) => {
//             try {
//               const data = await fetchWithErrorHandling(url);
//               return Array.isArray(data) ? data.map(item => ({ ...item, role })) : [];
//             } catch (error) {
//               console.error(`Error processing ${url}:`, error);
//               return [];
//             }
//           })
//         );

//         // Transform data to a common format
//         const allUsers = results.flat().map((user: any) => ({
//           _id: user._id || user.id || Math.random().toString(36).substr(2, 9),
//           name: user.name || user.companyName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
//           email: user.email || `${user.role}-${Date.now()}@example.com`,
//           role: user.role || 'employee',
//           salary: typeof user.salary === 'string'
//             ? parseFloat(user.salary.replace(/[^0-9.]/g, ''))
//             : Number(user.salary || user.monthlySalary || 0),
//           totalPaid: Number(user.totalPaid || user.paidAmount || 0),
//           dueAmount: Number(user.dueAmount || user.pendingAmount || 0),
//           lastPaymentDate: user.lastPaymentDate || user.lastPayment || new Date().toISOString().split('T')[0],
//           status: user.status || 'active',
//           phone: user.phone || user.phoneNumber || '',
//           address: user.address || '',
//           ...user
//         }));

//         // If no data was fetched, use mock data as fallback
//         if (allUsers.length === 0) {
//           console.warn('No data received from APIs, using mock data');
//         } else {
//           setUsers(allUsers);
//         }
//       } catch (error) {
//         console.error('Error in fetchAllData:', error);
//         toast.error('Failed to load data. Some features may be limited.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllData();
//   }, []);

//   // Update filtered users when search term or role filter changes
//   useEffect(() => {
//     const filtered = users.filter(user => {
//       const matchesRole = selectedRole === 'all' || user.role === selectedRole;
//       const matchesSearch = searchTerm === '' ||
//         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.email.toLowerCase().includes(searchTerm.toLowerCase());
//       return matchesRole && matchesSearch;
//     });
//     setFilteredUsers(filtered);
//   }, [searchTerm, users, selectedRole]);

//   const handleEdit = (user: User) => {
//     setEditingId(user._id);
//     setEditForm({ ...user });
//   };

//   const handleSave = async () => {
//     if (!editForm || !editForm.role || isSaving) return;

//     setIsSaving(true);
//     const apiPath = `/api/${editForm.role.toLowerCase()}s`;
//     const userId = editForm._id;

//     // Find the original user state to calculate the payment amount
//     const originalUser = users.find(u => u._id === userId);
//     const originalPaid = originalUser ? originalUser.totalPaid : 0;
//     const paymentAmount = editForm.totalPaid - originalPaid;

//     try {
//       const response = await fetch(`${apiPath}/${userId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(editForm),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to save data');
//       }

//       const updatedUser = await response.json();

//       // Update local state
//       setUsers(prev =>
//         prev.map(u => (u._id === updatedUser._id ? { ...u, ...updatedUser } : u))
//       );

//       // Log the payment transaction only if a payment was made
//       if (paymentAmount > 0) {
//         await fetch('/api/payroll', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             user: userId,
//             userRole: editForm.role,
//             amount: paymentAmount, // Log the actual amount paid in this transaction
//             paymentDate: new Date(),
//             status: 'paid',
//             notes: `Payment of ${paymentAmount} recorded.`,
//           }),
//         });
//       }

//       setEditForm(null);
//       setEditingId(null);
//       toast.success('Saved successfully!');
//     } catch (error) {
//       console.error('Save error:', error);
//       toast.error('Failed to save. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleInputChange = (field: string, value: string | number) => {
//     setEditForm(prev => {
//       if (!prev) return prev;
//       const newForm = { ...prev, [field]: value };

//       const baseAmount = Number(newForm.salary) || 0;
//       const totalPaid = Number(newForm.totalPaid) || 0;
//       newForm.dueAmount = baseAmount - totalPaid;

//       if (field === 'totalPaid' && Number(value) > 0) {
//         newForm.lastPaymentDate = new Date().toISOString();
//       }

//       return newForm;
//     });
//   };


//   const handleExportToPDF = () => {
//     setIsExporting(true);

//     try {
//       // Create a new PDF document
//       const doc = new jsPDF();
//       const currentDate = new Date().toLocaleDateString();

//       // Add title and date
//       doc.setFontSize(18);
//       doc.text('Payroll Management Report', 14, 22);
//       doc.setFontSize(10);
//       doc.text(`Generated on: ${currentDate}`, 14, 30);

//       // Group users by role
//       const roles = ['employee', 'supervisor', 'client', 'supplier'];
//       let startY = 40;

//       roles.forEach(role => {
//         const roleUsers = users.filter(user => user.role === role);
//         if (roleUsers.length === 0) return;

//         // Add role header
//         doc.setFontSize(14);
//         doc.text(`${role.charAt(0).toUpperCase() + role.slice(1)}s`, 14, startY);
//         startY += 10;

//         // Set up table
//         const headers = ['Name', 'Email', 'Phone', 'Salary', 'Total Paid', 'Due', 'Last Payment', 'Status'];
//         const columnWidths = [20, 43, 23, 20, 18, 18, 40, 20];
//         const rowHeight = 10;
//         const margin = 5;

//         // Draw table headers
//         let x = margin;
//         doc.setFontSize(9);
//         doc.setFont('helvetica', 'bold');
//         headers.forEach((header, i) => {
//           doc.text(header, x, startY);
//           x += columnWidths[i];
//         });

//         // Draw line under headers
//         startY += 4;
//         doc.line(margin, startY, margin + columnWidths.reduce((a, b) => a + b, 0), startY);
//         startY += 4;

//         // Draw table rows
//         doc.setFont('helvetica', 'normal');
//         roleUsers.forEach(user => {
//           if (startY > 280) { // Check if we need a new page
//             doc.addPage();
//             startY = 20;
//           }

//           const row = [
//             user.name || 'N/A',
//             user.email || 'N/A',
//             user.phone || 'N/A',
//             user.salary ? `$${user.salary.toFixed(2)}` : 'N/A',
//             `$${user.totalPaid?.toFixed(2) || '0.00'}`,
//             `$${user.dueAmount?.toFixed(2) || '0.00'}`,
//             user.lastPaymentDate || 'N/A',
//             user.status || 'N/A'
//           ];

//           x = margin;
//           row.forEach((cell, i) => {
//             // Split text if it's too long for the column
//             const splitText = doc.splitTextToSize(cell, columnWidths[i] - 2);
//             doc.text(splitText, x + 2, startY + 5);
//             x += columnWidths[i];
//           });

//           startY += rowHeight;

//           // Draw line between rows
//           if (startY < 280) {
//             doc.line(margin, startY, margin + columnWidths.reduce((a, b) => a + b, 0), startY);
//             startY += 5;
//           }
//         });

//         // Add space between role sections
//         startY += 15;
//       });

//       // Save the PDF
//       doc.save(`payroll-report-${new Date().toISOString().split('T')[0]}.pdf`);
//       toast.success('PDF exported successfully!');
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       toast.error('Failed to generate PDF');
//     } finally {
//       setIsExporting(false);
//     }
//   }

//   const handleCancel = () => {
//     setEditingId(null);
//     setEditForm(null);
//   };




//   // Get users by role for stats
//   const clients = users.filter(user => user.role === 'client');
//   const employees = users.filter(user => user.role === 'employee');
//   const supervisors = users.filter(user => user.role === 'supervisor');
//   const suppliers = users.filter(user => user.role === 'supplier');

//   const stats = [
//     {
//       title: 'Supervisors',
//       role: 'supervisor',
//       amount: supervisors.reduce((sum, user) => sum + (user.salary || 0), 0),
//       due: supervisors.reduce((sum, user) => sum + (user.dueAmount || 0), 0),
//       count: supervisors.length,
//       description: 'Supervisor payments',
//       color: 'bg-purple-100 text-purple-800',

//     },
//     {
//       title: 'Employees',
//       role: 'employee',
//       amount: employees.reduce((sum, user) => sum + (user.salary || 0), 0),
//       due: employees.reduce((sum, user) => sum + (user.dueAmount || 0), 0),
//       count: employees.length,
//       description: 'Total salary to be paid',
//       color: 'bg-green-100 text-green-800',

//     },
//     {
//       title: 'Clients',
//       role: 'client',
//       amount: clients.reduce((sum, user) => sum + (user.projectTotalAmount || 0), 0),
//       due: clients.reduce((sum, user) => sum + (user.dueAmount || 0), 0),
//       count: clients.length,
//       description: 'Total project value',
//       color: 'bg-blue-100 text-blue-800',

//     },

//     {
//       title: 'Suppliers',
//       role: 'supplier',
//       amount: suppliers.reduce((sum, user) => sum + (user.totalPaid || 0), 0),
//       due: suppliers.reduce((sum, user) => sum + (user.dueAmount || 0), 0),
//       count: suppliers.length,
//       description: 'Supplier payments',
//       color: 'bg-amber-100 text-amber-800',

//     },
//   ];

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center p-12">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold tracking-tight">Payroll Management</h2>
//           <p className="text-muted-foreground">
//             Manage payments, salaries, and financial transactions
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             className="h-8 gap-1"
//             onClick={handleExportToPDF}
//             disabled={isExporting}
//           >
//             <Download className="h-3.5 w-3.5" />
//             <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
//               {isExporting ? 'Exporting...' : 'Export'}
//             </span>
//           </Button>
//           <Button size="sm" className="h-8 gap-1">
//             <PlusCircle className="h-3.5 w-3.5" />
//             <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
//               Add Payment
//             </span>
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {stats.map((stat, index) => (
//           <Card
//             key={index}
//             className={`shadow-sm cursor-pointer transition-all hover:scale-105 ${selectedRole === stat.role ? `${stat.color}` : ''}`}
//             onClick={() => setSelectedRole(stat.role)}
//           >
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 {stat.title}
//               </CardTitle>
//               <div className={`h-8 w-8 rounded-full flex items-center justify-center `}>
//                 {stat.count}
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{formatCurrency(stat.amount)}</div>
//               <p className="text-xs text-muted-foreground">
//                 {stat.due > 0 ? `${formatCurrency(stat.due)} due` : 'All caught up'}
//               </p>
//               <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* User Table */}
//       <Card>
//         <div className="p-4 border-b">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div className="relative w-full md:w-64">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 type="search"
//                 placeholder="Search users..."
//                 className="w-full pl-8"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <Button variant="outline" size="sm" className="h-8 gap-1">
//                 <Filter className="h-3.5 w-3.5" />
//                 <span>Filter</span>
//               </Button>
//             </div>
//           </div>
//         </div>
//         <div className="rounded-b-md border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Role</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead className="text-right">
//                   {selectedRole === 'client' ? 'Project Amount' : 'Salary'}
//                 </TableHead>
//                 <TableHead className="text-right">Paid</TableHead>
//                 <TableHead className="text-right">Due</TableHead>
//                 <TableHead>Last Payment</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="w-[100px]">Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredUsers.length > 0 ? (
//                 filteredUsers.map((user) => (
//                   <TableRow key={user._id}>
//                     <TableCell className="font-medium">
//                       <div className="font-medium">{user.name}</div>
//                       {user.phone && <div className="text-xs text-muted-foreground">{user.phone}</div>}
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant="outline" className="capitalize">
//                         {user.role}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{user.email}</TableCell>
//                     <TableCell className="text-right">
//                       {editingId === user._id && editForm ? (
//                         <Input
//                           type="number"
//                           value={editForm.salary || ''}
//                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('salary', Number(e.target.value))}
//                           className="w-24"
//                         />
//                       ) : (
//                         user.role === 'client'
//                           ? formatCurrency(user.projectTotalAmount || 0)
//                           : (user.role === 'employee' || user.role === 'supervisor') && user.salary
//                             ? formatCurrency(user.salary)
//                             : '-'
//                       )}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       {editingId === user._id && editForm ? (
//                         <Input
//                           type="number"
//                           value={editForm.totalPaid || ''}
//                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('totalPaid', Number(e.target.value))}
//                           className="w-24"
//                         />
//                       ) : (
//                         formatCurrency(user.totalPaid)
//                       )}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       {editingId === user._id && editForm ? (
//                         <span className="text-muted-foreground">{formatCurrency(editForm.dueAmount || 0)}</span>
//                       ) : (
//                         user.dueAmount > 0 ? (
//                           <span className="text-red-600">{formatCurrency(user.dueAmount)}</span>
//                         ) : (
//                           <span className="text-green-600">Paid</span>
//                         )
//                       )}
//                     </TableCell>
//                     <TableCell>
//                       {editingId === user._id && editForm ? (
//                         <span className="text-xs text-muted-foreground">{new Date(editForm.lastPaymentDate || Date.now()).toLocaleDateString()}</span>
//                       ) : (
//                         user.lastPaymentDate ? new Date(user.lastPaymentDate).toLocaleDateString() : 'N/A'
//                       )}
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
//                         {user.status}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="space-x-1 text-right">
//                       {editingId === user._id ? (
//                         <>
//                           <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving}>
//                             <Save className="h-4 w-4" />
//                           </Button>
//                           <Button variant="ghost" size="icon" onClick={handleCancel}>
//                             <X className="h-4 w-4" />
//                           </Button>
//                         </>
//                       ) : (
//                         <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={9} className="h-24 text-center">
//                     No users found for &quot;{selectedRole}&quot;.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default PayrollManagement;




"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Download, PlusCircle, Filter, Save, X, Edit } from "lucide-react"
import { toast } from "sonner"
import { jsPDF } from "jspdf"

type User = {
  _id: string
  name: string
  email: string
  role: "client" | "supervisor" | "supplier" | "employee"
  salary?: number
  projectTotalAmount?: number // For clients
  supplierAmount?: number // For suppliers
  totalPaid: number
  dueAmount: number
  lastPaymentDate?: string
  status: "active" | "inactive"
  phone?: string
  address?: string
  [key: string]: any
}

const PayrollManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("supervisor")
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<User | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Helper function to fetch data with error handling
  const fetchWithErrorHandling = async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error)
      return []
    }
  }

  // Helper function to calculate due amount based on role
  const calculateDueAmount = (user: User): number => {
    switch (user.role) {
      case "employee":
      case "supervisor":
        return Math.max(0, (user.salary || 0) - (user.totalPaid || 0))

      case "client":
        return Math.max(0, (user.projectTotalAmount || 0) - (user.totalPaid || 0))

      case "supplier":
        return Math.max(0, (user.supplierAmount || 0) - (user.totalPaid || 0))

      default:
        return user.dueAmount || 0
    }
  }

  // Enhanced role-specific data transformation with better due amount calculation
  const transformUserData = (user: any, role: string): User => {
    console.log(`Transforming ${role} data:`, user)

    const baseUser = {
      _id: user._id || user.id || Math.random().toString(36).substr(2, 9),
      name:
        user.name || user.fullName || (user.firstName && user.lastName)
          ? `${user.firstName} ${user.lastName}`.trim()
          : user.companyName || "Unknown",
      email: user.email || user.emailAddress || `${role}-${Date.now()}@example.com`,
      role: role as User["role"],
      status: user.status || user.employeeStatus || "active",
      phone: user.phone || user.phoneNumber || user.mobile || "",
      address: user.address || user.location || "",
      lastPaymentDate:
        user.lastPaymentDate || user.lastPayment || user.lastSalaryDate || new Date().toISOString().split("T")[0],
      totalPaid: Number(user.totalPaid || user.paidAmount || user.totalSalaryPaid || user.amountPaid || 0),
      ...user,
    }

    // Enhanced role-specific calculations with proper due amount calculation
    let transformedUser: User

    switch (role) {
      case "employee":
        const employeeSalary =
          typeof user.salary === "string"
            ? Number.parseFloat(user.salary.replace(/[^0-9.]/g, ""))
            : Number(
                user.salary ||
                  user.monthlySalary ||
                  user.basicSalary ||
                  user.grossSalary ||
                  user.netSalary ||
                  user.amount ||
                  0,
              )

        transformedUser = {
          ...baseUser,
          salary: employeeSalary,
          dueAmount: 0, // Will be calculated below
        }
        break

      case "supervisor":
        const supervisorSalary =
          typeof user.salary === "string"
            ? Number.parseFloat(user.salary.replace(/[^0-9.]/g, ""))
            : Number(user.salary || user.monthlySalary || user.supervisorSalary || 0)

        transformedUser = {
          ...baseUser,
          salary: supervisorSalary,
          dueAmount: 0, // Will be calculated below
        }
        break

      case "client":
        const projectAmount = Number(
          user.projectTotalAmount || user.totalAmount || user.contractValue || user.projectValue || user.amount || 0,
        )

        transformedUser = {
          ...baseUser,
          projectTotalAmount: projectAmount,
          dueAmount: 0, // Will be calculated below
        }
        break

      case "supplier":
        const supplierAmount = Number(
          user.supplierAmount || user.totalAmount || user.contractValue || user.supplierValue || user.amount || 0,
        )

        transformedUser = {
          ...baseUser,
          supplierAmount,
          dueAmount: 0, // Will be calculated below
        }
        break

      default:
        transformedUser = {
          ...baseUser,
          dueAmount: Number(user.dueAmount || user.pendingAmount || 0),
        }
    }

    // Calculate due amount using the helper function
    transformedUser.dueAmount = calculateDueAmount(transformedUser)

    console.log(`Transformed ${role}:`, transformedUser)
    return transformedUser
  }

  // Enhanced fetch data with better employee handling
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        const endpoints = [
          { url: "/api/employees", role: "employee" },
          { url: "/api/clients", role: "client" },
          { url: "/api/suppliers", role: "supplier" },
          { url: "/api/supervisors", role: "supervisor" },
        ]

        const results = await Promise.all(
          endpoints.map(async ({ url, role }) => {
            try {
              console.log(`Fetching ${role} data from ${url}`)
              const data = await fetchWithErrorHandling(url)
              console.log(`${role} raw data:`, data)

              if (!Array.isArray(data)) {
                console.warn(`${role} data is not an array:`, data)
                return []
              }

              const transformedData = data.map((item) => transformUserData(item, role))
              console.log(`${role} transformed data:`, transformedData)

              return transformedData
            } catch (error) {
              console.error(`Error processing ${url}:`, error)
              toast.error(`Failed to load ${role} data`)
              return []
            }
          }),
        )

        const allUsers = results.flat()
        console.log("All users combined:", allUsers)

        // Check specifically for employees
        const employees = allUsers.filter((user) => user.role === "employee")
        console.log("Employees found:", employees.length, employees)

        if (allUsers.length === 0) {
          console.warn("No data received from APIs")
          toast.warning("No data found. Please check your API endpoints.")
        } else {
          setUsers(allUsers)
          toast.success(`Loaded ${allUsers.length} records (${employees.length} employees)`)
        }
      } catch (error) {
        console.error("Error in fetchAllData:", error)
        toast.error("Failed to load data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  // Update filtered users when search term or role filter changes
  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesRole = selectedRole === "all" || user.role === selectedRole
      const matchesSearch =
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesRole && matchesSearch
    })
    setFilteredUsers(filtered)
  }, [searchTerm, users, selectedRole])

  const handleEdit = (user: User) => {
    setEditingId(user._id)
    setEditForm({ ...user })
  }

  // Enhanced save logic with better employee support
  const handleSave = async () => {
    if (!editForm || !editForm.role || isSaving) return

    setIsSaving(true)
    const apiPath = `/api/${editForm.role.toLowerCase()}s`
    const userId = editForm._id

    const originalUser = users.find((u) => u._id === userId)
    const originalPaid = originalUser ? originalUser.totalPaid : 0
    const paymentAmount = editForm.totalPaid - originalPaid

    try {
      // Enhanced role-specific data preparation
      let apiData = { ...editForm }

      switch (editForm.role) {
        case "employee":
          // Try multiple field names that employee APIs might expect
          apiData = {
            ...editForm,
            salary: editForm.salary,
            monthlySalary: editForm.salary,
            basicSalary: editForm.salary,
            grossSalary: editForm.salary,
            totalPaid: editForm.totalPaid,
            paidAmount: editForm.totalPaid,
            totalSalaryPaid: editForm.totalPaid,
            amountPaid: editForm.totalPaid,
            dueAmount: editForm.dueAmount,
            pendingAmount: editForm.dueAmount,
            lastPaymentDate: editForm.lastPaymentDate,
            lastSalaryDate: editForm.lastPaymentDate,
          }
          console.log("Employee API data:", apiData)
          break

        case "supervisor":
          apiData = {
            ...editForm,
            salary: editForm.salary,
            monthlySalary: editForm.salary,
            supervisorSalary: editForm.salary,
          }
          break

        case "client":
          apiData = {
            ...editForm,
            projectTotalAmount: editForm.projectTotalAmount,
            totalAmount: editForm.projectTotalAmount,
            contractValue: editForm.projectTotalAmount,
          }
          break

        case "supplier":
          apiData = {
            ...editForm,
            supplierAmount: editForm.supplierAmount,
            totalAmount: editForm.supplierAmount,
            contractValue: editForm.supplierAmount,
          }
          break
      }

      console.log(`Saving ${editForm.role} to ${apiPath}/${userId}:`, apiData)

      const response = await fetch(`${apiPath}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API Error for ${editForm.role}:`, response.status, errorText)
        throw new Error(`Failed to save ${editForm.role}: ${response.status} - ${errorText}`)
      }

      const updatedUser = await response.json()
      console.log(`Updated ${editForm.role} response:`, updatedUser)

      // Transform the updated user data
      const transformedUser = transformUserData(updatedUser, editForm.role)

      // Ensure due amount is properly calculated
      transformedUser.dueAmount = calculateDueAmount(transformedUser)

      // Update local state
      setUsers((prev) => prev.map((u) => (u._id === transformedUser._id ? transformedUser : u)))

      // Log the payment transaction only if a payment was made
      if (paymentAmount > 0) {
        try {
          const payrollData = {
            user: userId,
            userRole: editForm.role,
            amount: paymentAmount,
            paymentDate: new Date(),
            status: "paid",
            notes: `Payment of ₹${paymentAmount} recorded for ${editForm.role} ${editForm.name}.`,
          }

          console.log("Logging payroll transaction:", payrollData)

          await fetch("/api/payroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payrollData),
          })
        } catch (payrollError) {
          console.warn("Failed to log payroll transaction:", payrollError)
          // Don't fail the main operation if payroll logging fails
        }
      }

      setEditForm(null)
      setEditingId(null)
      toast.success(
        `${editForm.role.charAt(0).toUpperCase() + editForm.role.slice(1)} ${editForm.name} updated successfully!`,
      )
    } catch (error) {
      console.error(`Save error for ${editForm.role}:`, error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(`Failed to save ${editForm.role}. Error: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Enhanced input change handling with proper due amount calculation
  const handleInputChange = (field: string, value: string | number) => {
    setEditForm((prev) => {
      if (!prev) return prev

      const newForm = { ...prev, [field]: value }

      // Convert values to numbers for calculation
      const numericValue = Number(value) || 0

      // Role-specific due amount calculation that updates immediately
      switch (prev.role) {
        case "employee":
        case "supervisor":
          const currentSalary = field === "salary" ? numericValue : Number(newForm.salary) || 0
          const currentPaid = field === "totalPaid" ? numericValue : Number(newForm.totalPaid) || 0
          newForm.salary = currentSalary
          newForm.totalPaid = currentPaid
          newForm.dueAmount = Math.max(0, currentSalary - currentPaid)
          console.log(
            `${prev.role} calculation: salary=${currentSalary}, paid=${currentPaid}, due=${newForm.dueAmount}`,
          )
          break

        case "client":
          const currentProjectAmount =
            field === "projectTotalAmount" ? numericValue : Number(newForm.projectTotalAmount) || 0
          const currentClientPaid = field === "totalPaid" ? numericValue : Number(newForm.totalPaid) || 0
          newForm.projectTotalAmount = currentProjectAmount
          newForm.totalPaid = currentClientPaid
          newForm.dueAmount = Math.max(0, currentProjectAmount - currentClientPaid)
          console.log(
            `Client calculation: project=${currentProjectAmount}, paid=${currentClientPaid}, due=${newForm.dueAmount}`,
          )
          break

        case "supplier":
          const currentSupplierAmount = field === "supplierAmount" ? numericValue : Number(newForm.supplierAmount) || 0
          const currentSupplierPaid = field === "totalPaid" ? numericValue : Number(newForm.totalPaid) || 0
          newForm.supplierAmount = currentSupplierAmount
          newForm.totalPaid = currentSupplierPaid
          newForm.dueAmount = Math.max(0, currentSupplierAmount - currentSupplierPaid)
          console.log(
            `Supplier calculation: amount=${currentSupplierAmount}, paid=${currentSupplierPaid}, due=${newForm.dueAmount}`,
          )
          break

        default:
          // For any other roles, just update the field
          newForm[field] = numericValue
          break
      }

      // Update last payment date if payment was increased
      if (field === "totalPaid" && numericValue > (prev.totalPaid || 0)) {
        newForm.lastPaymentDate = new Date().toISOString()
        console.log("Updated last payment date:", newForm.lastPaymentDate)
      }

      console.log("Updated form:", newForm)
      return newForm
    })
  }

  const handleExportToPDF = () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const currentDate = new Date().toLocaleDateString()

      doc.setFontSize(18)
      doc.text("Payroll Management Report", 14, 22)
      doc.setFontSize(10)
      doc.text(`Generated on: ${currentDate}`, 14, 30)

      const roles = ["employee", "supervisor", "client", "supplier"]
      let startY = 40

      roles.forEach((role) => {
        const roleUsers = users.filter((user) => user.role === role)
        if (roleUsers.length === 0) return

        doc.setFontSize(14)
        doc.text(`${role.charAt(0).toUpperCase() + role.slice(1)}s`, 14, startY)
        startY += 10

        const headers = ["Name", "Email", "Phone", "Amount", "Total Paid", "Due", "Last Payment", "Status"]
        const columnWidths = [25, 40, 25, 20, 20, 20, 25, 15]

        let x = 5
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        headers.forEach((header, i) => {
          doc.text(header, x, startY)
          x += columnWidths[i]
        })

        startY += 4
        doc.line(5, startY, 5 + columnWidths.reduce((a, b) => a + b, 0), startY)
        startY += 4

        doc.setFont("helvetica", "normal")
        roleUsers.forEach((user) => {
          if (startY > 280) {
            doc.addPage()
            startY = 20
          }

          // Get the appropriate amount based on role
          let amount = "N/A"
          switch (user.role) {
            case "employee":
            case "supervisor":
              amount = user.salary ? `₹${user.salary.toFixed(2)}` : "N/A"
              break
            case "client":
              amount = user.projectTotalAmount ? `₹${user.projectTotalAmount.toFixed(2)}` : "N/A"
              break
            case "supplier":
              amount = user.supplierAmount ? `₹${user.supplierAmount.toFixed(2)}` : "N/A"
              break
          }

          const row = [
            user.name || "N/A",
            user.email || "N/A",
            user.phone || "N/A",
            amount,
            `₹${user.totalPaid?.toFixed(2) || "0.00"}`,
            `₹${user.dueAmount?.toFixed(2) || "0.00"}`,
            user.lastPaymentDate ? new Date(user.lastPaymentDate).toLocaleDateString() : "N/A",
            user.status || "N/A",
          ]

          x = 5
          row.forEach((cell, i) => {
            const splitText = doc.splitTextToSize(cell, columnWidths[i] - 2)
            doc.text(splitText, x + 1, startY + 5)
            x += columnWidths[i]
          })

          startY += 10
          if (startY < 280) {
            doc.line(5, startY, 5 + columnWidths.reduce((a, b) => a + b, 0), startY)
            startY += 2
          }
        })

        startY += 15
      })

      doc.save(`payroll-report-${new Date().toISOString().split("T")[0]}.pdf`)
      toast.success("PDF exported successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm(null)
  }

  // Get users by role for stats with role-specific calculations
  const getStatsForRole = (role: string) => {
    const roleUsers = users.filter((user) => user.role === role)
    let totalAmount = 0
    let totalDue = 0

    roleUsers.forEach((user) => {
      switch (role) {
        case "employee":
        case "supervisor":
          totalAmount += user.salary || 0
          break
        case "client":
          totalAmount += user.projectTotalAmount || 0
          break
        case "supplier":
          totalAmount += user.supplierAmount || 0
          break
      }
      totalDue += user.dueAmount || 0
    })

    return { totalAmount, totalDue, count: roleUsers.length }
  }

  const stats = [
    {
      title: "Supervisors",
      role: "supervisor",
      ...getStatsForRole("supervisor"),
      description: "Supervisor salaries",
      color: "bg-purple-100 text-purple-800",
    },
    {
      title: "Employees",
      role: "employee",
      ...getStatsForRole("employee"),
      ...getStatsForRole("employee"),
      description: "Employee salaries",
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Clients",
      role: "client",
      ...getStatsForRole("client"),
      description: "Project values",
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Suppliers",
      role: "supplier",
      ...getStatsForRole("supplier"),
      description: "Supplier payments",
      color: "bg-amber-100 text-amber-800",
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get the appropriate amount field based on role
  const getAmountForRole = (user: User) => {
    switch (user.role) {
      case "employee":
      case "supervisor":
        return user.salary || 0
      case "client":
        return user.projectTotalAmount || 0
      case "supplier":
        return user.supplierAmount || 0
      default:
        return 0
    }
  }

  // Get the appropriate amount field name for display
  const getAmountFieldName = (role: string) => {
    switch (role) {
      case "client":
        return "Project Amount"
      case "supplier":
        return "Supplier Amount"
      default:
        return "Salary"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll Management</h2>
          <p className="text-muted-foreground">Manage payments, salaries, and financial transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 bg-transparent"
            onClick={handleExportToPDF}
            disabled={isExporting}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              {isExporting ? "Exporting..." : "Export"}
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Payment</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`shadow-sm cursor-pointer transition-all hover:scale-105 ${
              selectedRole === stat.role ? `${stat.color}` : ""
            }`}
            onClick={() => setSelectedRole(stat.role)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="h-8 w-8 rounded-full flex items-center justify-center">{stat.count}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stat.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {stat.totalDue > 0 ? `${formatCurrency(stat.totalDue)} due` : "All caught up"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Table */}
      <Card>
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="rounded-b-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">{getAmountFieldName(selectedRole)}</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      <div className="font-medium">{user.name}</div>
                      {user.phone && <div className="text-xs text-muted-foreground">{user.phone}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-right">
                      {editingId === user._id && editForm ? (
                        <Input
                          type="number"
                          value={
                            user.role === "client"
                              ? editForm.projectTotalAmount || ""
                              : user.role === "supplier"
                                ? editForm.supplierAmount || ""
                                : editForm.salary || ""
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const field =
                              user.role === "client"
                                ? "projectTotalAmount"
                                : user.role === "supplier"
                                  ? "supplierAmount"
                                  : "salary"
                            handleInputChange(field, Number(e.target.value))
                          }}
                          className="w-24"
                        />
                      ) : (
                        formatCurrency(getAmountForRole(user))
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === user._id && editForm ? (
                        <Input
                          type="number"
                          value={editForm.totalPaid || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("totalPaid", Number(e.target.value))
                          }
                          className="w-24"
                        />
                      ) : (
                        formatCurrency(user.totalPaid)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === user._id && editForm ? (
                        <span className="text-muted-foreground">{formatCurrency(editForm.dueAmount || 0)}</span>
                      ) : user.dueAmount > 0 ? (
                        <span className="text-red-600">{formatCurrency(user.dueAmount)}</span>
                      ) : (
                        <span className="text-green-600">Paid</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === user._id && editForm ? (
                        <span className="text-xs text-muted-foreground">
                          {new Date(editForm.lastPaymentDate || Date.now()).toLocaleDateString()}
                        </span>
                      ) : user.lastPaymentDate ? (
                        new Date(user.lastPaymentDate).toLocaleDateString()
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      {editingId === user._id ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No users found for "{selectedRole}".
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

export default PayrollManagement
