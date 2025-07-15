"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ClientsManagement from "@/components/management/clients-management"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Users, FolderOpen, Truck, UserCheck, DollarSign, FileText, AlertCircle, Info, Eye, Mail } from "lucide-react"
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"
import MaterialsManagement from "@/components/management/materials-management"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import SupervisorsManagement from "@/components/management/supervisors-management"
import SuppliersManagement from "@/components/management/suppliers-management"
import EmployeesManagement from "@/components/management/employees-management"
import AllWorkersOverview from "@/components/management/all-workers-overview"
import UserManagement from "@/components/management/user-management"
import ProjectsManagement from "@/components/management/projects-management"
import Reportmanagement from '@/components/management/report-management'
import PayrollManagement from "@/components/management/payroll-management"
import AdminSetting from "@/components/management/admin-setting"
import { Skeleton } from "@/components/ui/skeleton"

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Client {
  _id: string;
  name: string;
  contactPerson?: string;
}

interface Payroll {
  amount: string | number;
}

interface DashboardData {
  totalClients: number;
  totalSupervisors: number;
  totalEmployees: number;
  totalMaterials: number;
  totalPayroll: number;
  totalReports: number;
  recentProjects: Array<{
    id?: string;
    name: string;
    status: string;
    manager: string;
    progress: number;
  }>;
  clientStatusData?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }>;
  };
  clientsData: Array<{
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    status: string;
    projects: Array<{
      id: string;
      name: string;
      status: string;
    }>;
  }>;
  employeesData: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
    email: string;
    phone: string;
    status: string;
    joinDate: string;
  }>;
  supervisorsData: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
    email: string;
    phone: string;
    status: string;
    joinDate: string;
    experience: string;
    projects: Array<any>;
  }>;
  materialsData: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    price: number;
    supplier: string;
    status: string;
    lastUpdated: string;
  }>;
}

interface ApiData {
  clients: ApiResponse<Client[]>;
  supervisors: ApiResponse<any[]>;
  employees: ApiResponse<any[]>;
  materials: ApiResponse<any[]>;
  reports: ApiResponse<any[]>;
  payroll: ApiResponse<Payroll[]>;
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalClients: 0,
    totalSupervisors: 0,
    totalEmployees: 0,
    totalMaterials: 0,
    totalPayroll: 0,
    totalReports: 0,
    recentProjects: [],
    clientsData: [],
    employeesData: [],
    supervisorsData: [],
    materialsData: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Base URL for API requests
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
      
      // Fetch all data in parallel
      const endpoints = [
        { name: 'clients', url: `${baseUrl}/api/clients` },
        { name: 'supervisors', url: `${baseUrl}/api/supervisors` },
        { name: 'employees', url: `${baseUrl}/api/employees` },
        { name: 'materials', url: `${baseUrl}/api/materials` },
        { name: 'payroll', url: `${baseUrl}/api/payroll` }
      ];

      console.log('Fetching data from endpoints:', endpoints.map(e => e.url));
      
      // Enhanced fetch with better error handling and logging
      const fetchPromises = endpoints.map(async ({ name, url }) => {
        try {
          console.log(`[${name}] Starting fetch from:`, url);
          const response = await fetch(url);
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[${name}] Error response:`, {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            });
            return { 
              name, 
              data: { 
                success: false, 
                data: [], 
                error: `HTTP ${response.status}: ${response.statusText}` 
              }, 
              error: `HTTP ${response.status}` 
            };
          }
          const responseData = await response.json();
          console.log(`[${name}] Success response:`, responseData);
          return { 
            name, 
            data: responseData, 
            error: null 
          };
        } catch (err: unknown) {
          const error = err as Error;
          console.error(`[${name}] Fetch error:`, {
            message: error.message,
            stack: error.stack
          });
          return { 
            name, 
            data: { 
              success: false, 
              data: [], 
              error: error.message 
            }, 
            error: error.message 
          };
        }
      });

      const results = await Promise.all(fetchPromises);
      
      // Log raw API results for debugging
      console.log('=== RAW API RESULTS ===');
      results.forEach((result, index) => {
        console.log(`Result ${index + 1} (${result.name}):`, {
          success: result.data?.success,
          dataLength: Array.isArray(result.data?.data) ? result.data.data.length : 'Not an array',
          error: result.error,
          sampleData: Array.isArray(result.data?.data) && result.data.data.length > 0 
            ? result.data.data[0] 
            : 'No data'
        });
      });
      
      // Convert array of results to object for easier access with proper data handling
      const data = results.reduce<Partial<ApiData>>((acc, { name, data: responseData }) => {
        // Log the raw response data for debugging
        console.log(`[${name}] Raw response:`, responseData);
        
        // Handle different response formats
        let processedData = [];
        
        // Case 1: Response is already an array
        if (Array.isArray(responseData)) {
          processedData = responseData;
        } 
        // Case 2: Response has a data property that's an array
        else if (responseData && typeof responseData === 'object' && 'data' in responseData) {
          processedData = Array.isArray(responseData.data) ? responseData.data : [];
        }
        // Case 3: Response is a single object
        else if (responseData && typeof responseData === 'object') {
          processedData = [responseData];
        }
        
        console.log(`[${name}] Processed data:`, {
          count: processedData.length,
          sampleItem: processedData[0] || 'No items'
        });
        
        return {
          ...acc,
          [name]: {
            success: true,
            data: processedData
          }
        };
      }, {} as ApiData);

      // Log the processed data structure
      console.log('=== PROCESSED DATA ===', JSON.stringify({
        clients: {
          count: data.clients?.data?.length || 0,
          sample: data.clients?.data?.[0] || 'No clients'
        },
        supervisors: {
          count: data.supervisors?.data?.length || 0,
          sample: data.supervisors?.data?.[0] || 'No supervisors'
        },
        employees: {
          success: data.employees?.success,
          count: Array.isArray(data.employees?.data) ? data.employees.data.length : 'Not an array'
        },
        materials: {
          success: data.materials?.success,
          count: Array.isArray(data.materials?.data) ? data.materials.data.length : 'Not an array'
        },
        payroll: {
          success: data.payroll?.success,
          count: Array.isArray(data.payroll?.data) ? data.payroll.data.length : 'Not an array'
        }
      }, null, 2));

      // Process data for the dashboard
      const dashboardUpdate: DashboardData = {
        totalClients: Array.isArray(data.clients?.data) ? data.clients.data.length : 0,
        totalSupervisors: Array.isArray(data.supervisors?.data) ? data.supervisors.data.length : 0,
        totalEmployees: Array.isArray(data.employees?.data) ? data.employees.data.length : 0,
        totalMaterials: Array.isArray(data.materials?.data) ? data.materials.data.length : 0,
        totalPayroll: Array.isArray(data.payroll?.data) 
          ? data.payroll.data.reduce((sum: number, item: any) => {
              const amount = typeof item.amount === 'string' 
                ? parseFloat(item.amount) 
                : typeof item.amount === 'number' 
                  ? item.amount 
                  : 0;
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0)
          : 0,
        totalReports: 0,
        recentProjects: Array.isArray(data.clients?.data) 
          ? data.clients.data.slice(0, 5).map((client: any) => ({
              name: client.name || 'Unnamed Client',
              status: 'Active',
              manager: client.contactPerson || 'No Contact',
              progress: 100
            }))
          : [],
        clientStatusData: {
          labels: Array.isArray(data.clients?.data) && data.clients.data.length > 0
            ? data.clients.data.slice(0, 5).map((c: any) => c.name || 'Unnamed Client')
            : ['No clients'],
          datasets: [
            {
              label: 'Client Activity',
              data: Array.isArray(data.clients?.data) && data.clients.data.length > 0
                ? data.clients.data.slice(0, 5).map(() => Math.floor(Math.random() * 100))
                : [0],
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
            },
          ],
        },
        clientsData: Array.isArray(data.clients?.data) 
          ? data.clients.data.map((client: any) => ({
              id: client._id || client.id || Math.random().toString(),
              name: client.name || 'Unnamed Client',
              company: client.company || client.name || 'Unknown Company',
              email: client.email || 'No email',
              phone: client.phone || 'No phone',
              status: client.status || 'Active',
              projects: client.projects || []
            }))
          : [],
        employeesData: Array.isArray(data.employees?.data) 
          ? data.employees.data.map((employee: any) => ({
              id: employee._id || employee.id || Math.random().toString(),
              name: employee.name || 'Unnamed Employee',
              position: employee.position || 'Unknown Position',
              department: employee.department || 'Unknown Department',
              email: employee.email || 'No email',
              phone: employee.phone || 'No phone',
              status: employee.status || 'Active',
              joinDate: employee.joinDate || new Date().toISOString()
            }))
          : [],
        supervisorsData: Array.isArray(data.supervisors?.data) 
          ? data.supervisors.data.map((supervisor: any) => ({
              id: supervisor._id || supervisor.id || Math.random().toString(),
              name: supervisor.name || 'Unnamed Supervisor',
              position: supervisor.position || 'Supervisor',
              department: supervisor.department || 'Unknown Department',
              email: supervisor.email || 'No email',
              phone: supervisor.phone || 'No phone',
              status: supervisor.status || 'Active',
              joinDate: supervisor.joinDate || new Date().toISOString(),
              experience: supervisor.experience || 'Not specified',
              projects: supervisor.projects || []
            }))
          : [],
        materialsData: Array.isArray(data.materials?.data) 
          ? data.materials.data.map((material: any) => ({
              id: material._id || material.id || Math.random().toString(),
              name: material.name || 'Unnamed Material',
              category: material.category || 'Unknown Category',
              quantity: material.quantity || 0,
              unit: material.unit || 'pcs',
              price: material.price || 0,
              supplier: material.supplier || 'Unknown Supplier',
              status: material.status || 'Available',
              lastUpdated: material.lastUpdated || new Date().toISOString()
            }))
          : []
      };

      console.log('=== FINAL DASHBOARD DATA ===', JSON.stringify(dashboardUpdate, null, 2));
      setDashboardData(dashboardUpdate);
    } catch (err: any) {
      console.error('Error in fetchDashboardData:', err);
      const errorMessage = err.message || 'Failed to load dashboard data. Please try again later.';
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    {
      id: 'clients',
      title: "Total Clients",
      value: dashboardData?.totalClients.toString() || "0",
      change: "",
      icon: Users,
      color: "text-blue-600",
    },
    {
      id: 'supervisors',
      title: "Supervisors",
      value: dashboardData?.totalSupervisors.toString() || "0",
      change: "",
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      id: 'employees',
      title: "Employees",
      value: dashboardData?.totalEmployees.toString() || "0",
      change: "",
      icon: Users,
      color: "text-purple-600",
    },
    {
      id: 'materials',
      title: "Materials",
      value: dashboardData?.totalMaterials.toString() || "0",
      change: "",
      icon: Truck,
      color: "text-orange-600",
    },
    {
      id: 'payroll',
      title: "Total Payroll",
      value: dashboardData ? `$${dashboardData.totalPayroll.toLocaleString()}` : "$0",
      change: "",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      id: 'reports',
      title: "Reports",
      value: dashboardData?.totalReports.toString() || "0",
      change: "",
      icon: FileText,
      color: "text-red-600",
    }
  ];

  const renderLoadingState = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-[120px]">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDetailsTable = () => {
    if (selectedStat === 'supervisors' && dashboardData?.supervisorsData && dashboardData.supervisorsData.length > 0) {
      return (
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.supervisorsData.map((supervisor) => (
                <TableRow key={supervisor.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {supervisor.name?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {supervisor.name}
                    </div>
                  </TableCell>
                  <TableCell>{supervisor.position || '-'}</TableCell>
                  <TableCell>{supervisor.department || '-'}</TableCell>
                  <TableCell>{supervisor.experience || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={supervisor.status === 'Active' ? 'default' : 'secondary'}>
                      {supervisor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{supervisor.phone || supervisor.email || '-'}</TableCell>
                  <TableCell>{supervisor.projects?.length || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (selectedStat === 'materials' && dashboardData?.materialsData && dashboardData.materialsData.length > 0) {
      return (
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.materialsData.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.category || '-'}</TableCell>
                  <TableCell>{material.quantity}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell>${material.price.toFixed(2)}</TableCell>
                  <TableCell>{material.supplier || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={material.status === 'Available' ? 'default' : 
                                  material.status === 'Low Stock' ? 'destructive' : 'secondary'}>
                      {material.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(material.lastUpdated).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (selectedStat === 'employees' && dashboardData?.employeesData && dashboardData.employeesData.length > 0) {
      return (
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.employeesData.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {employee.name?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {employee.name}
                    </div>
                  </TableCell>
                  <TableCell>{employee.position || '-'}</TableCell>
                  <TableCell>{employee.department || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.phone || '-'}</TableCell>
                  <TableCell>{new Date(employee.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (selectedStat === 'clients' && dashboardData?.clientsData && dashboardData.clientsData.length > 0) {
      return (
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.clientsData.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.company}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.projects?.length || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (selectedStat) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Info className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium">No detailed view available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed view for {selectedStat} is not implemented yet.
            </p>
          </div>
        </div>
      );
    }

    // Prepare data for the chart
    const chartData = [
      {
        name: 'Supervisors',
        value: dashboardData?.totalSupervisors || 0,
        color: 'hsl(142.1, 76.2%, 36.3%)', // Green
      },
      {
        name: 'Employees',
        value: dashboardData?.totalEmployees || 0,
        color: 'hsl(221.2, 83.2%, 53.3%)', // Blue
      },
      {
        name: 'Clients',
        value: dashboardData?.totalClients || 0,
        color: 'hsl(262.1, 83.3%, 57.8%)', // Purple
      },
      {
        name: 'Reports',
        value: dashboardData?.totalReports || 0,
        color: 'hsl(0, 84.2%, 60.2%)', // Red
      },
    ];

    const totalItems = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="w-full h-full p-6">
        {/* <div className="mb-6">
          <h2 className="text-2xl font-bold">Overview Dashboard</h2>
          <p className="text-muted-foreground">
            Total items: {totalItems.toLocaleString()}
          </p>
        </div> */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="md:col-span-2 bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Distribution Overview</h3>
            <div className="h-[250px]">
              <ChartContainer
                config={{
                  supervisors: {
                    label: 'Supervisors',
                    color: 'hsl(142.1, 76.2%, 36.3%)',
                  },
                  employees: {
                    label: 'Employees',
                    color: 'hsl(221.2, 83.2%, 53.3%)',
                  },
                  suppliers: {
                    label: 'Suppliers',
                    color: 'hsl(38, 92%, 50%)',
                  },
                  clients: {
                    label: 'Clients',
                    color: 'hsl(262.1, 83.3%, 57.8%)',
                  },
                  reports: {
                    label: 'Reports',
                    color: 'hsl(0, 84.2%, 60.2%)',
                  },
                }}
              >
                <RechartsPrimitive.PieChart>
                  <RechartsPrimitive.Pie
                    data={chartData}
                    cx="50%"
                    cy="30%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <RechartsPrimitive.Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </RechartsPrimitive.Pie>
                  <RechartsPrimitive.Tooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => {
                          const label = chartData.find(item => item.name === name)?.name || name;
                          const labelStr = String(label);
                          const isPeople = ['Supervisors', 'Employees', 'Suppliers', 'Clients'].includes(labelStr);
                          return [
                            `${value} ${isPeople ? (value === 1 ? labelStr.slice(0, -1) : labelStr) : labelStr}`,
                            '',
                          ];
                        }}
                      />
                    }
                  />
                  {/* <RechartsPrimitive.Legend
                    content={({ payload }) => (
                      <div className="mt-4 flex flex-wrap justify-center gap-4">
                        {payload?.map((entry, index) => (
                          <div key={`legend-${index}`} className="flex items-center gap-1.5">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-xs">{entry.value}</span>
                            <span className="text-xs text-muted-foreground">
                              ({((chartData.find(d => d.name === entry.value)?.value || 0) / Math.max(1, totalItems) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  /> */}
                </RechartsPrimitive.PieChart>
              </ChartContainer>
            </div>
          </div>
          
          {/* Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalItems.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Across all categories</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">By Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {chartData.map((item) => {
                  const percentage = (item.value / Math.max(1, totalItems) * 100).toFixed(1);
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.value.toLocaleString()}</span>
                          <span className="text-muted-foreground text-xs w-10 text-right">{percentage}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.color,
                            opacity: 0.6
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    switch (activeSection) {
      case "users":
        return <UserManagement />;
      case "projects":
        return <ProjectsManagement />;
      case "supervisors":
        return <SupervisorsManagement />;
      case "suppliers":
        return <SuppliersManagement />;
      case "clients":
        return <ClientsManagement />;
      case "employees":
        return <EmployeesManagement />;
      case "workers":
        return <AllWorkersOverview />;
      case "materials":
        return <MaterialsManagement />;
      case "reports":
        return <Reportmanagement />;
      case "payroll":
        return <PayrollManagement />;
      case "settings":
        return <AdminSetting />;
      default:
        return (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {stats.map((stat) => (
                <Card 
                  key={stat.id} 
                  className={`h-[120px] hover:shadow-md transition-shadow cursor-pointer ${
                    selectedStat === stat.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedStat(selectedStat === stat.id ? null : stat.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-full ${stat.color.replace('text', 'bg')} bg-opacity-10`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.change && (
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">{stat.change}</span> from last month
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Details Panel */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedStat 
                    ? `${selectedStat.charAt(0).toUpperCase() + selectedStat.slice(1)} Details`
                    : "Dashboard Overview"}
                </CardTitle>
                <CardDescription>
                  {selectedStat ? `Viewing details for ${selectedStat}` : 'Select a card to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[400px]">
               
                {renderDetailsTable()}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardLayout userRole="admin" activeSection={activeSection} onSectionChange={setActiveSection}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            {error && (
              <Button onClick={fetchDashboardData} variant="outline">
                Retry
              </Button>
            )}
          </div>
          {renderContent()}
        </div>
      </DashboardLayout>
    </div>
  );
}