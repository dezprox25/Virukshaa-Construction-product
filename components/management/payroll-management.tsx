"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Download, PlusCircle, Filter, Save, X, Edit } from "lucide-react";
import { toast } from "sonner";

type User = {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'supervisor' | 'supplier' | 'employee';
  salary?: number;
  totalPaid: number;
  dueAmount: number;
  lastPaymentDate?: string;
  status: 'active' | 'inactive';
  phone?: string;
  address?: string;
  [key: string]: any; // For dynamic property access
};

const PayrollManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('employee'); // Default to 'employee'
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  // Helper function to fetch data with error handling
  const fetchWithErrorHandling = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      return []; // Return empty array on error
    }
  };

  // Fetch data from all endpoints
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const endpoints = [
          { url: '/api/employees', role: 'employee' },
          { url: '/api/clients', role: 'client' },
          { url: '/api/suppliers', role: 'supplier' },
          { url: '/api/supervisors', role: 'supervisor' }
        ];

        // Fetch data from all endpoints
        const results = await Promise.all(
          endpoints.map(async ({ url, role }) => {
            try {
              const data = await fetchWithErrorHandling(url);
              return Array.isArray(data) ? data.map(item => ({ ...item, role })) : [];
            } catch (error) {
              console.error(`Error processing ${url}:`, error);
              return [];
            }
          })
        );

        // Transform data to a common format
        const allUsers = results.flat().map((user: any) => ({
          _id: user._id || user.id || Math.random().toString(36).substr(2, 9),
          name: user.name || user.companyName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
          email: user.email || `${user.role}-${Date.now()}@example.com`,
          role: user.role || 'employee',
          salary: typeof user.salary === 'string' 
            ? parseFloat(user.salary.replace(/[^0-9.]/g, '')) 
            : Number(user.salary || user.monthlySalary || 0),
          totalPaid: Number(user.totalPaid || user.paidAmount || 0),
          dueAmount: Number(user.dueAmount || user.pendingAmount || 0),
          lastPaymentDate: user.lastPaymentDate || user.lastPayment || new Date().toISOString().split('T')[0],
          status: user.status || 'active',
          phone: user.phone || user.phoneNumber || '',
          address: user.address || '',
          ...user
        }));

        // If no data was fetched, use mock data as fallback
        if (allUsers.length === 0) {
          console.warn('No data received from APIs, using mock data');
        } else {
          setUsers(allUsers);
        }
      } catch (error) {
        console.error('Error in fetchAllData:', error);
        toast.error('Failed to load data. Some features may be limited.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Update filtered users when search term or role filter changes
  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesSearch = searchTerm === '' ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users, selectedRole]);

  const handleEdit = (user: User) => {
    setEditingId(user._id);
    const baseAmount = user.role === 'client' ? user.projectTotalAmount : user.salary;
    setEditForm({
      salary: baseAmount,
      totalPaid: user.totalPaid,
      dueAmount: user.dueAmount,
      lastPaymentDate: user.lastPaymentDate,
    });
  };

  const handleSave = async (id: string) => {
    try {
      const user = users.find(u => u._id === id);
      if (!user) return;

      // Start with the editable form data
      const payload: { [key: string]: any } = { ...editForm };

      // Map UI fields back to the original database fields based on what might exist on the original user object
      if (user.hasOwnProperty('paidAmount')) {
        payload.paidAmount = payload.totalPaid;
        delete payload.totalPaid;
      }
      if (user.hasOwnProperty('pendingAmount')) {
        payload.pendingAmount = payload.dueAmount;
        delete payload.dueAmount;
      }
      if (user.hasOwnProperty('monthlySalary')) {
        payload.monthlySalary = payload.salary;
        delete payload.salary;
      }

      // Handle client-specific amount field
      if (user.role === 'client') {
        payload.projectTotalAmount = payload.salary; 
        delete payload.salary; 
      }

      // Ensure numeric values are numbers before sending
      Object.keys(payload).forEach(key => {
        if (['projectTotalAmount', 'salary', 'totalPaid', 'dueAmount', 'paidAmount', 'pendingAmount', 'monthlySalary'].includes(key)) {
          payload[key] = Number(payload[key]);
        }
      });

      const response = await fetch(`/api/${user.role}s/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error('API Error:', errorData);
        throw new Error(`Failed to update. Server responded with: ${errorData.message || response.statusText}`);
      }

      // --- Log the payment transaction ---
      const originalTotalPaid = user.totalPaid || 0;
      const newTotalPaid = Number(editForm.totalPaid) || 0;
      const paymentAmount = newTotalPaid - originalTotalPaid;

      if (paymentAmount > 0) {
        try {
          const payrollPayload = {
            user: user._id,
            // Capitalize first letter to match the backend model enum
            userRole: user.role.charAt(0).toUpperCase() + user.role.slice(1),
            amount: paymentAmount,
            paymentDate: new Date().toISOString(),
            status: 'paid',
            notes: `Payment of ${paymentAmount} recorded.`
          };

          const payrollResponse = await fetch('/api/payroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payrollPayload),
          });

          if (!payrollResponse.ok) {
            toast.error('User updated, but failed to log payroll transaction.');
          } else {
            toast.success('Payroll transaction logged successfully.');
          }
        } catch (payrollError) {
          console.error('Error logging payroll transaction:', payrollError);
          toast.error('User updated, but there was an error logging the transaction.');
        }
      }

      // Update local state
      const updatedUsers = users.map(u => {
        if (u._id === id) {
          // Merge the original user data with the changes from the edit form to update the UI instantly
          const updatedData = { ...u, ...editForm };

          // If it was a client, also update the projectTotalAmount from the form's salary field
          if (u.role === 'client') {
            updatedData.projectTotalAmount = editForm.salary;
          }
          return updatedData;
        }
        return u;
      });
      
      setUsers(updatedUsers);
      setEditingId(null);
      toast.success('Payment details updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment details');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditForm(prev => {
      const newForm = { ...prev, [field]: value };

      // Automatically calculate due amount when totalPaid changes
      if (field === 'totalPaid') {
        const salary = Number(newForm.salary) || 0;
        const totalPaid = Number(value) || 0;
        newForm.dueAmount = salary - totalPaid;
      }
      
      return newForm;
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };



  // Get users by role for stats
  const clients = users.filter(user => user.role === 'client');
  const employees = users.filter(user => user.role === 'employee');
  const supervisors = users.filter(user => user.role === 'supervisor');
  const suppliers = users.filter(user => user.role === 'supplier');

  const stats = [
    {
      title: 'Employees',
      role: 'employee',
      amount: employees.reduce((sum, user) => sum + (user.salary || 0), 0),
      due: employees.reduce((sum, user) => sum + (user.dueAmount || 0), 0),
      count: employees.length,
      description: 'Total salary to be paid',
      color: 'bg-green-100 text-green-800',
      border: 'border-l-4 border-green-500'
    },
    {
      title: 'Clients',
      role: 'client',
      amount: clients.reduce((sum, user) => sum + (user.projectTotalAmount || 0), 0),
      due: clients.reduce((sum, user) => sum + (user.dueAmount || 0), 0),
      count: clients.length,
      description: 'Total project value',
      color: 'bg-blue-100 text-blue-800',
      border: 'border-l-4 border-blue-500'
    },
 
    {
      title: 'Supervisors',
      role: 'supervisor',
      amount: supervisors.reduce((sum, user) => sum + (user.salary || 0), 0),
      due: supervisors.reduce((sum, user) => sum + (user.dueAmount || 0), 0),
      count: supervisors.length,
      description: 'Supervisor payments',
      color: 'bg-purple-100 text-purple-800',
      border: 'border-l-4 border-purple-500'
    },
    {
      title: 'Suppliers',
      role: 'supplier',
      amount: suppliers.reduce((sum, user) => sum + (user.totalPaid || 0), 0),
      due: suppliers.reduce((sum, user) => sum + (user.dueAmount || 0), 0),
      count: suppliers.length,
      description: 'Supplier payments',
      color: 'bg-amber-100 text-amber-800',
      border: 'border-l-4 border-amber-500'
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll Management</h2>
          <p className="text-muted-foreground">
            Manage payments, salaries, and financial transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Payment
            </span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`${stat.border} shadow-sm cursor-pointer transition-all hover:scale-105 ${selectedRole === stat.role ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedRole(stat.role)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stat.color}`}>
                {stat.count}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stat.amount)}</div>
              <p className="text-xs text-muted-foreground">
                {stat.due > 0 ? `${formatCurrency(stat.due)} due` : 'All caught up'}
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
              <Button variant="outline" size="sm" className="h-8 gap-1">
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
                <TableHead className="text-right">
                  {selectedRole === 'client' ? 'Project Amount' : 'Salary'}
                </TableHead>
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
                      {editingId === user._id ? (
                        <Input
                          type="number"
                          value={editForm.salary || ''}
                          onChange={(e) => handleInputChange('salary', Number(e.target.value))}
                          className="w-24"
                        />
                      ) : (
                        user.role === 'client' 
                          ? formatCurrency(user.projectTotalAmount || 0) 
                          : (user.role === 'employee' || user.role === 'supervisor') && user.salary 
                            ? formatCurrency(user.salary) 
                            : '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === user._id ? (
                        <Input
                          type="number"
                          value={editForm.totalPaid || ''}
                          onChange={(e) => handleInputChange('totalPaid', Number(e.target.value))}
                          className="w-24"
                        />
                      ) : (
                        formatCurrency(user.totalPaid)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === user._id ? (
                        <Input
                          type="number"
                          value={editForm.dueAmount || ''}
                          onChange={(e) => handleInputChange('dueAmount', Number(e.target.value))}
                          className="w-24"
                        />
                      ) : user.dueAmount > 0 ? (
                        <span className="text-red-600">{formatCurrency(user.dueAmount)}</span>
                      ) : (
                        <span className="text-green-600">Paid</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === user._id ? (
                        <Input
                          type="date"
                          value={editForm.lastPaymentDate?.toString().split('T')[0] || ''}
                          onChange={(e) => handleInputChange('lastPaymentDate', e.target.value)}
                          className="w-32"
                        />
                      ) : (
                        user.lastPaymentDate || 'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-1">
                      {editingId === user._id ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleSave(user._id)}
                          >
                            <Save className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 p-0"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default PayrollManagement;