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
          { url: '/api/suppliers', role: 'supplier' }
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
          // const mockUsers = [
          //   {
          //     _id: '1',
          //     name: 'John Doe',
          //     email: 'john@example.com',
          //     role: 'employee',
          //     salary: 25000,
          //     totalPaid: 20000,
          //     dueAmount: 5000,
          //     lastPaymentDate: '2023-10-01',
          //     status: 'active',
          //     phone: '+1234567890'
          //   },
          //   {
          //     _id: '2',
          //     name: 'Acme Supplies',
          //     email: 'acme@example.com',
          //     role: 'supplier',
          //     totalPaid: 150000,
          //     dueAmount: 25000,
          //     lastPaymentDate: '2023-09-28',
          //     status: 'active',
          //     phone: '+1987654321'
          //   },
          //   {
          //     _id: '3',
          //     name: 'Client Corp',
          //     email: 'client@example.com',
          //     role: 'client',
          //     totalPaid: 500000,
          //     dueAmount: 200000,
          //     lastPaymentDate: '2023-10-10',
          //     status: 'active',
          //     phone: '+1122334455'
          //   }
          // ];
          // setUsers(mockUsers);
          // setFilteredUsers(mockUsers);
        } else {
          setUsers(allUsers);
          setFilteredUsers(allUsers);
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

  // Update filtered users when search term changes
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleEdit = (user: User) => {
    setEditingId(user._id);
    setEditForm({
      salary: user.salary,
      totalPaid: user.totalPaid,
      dueAmount: user.dueAmount,
      lastPaymentDate: user.lastPaymentDate
    });
  };

  const handleSave = async (id: string) => {
    try {
      const user = users.find(u => u._id === id);
      if (!user) return;

      const response = await fetch(`/api/${user.role}s/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update');

      // Update local state
      const updatedUsers = users.map(u => 
        u._id === id ? { ...u, ...editForm } : u
      );
      
      setUsers(updatedUsers);
      setEditingId(null);
      toast.success('Payment details updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment details');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
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
      title: 'Clients', 
      amount: clients.reduce((sum, user) => sum + (user.totalPaid || 0), 0),
      due: clients.reduce((sum, user) => sum + (user.dueAmount || 0), 0),
      count: clients.length,
      description: 'Total received from clients',
      color: 'bg-blue-100 text-blue-800',
      border: 'border-l-4 border-blue-500'
    },
    { 
      title: 'Employees', 
      amount: employees.reduce((sum, user) => sum + (user.salary || 0), 0),
      due: employees.reduce((sum, user) => sum + (user.dueAmount || 0), 0),
      count: employees.length,
      description: 'Total salary to be paid',
      color: 'bg-green-100 text-green-800',
      border: 'border-l-4 border-green-500'
    },
    { 
      title: 'Supervisors', 
      amount: supervisors.reduce((sum, user) => sum + (user.salary || 0), 0),
      due: supervisors.reduce((sum, user) => sum + (user.dueAmount || 0), 0),
      count: supervisors.length,
      description: 'Supervisor payments',
      color: 'bg-purple-100 text-purple-800',
      border: 'border-l-4 border-purple-500'
    },
    { 
      title: 'Suppliers', 
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
          <Card key={index} className={`${stat.border} shadow-sm`}>
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
                <TableHead className="text-right">Salary</TableHead>
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
                        (user.role === 'employee' || user.role === 'supervisor') && user.salary ? formatCurrency(user.salary) : '-'
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