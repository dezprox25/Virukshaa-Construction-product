"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminDashboard from "@/components/dashboards/admin-dashboard"
import SupervisorDashboard from "@/components/dashboards/supervisor-dashboard"
import ClientDashboard from "@/components/dashboards/client-dashboard"
import SupplierDashboard from "@/components/dashboards/supplier-dashboard"

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    if (!role) {
      router.push("/")
      return
    }
    setUserRole(role)
  }, [router])

  if (!userRole) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const renderDashboard = () => {
    switch (userRole) {
      case "admin":
        return <AdminDashboard />
      case "supervisor":
        return <SupervisorDashboard />
      case "client":
        return <ClientDashboard />
      case "supplier":
        return <SupplierDashboard />
      default:
        return <AdminDashboard />
    }
  }

  return renderDashboard()
}
