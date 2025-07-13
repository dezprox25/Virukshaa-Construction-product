"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Calendar, DollarSign, Download, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function ClientPaymentsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const paymentStats = [
    { title: "Total Paid", value: "$781,500", icon: DollarSign, color: "text-green-600" },
    { title: "Pending Payments", value: "$125,000", icon: Clock, color: "text-orange-600" },
    { title: "Overdue", value: "$0", icon: AlertCircle, color: "text-red-600" },
    { title: "Next Payment", value: "$45,000", icon: Calendar, color: "text-blue-600" },
  ]

  const paymentSchedule = [
    {
      id: "PAY-001",
      project: "Luxury Villa Construction",
      milestone: "Foundation Completion",
      amount: "$112,500",
      dueDate: "Nov 20, 2024",
      status: "Pending",
      description: "25% payment upon foundation completion",
      invoiceNumber: "INV-2024-001",
    },
    {
      id: "PAY-002",
      project: "Office Building Renovation",
      milestone: "Structural Work",
      amount: "$70,000",
      dueDate: "Dec 15, 2024",
      status: "Upcoming",
      description: "25% payment for structural work completion",
      invoiceNumber: "INV-2024-002",
    },
    {
      id: "PAY-003",
      project: "Warehouse Expansion",
      milestone: "Final Payment",
      amount: "$16,000",
      dueDate: "Nov 30, 2024",
      status: "Pending",
      description: "Final 5% payment upon project completion",
      invoiceNumber: "INV-2024-003",
    },
  ]

  const paymentHistory = [
    {
      id: "PAY-H001",
      project: "Luxury Villa Construction",
      milestone: "Project Start",
      amount: "$112,500",
      paidDate: "Jan 20, 2024",
      status: "Paid",
      method: "Bank Transfer",
      invoiceNumber: "INV-2024-H001",
      transactionId: "TXN-001-2024",
    },
    {
      id: "PAY-H002",
      project: "Luxury Villa Construction",
      milestone: "Structure Completion",
      amount: "$112,500",
      paidDate: "May 20, 2024",
      status: "Paid",
      method: "Check",
      invoiceNumber: "INV-2024-H002",
      transactionId: "CHK-002-2024",
    },
    {
      id: "PAY-H003",
      project: "Office Building Renovation",
      milestone: "Demolition Complete",
      amount: "$70,000",
      paidDate: "Apr 20, 2024",
      status: "Paid",
      method: "Bank Transfer",
      invoiceNumber: "INV-2024-H003",
      transactionId: "TXN-003-2024",
    },
    {
      id: "PAY-H004",
      project: "Warehouse Expansion",
      milestone: "Project Start",
      amount: "$80,000",
      paidDate: "Aug 10, 2024",
      status: "Paid",
      method: "Bank Transfer",
      invoiceNumber: "INV-2024-H004",
      transactionId: "TXN-004-2024",
    },
    {
      id: "PAY-H005",
      project: "Warehouse Expansion",
      milestone: "Structure Complete",
      amount: "$128,000",
      paidDate: "Oct 15, 2024",
      status: "Paid",
      method: "Bank Transfer",
      invoiceNumber: "INV-2024-H005",
      transactionId: "TXN-005-2024",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Overdue":
        return "bg-red-100 text-red-800"
      case "Upcoming":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "Overdue":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "Upcoming":
        return <Calendar className="w-4 h-4 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payments</h2>
          <p className="text-muted-foreground">Manage your project payments and invoices</p>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentStats.map((stat) => (
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

      {/* Payment Management */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>Track payment schedules and history</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="space-y-4">
                {paymentSchedule.map((payment) => (
                  <div key={payment.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{payment.project}</h4>
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1">{payment.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{payment.milestone}</p>
                        <p className="text-xs text-muted-foreground">{payment.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{payment.amount}</p>
                        <p className="text-sm text-muted-foreground">Due: {payment.dueDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Invoice: {payment.invoiceNumber}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Invoice
                        </Button>
                        {payment.status === "Pending" && (
                          <Button size="sm">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input
                  placeholder="Search payment history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export History
                </Button>
              </div>

              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{payment.project}</h4>
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1">{payment.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{payment.milestone}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Paid: {payment.paidDate}</span>
                          <span>Method: {payment.method}</span>
                          <span>Transaction: {payment.transactionId}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{payment.amount}</p>
                        <p className="text-sm text-muted-foreground">{payment.invoiceNumber}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Receipt
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
