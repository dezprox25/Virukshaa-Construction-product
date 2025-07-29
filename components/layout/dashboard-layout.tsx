"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
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
  Menu as MenuIcon,
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
  const [adminProfile, setAdminProfile] = useState<{adminName: string; email: string} | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now())
  const router = useRouter()

  // Fetch admin profile data with auto-update
  useEffect(() => {
    let isMounted = true
    
    const fetchAdminProfile = async () => {
      try {
        // Add a timestamp to prevent caching
        const response = await fetch(`/api/admin/profile?_t=${Date.now()}`)
        if (!response.ok) throw new Error('Failed to fetch admin profile')
        const data = await response.json()
        
        if (isMounted) {
          setAdminProfile({
            adminName: data.adminName,
            email: data.email
          })
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error)
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'Failed to load admin profile',
            variant: 'destructive',
          })
        }
      }
    }

    // Initial fetch
    fetchAdminProfile()

    // Set up a real-time check every 5 seconds
    const intervalId = setInterval(fetchAdminProfile, 50000)

    // Clean up
    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [lastUpdated])

  // Function to trigger a profile update
  const triggerProfileUpdate = () => {
    setLastUpdated(Date.now())
  }

  // Set up a custom event listener for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      triggerProfileUpdate()
    }

    // Listen for custom event when profile is updated
    window.addEventListener('profileUpdated', handleProfileUpdate)
    
    // Clean up
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [])

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
          // { icon: Users, label: "All Workers", href: "workers", id: "workers" },
          // { icon: Package, label: "Materials", href: "materials", id: "materials" },
          { icon: ClipboardList, label: "Reports", href: "reports", id: "reports" },
          { icon: MessageSquare, label: "Payroll", href: "payroll", id: "payroll" },
          // { icon: MessageSquare, label: "Messages", href: "message", id: "message" },
          { icon: Settings, label: "Settings", href: "settings", id: "settings" },

        ]
      case "supervisor":
        return [
          ...baseItems,
          { icon: FolderOpen, label: "Task", href: "task", id: "task" },
          { icon: Users, label: "Employee", href: "employee", id: "employee" },   
          { icon: ClipboardList, label: "Daily Logs", href: "logs", id: "logs" },
          { icon: Package, label: "Materials", href: "materials", id: "materials" },
        ]
      case "client":
        return [
          ...baseItems,
          { icon: FolderOpen, label: "My Projects", href: "projects", id: "projects" },
          { icon: MessageSquare, label: "Payments", href: "payments", id: "payments" },
          { icon: MessageSquare, label: "Messages", href: "message", id: "message" },
          { icon: Settings, label: "Settings", href: "settings", id: "settings" },
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


  // bg-[#051118] 
  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"} bg-[#F0F0F0] shadow-md`}>
      <div className="flex items-center gap-2 p-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-[#37db44]" />
        </div>
        <span className="font-bold text-xl text-[#37db44]">Virukshaa</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={`w-full justify-start gap-3 ${
              activeSection === item.id ? "bg-[#fff] text-[#316b35] hover:bg-[#fff] hover:shadow-lg shadow-md transition-shadow" : "hover:bg-[#F9F9F9] hover:text-[#000] text-[#051118]"
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
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed  top-4 left-4 z-50">
            <MenuIcon className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl relative left-10 font-semibold">
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
                      {adminProfile?.adminName || userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {adminProfile?.email || localStorage.getItem("userEmail") || "user@example.com"}
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
