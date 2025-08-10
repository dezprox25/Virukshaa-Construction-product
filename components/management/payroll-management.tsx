"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Download, PlusCircle, Filter, Save, X, Edit } from 'lucide-react'
import { toast } from "sonner"
import { jsPDF } from "jspdf"

type User = {
  _id: string
  name: string
  email: string
  role: "client" | "supervisor" | "supplier" | "employee"
  salary?: number
  projectTotalAmount?: number // For clients
  supplierAmount?: number // For suppliers - deprecated, use totalSupplyValue
  totalSupplyValue?: number // New: total value of all materials
  totalPaid: number
  dueAmount: number
  lastPaymentDate?: string
  status: "active" | "inactive"
  phone?: string
  address?: string
  // Supplier-specific material fields
  projectMaterials?: Array<{
    projectId: string
    projectName?: string
    materialType: string
    quantity: number
    pricePerUnit: number
    totalAmount: number
    amount: number
    paidAmount?: number
    dueAmount?: number
    createdAt?: string
  }>
  selectedProjectId?: string
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
  const [projects, setProjects] = useState<{_id: string, name: string}[]>([])
  const [supplierMaterials, setSupplierMaterials] = useState<Record<string, any[]>>({})
  // Aggregate of payroll records keyed by supplier id
  const [payrollBySupplier, setPayrollBySupplier] = useState<Record<string, { totalPaid: number; lastPaymentDate?: string }>>({})

  // Normalize various possible ID formats (string, ObjectId, {$oid}, {_id}) to a string
  const normalizeId = (id: any): string => {
    try {
      if (!id) return ''
      if (typeof id === 'string') return id
      if (typeof id === 'number') return String(id)
      if (typeof id === 'object') {
        // Common MongoDB serializations
        if ((id as any).$oid) return String((id as any).$oid)
        if ((id as any)._id) return normalizeId((id as any)._id)
        if (typeof (id as any).toHexString === 'function') return (id as any).toHexString()
        if (typeof (id as any).toString === 'function') {
          const s = (id as any).toString()
          if (s && s !== '[object Object]') return s
        }
      }
      return String(id)
    } catch {
      return ''
    }
  }

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

  // Handle project selection for supplier materials
  const handleProjectSelection = async (userId: string, projectId: string) => {
    console.log('Project selected:', projectId, 'for user:', userId)
    
    // Update the user's selected project in the users state
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user._id === userId 
          ? { ...user, selectedProjectId: projectId }
          : user
      )
    )
    
    // Also update editForm if it exists and is for this user
    if (editForm && editForm._id === userId) {
      setEditForm({
        ...editForm,
        selectedProjectId: projectId
      })
    }
    
    // Fetch materials for this project and supplier
    if (projectId) {
      await fetchSupplierMaterials(userId, projectId)
    }
  }

  // Get materials for a specific project
  const getProjectMaterials = (userId: string, projectId: string) => {
    const user = users.find(u => u._id === userId)
    console.log('Getting materials for user:', userId, 'project:', projectId)
    console.log('User data:', user)
    console.log('User project materials:', user?.projectMaterials)
    
    if (!user || !user.projectMaterials) {
      console.log('No user or project materials found')
      return []
    }
    
    const filtered = user.projectMaterials.filter(material => normalizeId(material.projectId) === normalizeId(projectId))
    console.log('Filtered materials for project:', filtered)
    return filtered
  }

  // Load materials for all suppliers when component mounts
  const loadAllSupplierMaterials = async () => {
    const suppliers = users.filter(user => user.role === 'supplier')
    console.log('Loading materials for suppliers:', suppliers.length)
    
    for (const supplier of suppliers) {
      console.log('Processing supplier:', supplier.name)
      console.log('Current supplier materials:', supplier.projectMaterials?.length || 0)
      
      // Always fetch fresh materials from API for each supplier
      await fetchSupplierMaterials(supplier._id)
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('Finished loading materials for all suppliers')
  }

  // Update material field values
  const updateMaterialField = (userId: string, projectId: string, materialIndex: number, field: string, value: number) => {
    const user = users.find(u => u._id === userId)
    if (!user || !user.projectMaterials) return
    
    const projectMaterials = user.projectMaterials.filter(m => m.projectId === projectId)
    if (!projectMaterials[materialIndex]) return
    
    // Update the material in the user's data
    setUsers(prevUsers => 
      prevUsers.map(u => {
        if (u._id === userId) {
          const updatedMaterials = [...(u.projectMaterials || [])]
          const globalIndex = updatedMaterials.findIndex(m => 
            m.projectId === projectId && 
            updatedMaterials.filter(mat => mat.projectId === projectId).indexOf(m) === materialIndex
          )
          
          if (globalIndex !== -1) {
            updatedMaterials[globalIndex] = {
              ...updatedMaterials[globalIndex],
              [field]: value
            }
          }
          
          return {
            ...u,
            projectMaterials: updatedMaterials
          }
        }
        return u
      })
    )
    
    // Also update editForm if it's the current user being edited
    if (editForm && editForm._id === userId) {
      const updatedMaterials = [...(editForm.projectMaterials || [])]
      const globalIndex = updatedMaterials.findIndex(m => 
        m.projectId === projectId && 
        updatedMaterials.filter(mat => mat.projectId === projectId).indexOf(m) === materialIndex
      )
      
      if (globalIndex !== -1) {
        updatedMaterials[globalIndex] = {
          ...updatedMaterials[globalIndex],
          [field]: value
        }
        
        setEditForm({
          ...editForm,
          projectMaterials: updatedMaterials
        })
      }
    }
  }

  // Fetch supplier materials from supplier-management data
  const fetchSupplierMaterials = async (userId: string, projectId?: string) => {
    console.log('🔍 Fetching materials for user:', userId, 'project:', projectId)
    try {
      // Fetch ALL supplier materials from the API (no projectId filter in API)
      const apiUrl = `/api/suppliers/${userId}/materials`
      console.log('📡 API URL:', apiUrl)
      const response = await fetch(apiUrl)
      console.log('📊 Materials API response status:', response.status)
      
      if (response.ok) {
        const allMaterials = await response.json()
        console.log('✅ Fetched all materials from API:', allMaterials)
        console.log('📋 Materials type:', typeof allMaterials, 'Length:', Array.isArray(allMaterials) ? allMaterials.length : 'Not array')
        
        // Transform and store all materials
        const transformedMaterials = Array.isArray(allMaterials) ? allMaterials.map((material: any) => {
          console.log('🔄 Transforming material:', material)
          return {
            _id: material._id || `${userId}-${material.materialType}-${Date.now()}`,
            materialType: material.materialType || 'Unknown',
            projectId: normalizeId(material.projectId) || 'default',
            amount: Number(material.amount) || 0,
            quantity: Number(material.quantity) || 0,
            pricePerUnit: material.amount && material.quantity ? (Number(material.amount) / Number(material.quantity)) : 0,
            totalAmount: Number(material.amount) || 0,
            paidAmount: Number(material.paidAmount) || 0,
            dueAmount: Number(material.amount) - Number(material.paidAmount || 0),
            createdAt: material.date || material.createdAt
          }
        }) : []
        
        console.log('✨ Transformed materials:', transformedMaterials)
        console.log('📊 Total transformed materials:', transformedMaterials.length)
        
        // Calculate total supply value from materials
        const totalSupplyValue = transformedMaterials.reduce((sum, material) => sum + (material.amount || 0), 0)
        console.log('💰 Calculated total supply value:', totalSupplyValue)
        
        // Update the user's projectMaterials in local state with ALL materials
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              console.log('🔄 Updating user materials for:', user.name)
              console.log('📊 Old materials count:', user.projectMaterials?.length || 0)
              console.log('📊 New materials count:', transformedMaterials.length)
              return {
                ...user,
                projectMaterials: transformedMaterials,
                totalSupplyValue: totalSupplyValue > 0 ? totalSupplyValue : user.totalSupplyValue
              }
            }
            return user
          })
        )
        
        // If a specific project was requested, store filtered materials in cache
        if (projectId) {
          const projectMaterials = transformedMaterials.filter(m => normalizeId(m.projectId) === normalizeId(projectId))
          setSupplierMaterials(prev => ({
            ...prev,
            [`${userId}-${projectId}`]: projectMaterials
          }))
          console.log(`📦 Cached ${projectMaterials.length} materials for project ${projectId}`)
        }
        
      } else {
        console.log('❌ API failed with status:', response.status)
        const errorText = await response.text()
        console.log('❌ API error:', errorText)
        
        // Fallback to existing data if API fails
        const user = users.find(u => u._id === userId)
        if (user && user.projectMaterials) {
          console.log('🔄 Using existing user materials as fallback')
          if (projectId) {
            const projectMaterials = user.projectMaterials.filter(m => m.projectId === projectId)
            setSupplierMaterials(prev => ({
              ...prev,
              [`${userId}-${projectId}`]: projectMaterials
            }))
          }
        }
      }
    } catch (error) {
      console.error('💥 Error fetching supplier materials:', error)
      // Fallback to existing data
      const user = users.find(u => u._id === userId)
      if (user && user.projectMaterials && projectId) {
        const projectMaterials = user.projectMaterials.filter(m => m.projectId === projectId)
        console.log('🔄 Error fallback materials:', projectMaterials)
        setSupplierMaterials(prev => ({
          ...prev,
          [`${userId}-${projectId}`]: projectMaterials
        }))
      }
    }
  }

  // Fetch projects for dropdown
  const fetchProjects = async () => {
    try {
      console.log('Fetching projects from /api/projects...')
      const response = await fetch('/api/projects')
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const projectsData = await response.json()
      console.log('Raw projects data:', projectsData)
      console.log('Projects array length:', projectsData?.length)
      
      // Transform projects to ensure they have the right structure
      const transformedProjects = Array.isArray(projectsData) 
        ? projectsData.map(project => ({
            _id: project._id || project.id,
            name: project.title || project.name || 'Unnamed Project'
          }))
        : []
      
      console.log('Transformed projects:', transformedProjects)
      setProjects(transformedProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
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
        // If a specific project is selected, calculate based on that project only
        if (user.selectedProjectId && user.projectMaterials) {
          const projectMaterials = user.projectMaterials.filter(m => m.projectId === user.selectedProjectId)
          const projectTotal = projectMaterials.reduce((sum, material) => sum + (material.amount || material.totalAmount || 0), 0)
          return Math.max(0, projectTotal - (user.totalPaid || 0))
        }
        // Otherwise calculate based on all materials or total supply value
        if (user.projectMaterials && user.projectMaterials.length > 0) {
          const totalMaterialValue = user.projectMaterials.reduce((sum, material) => sum + (material.amount || material.totalAmount || 0), 0)
          const totalMaterialPaid = user.projectMaterials.reduce((sum, material) => sum + (material.paidAmount || 0), 0)
          return Math.max(0, totalMaterialValue - totalMaterialPaid)
        }
        return Math.max(0, (user.totalSupplyValue || 0) - (user.totalPaid || 0))
      default:
        return user.dueAmount || 0
    }
  }

  // Enhanced role-specific data transformation with supplier-specific fields
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
        // Enhanced supplier data transformation with better material handling
        console.log('🏭 Transforming supplier data for:', user.companyName || user.name)
        console.log('📦 Raw supplier data:', {
          companyName: user.companyName,
          materials: user.materials,
          projectMaterials: user.projectMaterials,
          totalSupplyValue: user.totalSupplyValue,
          totalPaid: user.totalPaid
        })
        
        // Handle both 'materials' and 'projectMaterials' fields from API
        const rawMaterials = user.projectMaterials || user.materials || []
        console.log('📋 Raw materials array:', rawMaterials, 'Length:', Array.isArray(rawMaterials) ? rawMaterials.length : 'Not array')
        
        const supplierMaterials = Array.isArray(rawMaterials) ? rawMaterials.map((material: any) => {
          console.log('🔄 Processing material:', material)
          return {
            _id: material._id || `${user._id}-${material.materialType}-${Date.now()}`,
            materialType: material.materialType || material.name || 'Unknown',
            projectId: normalizeId(material.projectId) || 'default',
            amount: Number(material.amount) || Number(material.totalAmount) || 0,
            quantity: Number(material.quantity) || 0,
            pricePerUnit: material.amount && material.quantity ? (Number(material.amount) / Number(material.quantity)) : Number(material.pricePerUnit) || 0,
            totalAmount: Number(material.amount) || Number(material.totalAmount) || 0,
            paidAmount: Number(material.paidAmount) || 0,
            dueAmount: Number(material.amount || material.totalAmount || 0) - Number(material.paidAmount || 0),
            createdAt: material.date || material.createdAt
          }
        }) : []
        
        console.log('✨ Transformed supplier materials:', supplierMaterials)
        console.log('📊 Materials count:', supplierMaterials.length)
        
        // Calculate total supply value from materials if not provided
        const calculatedSupplyValue = supplierMaterials.reduce((sum, material) => 
          sum + (material.amount || material.totalAmount || 0), 0
        )
        
        console.log('💰 Calculated supply value:', calculatedSupplyValue)
        console.log('💰 User provided supply value:', user.totalSupplyValue)
        
        transformedUser = {
          ...baseUser,
          name: user.companyName || user.name || 'Unknown Supplier',
          totalSupplyValue: Number(user.totalSupplyValue || user.totalAmount || user.contractValue || calculatedSupplyValue || 0),
          projectMaterials: supplierMaterials,
          totalPaid: Number(user.totalPaid) || 0,
          dueAmount: 0, // Will be calculated below
          selectedProjectId: user.selectedProjectId || null
        }
        
        console.log('🏭 Final transformed supplier:', {
          name: transformedUser.name,
          totalSupplyValue: transformedUser.totalSupplyValue,
          materialsCount: transformedUser.projectMaterials?.length || 0,
          totalPaid: transformedUser.totalPaid
        })
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
          // Merge in any known payroll aggregates for suppliers (fallback when supplier API lacks totals)
          const merged = allUsers.map(u => {
            if (u.role === 'supplier') {
              const agg = payrollBySupplier[u._id]
              if (agg) {
                const lastDate = agg.lastPaymentDate || u.lastPaymentDate
                return {
                  ...u,
                  totalPaid: Math.max(Number(u.totalPaid || 0), Number(agg.totalPaid || 0)),
                  lastPaymentDate: lastDate
                }
              }
            }
            return u
          })
          setUsers(merged)
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
    fetchProjects()
  }, [])

  // Fetch payroll entries and build supplier aggregates so supplier section shows paid amounts even if materials are missing
  useEffect(() => {
    const loadPayroll = async () => {
      try {
        const res = await fetch('/api/payroll')
        if (!res.ok) return
        const records = await res.json()
        const supplierRecords = Array.isArray(records) ? records.filter((r: any) => (r.userRole || r.user_role || '').toString().toLowerCase().includes('supplier')) : []
        const agg: Record<string, { totalPaid: number; lastPaymentDate?: string }> = {}
        const latestMaterialsBySupplier: Record<string, { materials: any[]; totalSupplyValue: number; dueAmount: number }> = {}
        for (const rec of supplierRecords) {
          const userId = (rec.user && (rec.user._id || rec.user.id)) || rec.user || rec.userId
          const key = userId?.toString?.() || String(userId || '')
          if (!key) continue
          const paid = Number(rec.amount || rec.totalPaid || 0)
          const date = rec.paymentDate || rec.createdAt
          if (!agg[key]) agg[key] = { totalPaid: 0, lastPaymentDate: date }
          agg[key].totalPaid += paid
          // keep latest date
          if (date && (!agg[key].lastPaymentDate || new Date(date) > new Date(agg[key].lastPaymentDate))) {
            agg[key].lastPaymentDate = date
          }

          // Track latest supplier materials snapshot if available on this record
          const mats: any[] = rec.supplierMaterials || rec.materials || []
          if (Array.isArray(mats) && mats.length > 0) {
            const recTime = new Date(date || rec.updatedAt || rec.createdAt || Date.now()).getTime()
            const existing = (latestMaterialsBySupplier as any)[key]?.__ts || 0
            if (recTime >= existing) {
              latestMaterialsBySupplier[key] = {
                // normalize for UI expectations
                materials: mats.map((m: any) => ({
                  _id: m._id || undefined,
                  projectId: (m.projectId && (m.projectId._id || m.projectId.id || m.projectId)) || m.project || 'default',
                  projectName: m.projectName || m.project?.name,
                  materialType: m.materialType || m.name || 'Unknown',
                  quantity: Number(m.quantity || 0),
                  pricePerUnit: Number(m.pricePerUnit || (m.totalAmount || m.amount || 0) / (m.quantity || 1)),
                  totalAmount: Number(m.totalAmount || m.amount || 0),
                  amount: Number(m.totalAmount || m.amount || 0),
                  paidAmount: Number(m.paidAmount || 0),
                  dueAmount: Number(m.dueAmount || (m.totalAmount || m.amount || 0) - Number(m.paidAmount || 0)),
                  createdAt: m.supplyDate || m.date || m.createdAt,
                })),
                // compute total from materials if not provided on the record
                totalSupplyValue: Number(rec.totalSupplyValue || mats.reduce((s: number, m: any) => s + Number(m.totalAmount || m.amount || 0), 0) || 0),
                // temporary due; we'll recompute after aggregating totalPaid across all records
                dueAmount: Number(rec.dueAmount || 0),
                __ts: recTime,
              } as any
            }
          }
        }
        setPayrollBySupplier(agg)
        // Also merge immediately into users state if already loaded
        if (users.length > 0) {
          setUsers(prev => prev.map(u => {
            if (u.role === 'supplier' && agg[u._id]) {
              const a = agg[u._id]
              const latest = latestMaterialsBySupplier[u._id]
              const mergedMaterials = latest?.materials || u.projectMaterials || []
              const mergedSupplyValue = latest?.totalSupplyValue ?? (mergedMaterials.length ? mergedMaterials.reduce((s: number, m: any) => s + Number(m.amount || m.totalAmount || 0), 0) : (u.totalSupplyValue ?? 0))
              // Recompute due based on aggregated paid vs total supply value
              const mergedDue = Math.max(0, (mergedSupplyValue || 0) - Number(a.totalPaid || 0))
              return {
                ...u,
                projectMaterials: mergedMaterials,
                totalSupplyValue: mergedSupplyValue,
                dueAmount: mergedDue,
                totalPaid: Math.max(Number(u.totalPaid || 0), Number(a.totalPaid || 0)),
                lastPaymentDate: a.lastPaymentDate || u.lastPaymentDate
              }
            }
            return u
          }))
        }
      } catch (e) {
        console.warn('Failed to load payroll aggregates', e)
      }
    }
    loadPayroll()
  }, [users.length])

  // Load supplier materials after users are loaded
  useEffect(() => {
    if (users.length > 0) {
      console.log('Users loaded, starting to load supplier materials...')
      console.log('Total users:', users.length)
      console.log('Suppliers found:', users.filter(u => u.role === 'supplier').length)
      loadAllSupplierMaterials()
    }
  }, [users.length])

  // Update filtered users when search term or role filter changes
  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesRole = selectedRole === "all" || user.role === selectedRole
      const matchesSearch =
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.role === "supplier" && user.projectMaterials &&
          user.projectMaterials.some(material =>
            material.materialType.toLowerCase().includes(searchTerm.toLowerCase())
          ))
      return matchesRole && matchesSearch
    })
    setFilteredUsers(filtered)
  }, [searchTerm, users, selectedRole])

  const handleEdit = (user: User) => {
    setEditingId(user._id)
    setEditForm({ ...user })
  }

  // Enhanced save logic with supplier support
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
          // For suppliers, we need to handle material-level payments differently
          // Don't try to update individual material payments through the payroll system
          // Instead, just update the overall payment tracking
          apiData = {
            _id: editForm._id,
            name: editForm.name,
            email: editForm.email,
            role: editForm.role,
            dueAmount: editForm.dueAmount,
            status: editForm.status,
            totalPaid: editForm.totalPaid,
            lastPaymentDate: editForm.lastPaymentDate,
            // Don't send material-specific data as it should be managed in supplier management
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
          // For suppliers, include a materials snapshot and totals so the payroll feed can power the UI even
          // when the suppliers API lacks materials/totalSupplyValue.
          let payrollData: any = {
            user: userId,
            userRole: editForm.role,
            amount: paymentAmount,
            paymentDate: new Date(),
            status: "paid",
            notes: `Payment of ₹${paymentAmount} recorded for ${editForm.role} ${editForm.name}.`,
          }
          if (editForm.role === 'supplier') {
            const allMaterials = Array.isArray(editForm.projectMaterials) ? editForm.projectMaterials : []
            const materialsForScope = editForm.selectedProjectId
              ? allMaterials.filter(m => m.projectId === editForm.selectedProjectId)
              : allMaterials
            const computedTotalSupply = materialsForScope.reduce((s, m) => s + Number(m.amount || m.totalAmount || 0), 0)
            payrollData = {
              ...payrollData,
              supplierMaterials: materialsForScope.map(m => ({
                _id: m._id,
                projectId: m.projectId,
                projectName: m.projectName,
                materialType: m.materialType,
                quantity: Number(m.quantity || 0),
                pricePerUnit: Number(m.pricePerUnit || 0),
                totalAmount: Number(m.totalAmount || m.amount || 0),
                amount: Number(m.totalAmount || m.amount || 0),
                paidAmount: Number(m.paidAmount || 0),
                dueAmount: Number(m.dueAmount || (m.totalAmount || m.amount || 0) - Number(m.paidAmount || 0)),
                createdAt: m.createdAt,
              })),
              totalSupplyValue: Number(editForm.totalSupplyValue || computedTotalSupply || 0),
              // dueAmount will be recomputed on the server but send a helpful hint
              dueAmount: Math.max(0, Number(editForm.totalSupplyValue || computedTotalSupply || 0) - Number(editForm.totalPaid || 0)),
            }
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

  // Enhanced input change handling with supplier-specific calculations
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
          // For suppliers, handle project-specific vs total calculations
          if (field === "totalPaid") {
            const newTotalPaid = numericValue
            newForm.totalPaid = newTotalPaid
            
            // If a specific project is selected, calculate due based on that project
            if (newForm.selectedProjectId && newForm.projectMaterials) {
              const projectMaterials = newForm.projectMaterials.filter(m => m.projectId === newForm.selectedProjectId)
              const projectTotalValue = projectMaterials.reduce((sum, m) => sum + (m.amount || m.totalAmount || 0), 0)
              newForm.dueAmount = Math.max(0, projectTotalValue - newTotalPaid)
              
              console.log(
                `Supplier project calculation: projectValue=${projectTotalValue}, paid=${newTotalPaid}, due=${newForm.dueAmount}`,
              )
            } else {
              // Calculate based on total supply value
              const currentTotalValue = newForm.totalSupplyValue || 0
              newForm.dueAmount = Math.max(0, currentTotalValue - newTotalPaid)
              
              console.log(
                `Supplier total calculation: totalValue=${currentTotalValue}, paid=${newTotalPaid}, due=${newForm.dueAmount}`,
              )
            }

            // Update individual material paid amounts proportionally if needed
            if (newForm.projectMaterials && newForm.projectMaterials.length > 0) {
              const totalMaterialValue = newForm.projectMaterials.reduce((sum, m) => sum + (m.amount || m.totalAmount || 0), 0)
              if (totalMaterialValue > 0) {
                newForm.projectMaterials = newForm.projectMaterials.map(material => ({
                  ...material,
                  paidAmount: ((material.amount || material.totalAmount || 0) / totalMaterialValue) * newTotalPaid,
                  dueAmount: (material.amount || material.totalAmount || 0) - (((material.amount || material.totalAmount || 0) / totalMaterialValue) * newTotalPaid)
                }))
              }
            }
          } else if (field === "totalSupplyValue") {
            newForm.totalSupplyValue = numericValue
            newForm.dueAmount = Math.max(0, numericValue - (newForm.totalPaid || 0))
          }
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

        // Different headers for suppliers
        const headers = role === "supplier"
          ? ["Name", "Email", "Materials", "Total Value", "Paid", "Due", "Status"]
          : ["Name", "Email", "Phone", "Amount", "Total Paid", "Due", "Last Payment", "Status"]
        const columnWidths = role === "supplier"
          ? [25, 35, 40, 25, 20, 20, 15]
          : [25, 40, 25, 20, 20, 20, 25, 15]

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

          let row: string[]
          if (role === "supplier") {
            const materialsText = user.projectMaterials && user.projectMaterials.length > 0
              ? user.projectMaterials.slice(0, 2).map(m =>
                `${m.materialType} (${m.quantity}×₹${m.pricePerUnit})`
              ).join(", ") + (user.projectMaterials.length > 2 ? "..." : "")
              : "No materials"

            row = [
              user.name || "N/A",
              user.email || "N/A",
              materialsText,
              `₹${(user.totalSupplyValue || 0).toFixed(2)}`,
              `₹${user.totalPaid?.toFixed(2) || "0.00"}`,
              `₹${user.dueAmount?.toFixed(2) || "0.00"}`,
              user.status || "N/A",
            ]
          } else {
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
            }

            row = [
              user.name || "N/A",
              user.email || "N/A",
              user.phone || "N/A",
              amount,
              `₹${user.totalPaid?.toFixed(2) || "0.00"}`,
              `₹${user.dueAmount?.toFixed(2) || "0.00"}`,
              user.lastPaymentDate ? new Date(user.lastPaymentDate).toLocaleDateString() : "N/A",
              user.status || "N/A",
            ]
          }

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
          totalAmount += (user.totalSupplyValue || (user.projectMaterials?.reduce((sum: number, m: any) => sum + (m.amount || m.totalAmount || 0), 0) || 0))
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
      description: "Material costs",
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
        return (user.totalSupplyValue || (user.projectMaterials?.reduce((sum: number, m: any) => sum + (m.amount || m.totalAmount || 0), 0) || 0))
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
        return "Material Cost"
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
            className={`shadow-sm cursor-pointer transition-all hover:scale-105 ${selectedRole === stat.role ? `${stat.color}` : ""
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
                placeholder={selectedRole === "supplier" ? "Search suppliers or materials..." : "Search users..."}
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
                {/* <TableHead>Role</TableHead> */}
                <TableHead>Email</TableHead>
                {selectedRole === "supplier" ? (
                  <>
                    <TableHead>Project</TableHead>
                    <TableHead>Materials</TableHead>
                    <TableHead className="text-right">Supply Value</TableHead>
                  </>
                ) : (
                  <TableHead className="text-right">{getAmountFieldName(selectedRole)}</TableHead>
                )}
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
                    {/* <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell> */}
                    <TableCell>{user.email}</TableCell>
                    {selectedRole === "supplier" ? (
                      <>
                        {/* Project Column */}
                        <TableCell>
                          <div className="space-y-2">
                            <select
                              className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                              value={user.selectedProjectId || ""}
                              onChange={e => handleProjectSelection(user._id, e.target.value)}
                            >
                              <option value="">All Projects</option>
                              {projects && projects.map(project => (
                                <option key={project._id} value={project._id}>{project.name}</option>
                              ))}
                            </select>
                            
                            {/* Show project info */}
                            {user.selectedProjectId ? (
                              <div className="text-sm font-medium text-black bg-blue-50 px-2 py-1 rounded border">
                                📍 {projects.find(p => p._id === user.selectedProjectId)?.name}
                              </div>
                            ) : (
                              user.projectMaterials && user.projectMaterials.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  {[...new Set(user.projectMaterials.map(m => m.projectId))].length} project{[...new Set(user.projectMaterials.map(m => m.projectId))].length !== 1 ? 's' : ''} available
                                </div>
                              )
                            )}
                          </div>
                        </TableCell>

                        {/* Materials Column */}
                        <TableCell>
                          {editingId === user._id && editForm ? (
                            /* Edit Mode - Show editable materials for selected project */
                            user.selectedProjectId ? (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {getProjectMaterials(user._id, user.selectedProjectId).map((material, idx) => (
                                  <div key={idx} className="border border-gray-200 rounded p-2 bg-gray-50">
                                    <div className="font-medium text-sm mb-1">{material.materialType}</div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <label className="text-gray-600">Qty:</label>
                                        <input
                                          type="number"
                                          className="w-full border rounded px-1 py-0.5 mt-0.5"
                                          value={material.quantity || ""}
                                          onChange={e => user.selectedProjectId && updateMaterialField(user._id, user.selectedProjectId, idx, 'quantity', Number(e.target.value))}
                                          min="0"
                                          step="0.01"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-gray-600">Amount:</label>
                                        <input
                                          type="number"
                                          className="w-full border rounded px-1 py-0.5 mt-0.5"
                                          value={material.amount || ""}
                                          onChange={e => user.selectedProjectId && updateMaterialField(user._id, user.selectedProjectId, idx, 'amount', Number(e.target.value))}
                                          min="0"
                                          step="0.01"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {getProjectMaterials(user._id, user.selectedProjectId).length === 0 && (
                                  <div className="text-center py-2 text-gray-500 text-sm">
                                    No materials for selected project
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-2 text-gray-500 text-sm">
                                Select a project to edit materials
                              </div>
                            )
                          ) : (
                            /* Default View - Show materials based on selected project or all materials */
                            user.selectedProjectId ? (
                              <div className="space-y-1">
                                {getProjectMaterials(user._id, user.selectedProjectId).map((material, idx) => (
                                  <div key={idx} className="text-sm">
                                    <div className="font-medium text-gray-800">{material.materialType}</div>
                                    <div className="text-xs text-gray-500">
                                      Qty: {material.quantity} | ₹{(material.amount || material.totalAmount || 0).toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                                {getProjectMaterials(user._id, user.selectedProjectId).length === 0 && (
                                  <div className="text-sm text-gray-500 italic">No materials for this project</div>
                                )}
                              </div>
                            ) : (
                              user.projectMaterials && user.projectMaterials.length > 0 ? (
                                <div className="space-y-1">
                                  {user.projectMaterials.slice(0, 4).map((material, idx) => (
                                    <div key={idx} className="text-sm">
                                      <div className="font-medium text-gray-800">{material.materialType}</div>
                                      <div className="text-xs text-gray-500">
                                        Qty: {material.quantity} | ₹{(material.amount || material.totalAmount || 0).toFixed(2)}
                                      </div>
                                    </div>
                                  ))}
                                  {user.projectMaterials.length > 4 && (
                                    <div className="text-xs text-gray-500">
                                      +{user.projectMaterials.length - 4} more materials
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 italic">No materials</div>
                              )
                            )
                          )}
                        </TableCell>

                        {/* Supply Value Column */}
                        <TableCell className="text-right">
                          {user.selectedProjectId ? (
                            <div className="text-sm font-medium text-blue-700">
                              ₹{getProjectMaterials(user._id, user.selectedProjectId)
                                .reduce((sum: number, m: any) => sum + (m.amount || 0), 0).toFixed(2)}
                              <div className="text-xs text-gray-500">Selected Project</div>
                            </div>
                          ) : (
                            <div className="text-sm font-medium">
                              {(() => {
                                const supply = (user.totalSupplyValue || (user.projectMaterials?.reduce((sum: number, m: any) => sum + (m.amount || m.totalAmount || 0), 0) || 0))
                                return formatCurrency(supply)
                              })()}
                              <div className="text-xs text-gray-500">All Projects</div>
                            </div>
                          )}
                        </TableCell>
                      </>
                    ) : (
                      <TableCell className="text-right">
                        {editingId === user._id && editForm ? (
                          <Input
                            type="number"
                            value={
                              user.role === "client"
                                ? editForm.projectTotalAmount || ""
                                : editForm.salary || ""
                            }
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const field = user.role === "client" ? "projectTotalAmount" : "salary"
                              handleInputChange(field, Number(e.target.value))
                            }}
                            className="w-24"
                          />
                        ) : (
                          formatCurrency(getAmountForRole(user))
                        )}
                      </TableCell>
                    )}
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
                      ) : (
                        // For suppliers with selected projects, calculate project-specific due amount
                        selectedRole === "supplier" && user.selectedProjectId ? (
                          (() => {
                            const projectMaterials = getProjectMaterials(user._id, user.selectedProjectId)
                            const projectTotal = projectMaterials.reduce((sum, m) => sum + (m.amount || m.totalAmount || 0), 0)
                            const projectDue = Math.max(0, projectTotal - (user.totalPaid || 0))
                            return projectDue > 0 ? (
                              <span className="text-red-600">{formatCurrency(projectDue)}</span>
                            ) : (
                              <span className="text-green-600">Paid</span>
                            )
                          })()
                        ) : (
                          user.dueAmount > 0 ? (
                            <span className="text-red-600">{formatCurrency(user.dueAmount)}</span>
                          ) : (
                            <span className="text-green-600">Paid</span>
                          )
                        )
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
                  <TableCell colSpan={selectedRole === "supplier" ? 12 : 9} className="h-24 text-center">
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
