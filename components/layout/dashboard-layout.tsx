"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2,
  Menu,
  Home,
  Users,
  FolderOpen,
  Package,
  ClipboardList,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Truck,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: string
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export default function DashboardLayout({
  children,
  userRole,
  activeSection = "dashboard",
  onSectionChange,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  const getNavItems = () => {
    const baseItems = [{ icon: Home, label: "Dashboard", href: "dashboard", id: "dashboard" }]

    switch (userRole) {
      case "admin":
        return [
          ...baseItems,
          // { icon: Users, label: "User Management", href: "users", id: "users" },
          // { icon: FolderOpen, label: "Projects", href: "projects", id: "projects" },
          { icon: ClipboardList, label: "Supervisors", href: "supervisors", id: "supervisors" },
          { icon: Truck, label: "Suppliers", href: "suppliers", id: "suppliers" },
          { icon: Users, label: "Employees", href: "employees", id: "employees" },
          { icon: Users, label: "Clients", href: "clients", id: "clients" },
          { icon: Users, label: "All Workers", href: "workers", id: "workers" },
          { icon: Package, label: "Materials", href: "materials", id: "materials" },
          { icon: ClipboardList, label: "Reports", href: "reports", id: "reports" },
          { icon: MessageSquare, label: "Payroll", href: "payroll", id: "payroll" },
          { icon: Settings, label: "Settings", href: "settings", id: "settings" },
        ]
      case "supervisor":
        return [
          ...baseItems,
          { icon: FolderOpen, label: "Projects", href: "projects", id: "projects" },
          { icon: ClipboardList, label: "Daily Logs", href: "logs", id: "logs" },
          { icon: Users, label: "Attendance", href: "attendance", id: "attendance" },
          { icon: Package, label: "Materials", href: "materials", id: "materials" },
        ]
      case "client":
        return [
          ...baseItems,
          { icon: FolderOpen, label: "My Projects", href: "projects", id: "projects" },
          { icon: ClipboardList, label: "Progress Reports", href: "reports", id: "reports" },
          { icon: MessageSquare, label: "Feedback", href: "feedback", id: "feedback" },
        ]
      case "supplier":
        return [
          ...baseItems,
          { icon: Package, label: "Inventory", href: "inventory", id: "inventory" },
          { icon: ClipboardList, label: "Delivery Logs", href: "deliveries", id: "deliveries" },
          { icon: FolderOpen, label: "Orders", href: "orders", id: "orders" },
        ]
      default:
        return baseItems
    }
  }

  const navItems = getNavItems()

  const handleNavClick = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId)
    }
    setSidebarOpen(false)
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"} bg-white border-r`}>
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl">ConstructPro</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={`w-full justify-start gap-3 ${
              activeSection === item.id ? "bg-blue-600 text-white hover:bg-blue-700" : "hover:bg-gray-100"
            }`}
            onClick={() => handleNavClick(item.id)}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Button>
        ))}
      </nav>
    </div>
  )

  const getSectionTitle = () => {
    const currentItem = navItems.find((item) => item.id === activeSection)
    return currentItem ? currentItem.label : "Dashboard"
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <h1 className="text-xl font-semibold">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} - {getSectionTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>{userRole.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {localStorage.getItem("userEmail") || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
