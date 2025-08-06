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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
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
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Search, Filter, CreditCard, Grid3X3, List, RefreshCw, Building2, CheckCircle, XCircle, Package, UserCheck, Calendar, DollarSign } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface ProjectMaterial {
  projectId: string
  materialType: string
  quantity: number
  amount: number
}

interface Supplier {
  _id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  materialTypes: string[]
  supplyStartDate?: string
  paymentType: "Cash" | "Credit"
  address: string
  status: "Active" | "Inactive"
  avatar?: string
  username?: string
  password?: string
  projectMaterials?: ProjectMaterial[]
  createdAt: string
  updatedAt: string
}

interface Transaction {
  id: string
  date: string
  type: "Order" | "Payment" | "Delivery"
  amount: number
  status: "Pending" | "Completed" | "Cancelled"
  reference: string
  description?: string
}

interface ProjectMaterialLocal {
  materialType: string
  quantity: number
  amount: number
}

const initialFormData = {
  companyName: "",
  contactPerson: "",
  email: "",
  username: "",
  password: "",
  phone: "",
  materialTypes: [] as string[],
  supplyStartDate: undefined as Date | undefined,
  paymentType: "Credit" as "Cash" | "Credit",
  address: "",
  status: "Active" as "Active" | "Inactive",
  avatar: "",
}

export default function SuppliersManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [materialOptions, setMaterialOptions] = useState([
    { value: "Cement", label: "Cement" },
    { value: "Sand", label: "Sand" },
    { value: "Gravel / Aggregate", label: "Gravel / Aggregate" },
    { value: "Bricks", label: "Bricks" },
    { value: "Steel Rods / TMT Bars", label: "Steel Rods / TMT Bars" },
    { value: "Concrete Mix", label: "Concrete Mix" },
    { value: "Wood / Timber", label: "Wood / Timber" },
    { value: "Paint", label: "Paint" },
  ])
  const [materialInputValue, setMaterialInputValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState(initialFormData)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [projectMaterials, setProjectMaterials] = useState<Record<string, ProjectMaterialLocal[]>>({})
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [selectedProjectForMaterial, setSelectedProjectForMaterial] = useState<string>("")
  
  // Separate state for each project's material input
  const [projectMaterialInputs, setProjectMaterialInputs] = useState<Record<string, {
    materialType: string;
    quantity: string;
    amount: string;
  }>>({})
  
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers", { cache: "no-store" })
      if (!response.ok) throw new Error("Failed to fetch suppliers")
      const data = await response.json()
      
      // Convert projectMaterials array to our state format
      const formattedData = data.map((supplier: any) => {
        const projectMaterialsObj: Record<string, ProjectMaterialLocal[]> = {}
        
        if (supplier.projectMaterials && Array.isArray(supplier.projectMaterials)) {
          supplier.projectMaterials.forEach((pm: any) => {
            if (!projectMaterialsObj[pm.projectId]) {
              projectMaterialsObj[pm.projectId] = []
            }
            projectMaterialsObj[pm.projectId].push({
              materialType: pm.materialType,
              quantity: Number(pm.quantity) || 0,
              amount: Number(pm.amount) || 0
            })
          })
        }
        
        return {
          ...supplier,
          projectMaterials: projectMaterialsObj
        }
      })
      
      setSuppliers(formattedData)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast.error("Failed to load suppliers. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMaterialSelect = (material: string) => {
    setFormData((prev) => {
      const newMaterials = prev.materialTypes.includes(material)
        ? prev.materialTypes.filter((m) => m !== material)
        : [...prev.materialTypes, material]
      return { ...prev, materialTypes: newMaterials }
    })
  }

  const handleMaterialCreate = () => {
    if (materialInputValue && !materialOptions.some((option) => option.value === materialInputValue)) {
      const newOption = { value: materialInputValue, label: materialInputValue }
      setMaterialOptions([...materialOptions, newOption])
      setFormData((prev) => ({
        ...prev,
        materialTypes: [...prev.materialTypes, newOption.value],
      }))
      setMaterialInputValue("")
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingSupplier(null)
    setProjectMaterials({})
    setSelectedProjectForMaterial("")
    setProjectMaterialInputs({})
  }

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      ...supplier,
      supplyStartDate: supplier.supplyStartDate ? new Date(supplier.supplyStartDate) : undefined,
      avatar: supplier.avatar ?? "",
      username: supplier.username ?? "",
      password: "", // Don't pre-fill password for security
    })
    
    // Initialize project materials if they exist
    if (supplier.projectMaterials && supplier.projectMaterials.length > 0) {
      const materialsByProject = supplier.projectMaterials.reduce((acc, curr) => {
        if (!acc[curr.projectId]) {
          acc[curr.projectId] = [];
        }
        acc[curr.projectId].push({
          materialType: curr.materialType,
          quantity: Number(curr.quantity) || 0,
          amount: Number(curr.amount) || 0
        });
        return acc;
      }, {} as Record<string, ProjectMaterialLocal[]>);
      setProjectMaterials(materialsByProject);
    } else {
      setProjectMaterials({})
    }
    
    setIsAddDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingSupplier ? `/api/suppliers/${editingSupplier._id}` : "/api/suppliers"
      const method = editingSupplier ? "PUT" : "POST"
      
      // Convert projectMaterials to array format for the API
      const projectMaterialsArray = Object.entries(projectMaterials).flatMap(([projectId, materials]) =>
        materials.map(material => ({
          projectId,
          materialType: material.materialType,
          quantity: Number(material.quantity) || 0,
          amount: Number(material.amount) || 0
        }))
      )

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          supplyStartDate: formData.supplyStartDate?.toISOString(),
          projectMaterials: projectMaterialsArray
        }),
      })
      
      if (response.ok) {
        await fetchSuppliers()
        setIsAddDialogOpen(false)
        setEditingSupplier(null)
        resetForm()
        toast.success(`${formData.companyName} has been ${editingSupplier ? "updated" : "added"} successfully.`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save supplier")
      }
    } catch (error) {
      console.error("Error saving supplier:", error)
      toast.error("Failed to save supplier. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/suppliers/${id}`, { method: "DELETE" })
      if (response.ok) {
        setSuppliers(suppliers.filter((s) => s._id !== id))
        toast.success("Supplier has been removed successfully.")
      } else {
        throw new Error("Failed to delete supplier")
      }
    } catch (error) {
      console.error("Error deleting supplier:", error)
      toast.error("Failed to delete supplier. Please try again.")
    }
  }

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDetailSheetOpen(true)
    fetchSupplierTransactions(supplier._id)
  }

  const fetchProjects = async () => {
    setIsLoadingProjects(true)
    try {
      const response = await fetch("/api/projects")
      if (!response.ok) throw new Error("Failed to fetch projects")
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects")
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectForMaterial(projectId);
    if (!projectMaterials[projectId]) {
      setProjectMaterials((prev) => ({
        ...prev,
        [projectId]: [],
      }));
    }
    
    // Initialize input state for this project if it doesn't exist
    if (!projectMaterialInputs[projectId]) {
      setProjectMaterialInputs(prev => ({
        ...prev,
        [projectId]: {
          materialType: "",
          quantity: "1",
          amount: "0"
        }
      }));
    }
  }

  // Update project material input
  const updateProjectMaterialInput = (projectId: string, field: string, value: string) => {
    setProjectMaterialInputs(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [field]: value
      }
    }));
  }

  const addMaterialToProject = async (projectId: string) => {
    const input = projectMaterialInputs[projectId];
    if (!input) {
      toast.error("No input data found for this project");
      return;
    }

    const materialType = input.materialType;
    const quantity = Number(input.quantity);
    const amount = Number(input.amount);

    // Enhanced validation with detailed error messages
    if (!materialType) {
      toast.error("Please select a material type");
      return;
    }
    
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity (greater than 0)");
      return;
    }
    
    if (amount < 0) {
      toast.error("Amount cannot be negative");
      return;
    }
    
    if (!selectedSupplier?._id) {
      toast.error("No supplier selected");
      return;
    }

    // Check if material already exists for this project
    const existingMaterials = projectMaterials[projectId] || [];
    if (existingMaterials.some(m => m.materialType === materialType)) {
      toast.error("This material is already added to this project");
      return;
    }

    console.log("Adding material to project:", {
      projectId,
      materialType,
      quantity,
      amount,
      supplierId: selectedSupplier._id
    });

    setIsSaving(true);
    try {
      const response = await fetch(`/api/suppliers/${selectedSupplier._id}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          materialType,
          quantity,
          amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save material');
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Update local state immediately with the new material
      const newMaterial = {
        materialType,
        quantity,
        amount
      };

      setProjectMaterials(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newMaterial]
      }));

      // Update the selected supplier's project materials
      if (selectedSupplier) {
        const updatedProjectMaterials = [...(selectedSupplier.projectMaterials || [])];
        updatedProjectMaterials.push({
          projectId,
          materialType,
          quantity,
          amount
        });
        
        setSelectedSupplier({
          ...selectedSupplier,
          projectMaterials: updatedProjectMaterials
        });
      }

      // Reset the input for this project
      setProjectMaterialInputs(prev => ({
        ...prev,
        [projectId]: {
          materialType: "",
          quantity: "1",
          amount: "0"
        }
      }));

      toast.success(`Added ${materialType} to project (Qty: ${quantity}, Amount: $${amount})`);
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error(`Failed to save material: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }

  const updateMaterialQuantityAndAmount = async (projectId: string, materialType: string, newQuantity: number, newAmount: number) => {
    if (newQuantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    
    if (newAmount < 0) {
      toast.error("Amount cannot be negative");
      return;
    }

    if (!selectedSupplier?._id) {
      toast.error("No supplier selected");
      return;
    }

    console.log("Updating material:", {
      projectId,
      materialType,
      newQuantity,
      newAmount,
      supplierId: selectedSupplier._id
    });

    setIsSaving(true);
    try {
      // First remove the existing material
      await fetch(`/api/suppliers/${selectedSupplier._id}/materials`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          materialType
        })
      });

      // Then add it back with the new quantity and amount
      const response = await fetch(`/api/suppliers/${selectedSupplier._id}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          materialType,
          quantity: newQuantity,
          amount: newAmount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update material');
      }

      // Update local state immediately
      setProjectMaterials(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map(material =>
          material.materialType === materialType
            ? { ...material, quantity: newQuantity, amount: newAmount }
            : material
        )
      }));

      // Update the selected supplier's project materials
      if (selectedSupplier) {
        const updatedProjectMaterials = (selectedSupplier.projectMaterials || []).map(pm =>
          pm.projectId === projectId && pm.materialType === materialType
            ? { ...pm, quantity: newQuantity, amount: newAmount }
            : pm
        );
        
        setSelectedSupplier({
          ...selectedSupplier,
          projectMaterials: updatedProjectMaterials
        });
      }

      toast.success(`Updated ${materialType} (Qty: ${newQuantity}, Amount: $${newAmount})`);
    } catch (error) {
      console.error('Error updating material:', error);
      toast.error(`Failed to update material: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }

  const removeMaterialFromProject = async (projectId: string, materialType: string) => {
    if (!selectedSupplier?._id) {
      toast.error("No supplier selected");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/suppliers/${selectedSupplier._id}/materials`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          materialType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove material');
      }

      // Update local state immediately
      setProjectMaterials(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).filter(m => m.materialType !== materialType)
      }));

      // Update the selected supplier's project materials
      if (selectedSupplier) {
        const updatedProjectMaterials = (selectedSupplier.projectMaterials || []).filter(pm =>
          !(pm.projectId === projectId && pm.materialType === materialType)
        );
        
        setSelectedSupplier({
          ...selectedSupplier,
          projectMaterials: updatedProjectMaterials
        });
      }

      toast.success(`Removed ${materialType} from project`);
    } catch (error) {
      console.error('Error removing material:', error);
      toast.error(`Failed to remove material: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }

  const removeProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!selectedSupplier?._id) {
      toast.error("No supplier selected");
      return;
    }

    setIsSaving(true);
    try {
      // Get all materials for this project to remove them
      const projectMaterialsToRemove = projectMaterials[projectId] || [];
      
      // Remove each material for this project
      await Promise.all(
        projectMaterialsToRemove.map(material =>
          fetch(`/api/suppliers/${selectedSupplier._id}/materials`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId,
              materialType: material.materialType
            })
          })
        )
      );
      
      // Update local state
      setProjectMaterials(prev => {
        const newProjectMaterials = { ...prev };
        delete newProjectMaterials[projectId];
        return newProjectMaterials;
      });

      // Remove project input state
      setProjectMaterialInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[projectId];
        return newInputs;
      });
      
      // Update the selected supplier's project materials
      if (selectedSupplier) {
        const updatedProjectMaterials = (selectedSupplier.projectMaterials || []).filter(pm =>
          pm.projectId !== projectId
        );
        
        setSelectedSupplier({
          ...selectedSupplier,
          projectMaterials: updatedProjectMaterials
        });
      }
      
      toast.success("Removed project assignment and all associated materials");
    } catch (error) {
      console.error('Error removing project:', error);
      toast.error(`Failed to remove project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }

  const fetchSupplierTransactions = async (supplierId: string) => {
    setIsLoadingTransactions(true);
    try {
      // Fetch projects when opening the detail view
      await fetchProjects();
      
      // Reset project materials for this supplier
      setProjectMaterials({});
      setProjectMaterialInputs({});
      
      // Fetch project materials for this supplier
      const materialsResponse = await fetch(`/api/suppliers/${supplierId}/materials`);
      if (materialsResponse.ok) {
        const materialsData = await materialsResponse.json();
        console.log("Fetched materials data:", materialsData);
        
        // Group materials by projectId
        const groupedMaterials = materialsData.reduce((acc: any, material: any) => {
          if (!acc[material.projectId]) {
            acc[material.projectId] = [];
          }
          acc[material.projectId].push({
            materialType: material.materialType,
            quantity: Number(material.quantity) || 0,
            amount: Number(material.amount) || 0
          });
          return acc;
        }, {});
        
        console.log("Grouped materials:", groupedMaterials);
        setProjectMaterials(groupedMaterials);

        // Initialize input states for existing projects
        const inputStates: Record<string, { materialType: string; quantity: string; amount: string }> = {};
        Object.keys(groupedMaterials).forEach(projectId => {
          inputStates[projectId] = {
            materialType: "",
            quantity: "1",
            amount: "0"
          };
        });
        setProjectMaterialInputs(inputStates);
      }

      // Mock transactions data (replace with actual API call when available)
      const mockTransactions: Transaction[] = [
        {
          id: "1",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: "Payment",
          amount: 12500,
          status: "Completed",
          reference: "PAY-2023-001",
          description: "Payment for cement delivery",
        },
        {
          id: "2",
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          type: "Order",
          amount: 18750,
          status: "Completed",
          reference: "ORD-2023-045",
          description: "Bulk cement order",
        },
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error("Error loading supplier data:", error);
      toast.error("Failed to load supplier data");
    } finally {
      setIsLoadingTransactions(false);
    }
  }

  const filteredSuppliers = suppliers.filter((supplier: Supplier) => {
    const matchesSearch =
      supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.materialTypes.join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || supplier.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate statistics
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter((supplier) => supplier.status === "Active").length
  const inactiveSuppliers = suppliers.filter((supplier) => supplier.status === "Inactive").length
  const creditSuppliers = suppliers.filter((supplier) => supplier.paymentType === "Credit").length

  if (loading && suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading suppliers...</p>
        </div>
      </div>
    )
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSuppliers.map((supplier) => (
        <Card
          key={supplier._id}
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleSupplierClick(supplier)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={supplier.avatar || `https://avatar.vercel.sh/${supplier.email}.png`}
                    alt={supplier.companyName}
                  />
                  <AvatarFallback>
                    {supplier.companyName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{supplier.companyName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(supplier.status)} variant="secondary">
                      {supplier.status === "Active" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {supplier.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <Badge
                className={
                  supplier.paymentType === "Credit" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                }
              >
                {supplier.paymentType}
              </Badge>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <span>{supplier.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{supplier.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span>Payment: {supplier.paymentType}</span>
              </div>
              {supplier.supplyStartDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Started: {new Date(supplier.supplyStartDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            {supplier.materialTypes && supplier.materialTypes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Materials:</p>
                <div className="flex flex-wrap gap-1">
                  {supplier.materialTypes.slice(0, 3).map((material, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                  {supplier.materialTypes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{supplier.materialTypes.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => openEditDialog(supplier)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {supplier.companyName}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(supplier._id)}>Delete</AlertDialogAction>
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
              <TableHead>Company</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Payment Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow
                key={supplier._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSupplierClick(supplier)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={supplier.avatar || `https://avatar.vercel.sh/${supplier.email}.png`}
                        alt={supplier.companyName}
                      />
                      <AvatarFallback>
                        {supplier.companyName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{supplier.companyName}</div>
                      <div className="text-sm text-muted-foreground">{supplier.address}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{supplier.contactPerson}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      supplier.paymentType === "Credit" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                    }
                  >
                    {supplier.paymentType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(supplier.status)}>{supplier.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {supplier.materialTypes.slice(0, 2).map((material) => (
                      <Badge key={material} variant="outline" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                    {supplier.materialTypes.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{supplier.materialTypes.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{supplier.phone}</div>
                    <div className="text-muted-foreground">{supplier.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(supplier)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {supplier.companyName}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(supplier._id)}>Delete</AlertDialogAction>
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
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">Registered suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Suppliers</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveSuppliers}</div>
            <p className="text-xs text-muted-foreground">Currently inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Suppliers</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{creditSuppliers}</div>
            <p className="text-xs text-muted-foreground">Credit payment terms</p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Suppliers Management</h2>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setLoading(true)
              fetchSuppliers()
            }}
            className="ml-2"
            disabled={loading}
            title="Refresh suppliers"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 00-10 10h4z"
                ></path>
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
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
              <DialogDescription>
                {editingSupplier ? "Update supplier information" : "Create a new supplier record"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleFormChange("companyName", e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleFormChange("contactPerson", e.target.value)}
                    placeholder="Enter contact person name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleFormChange("username", e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleFormChange("password", e.target.value)}
                    placeholder="Enter password"
                    required={!editingSupplier}
                  />
                  {editingSupplier && (
                    <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Material Types *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between bg-transparent">
                      {formData.materialTypes.length > 0
                        ? `${formData.materialTypes.length} materials selected`
                        : "Select materials..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search or create..."
                        value={materialInputValue}
                        onValueChange={setMaterialInputValue}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleMaterialCreate()
                          }
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <Button variant="outline" size="sm" onClick={handleMaterialCreate}>
                            Add: {materialInputValue}
                          </Button>
                        </CommandEmpty>
                        <CommandGroup>
                          {materialOptions.map((material) => (
                            <CommandItem key={material.value} onSelect={() => handleMaterialSelect(material.value)}>
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.materialTypes.includes(material.value) ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {material.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentType">Payment Type *</Label>
                  <select
                    id="paymentType"
                    value={formData.paymentType}
                    onChange={(e) => handleFormChange("paymentType", e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="Credit">Credit</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Supply Start Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.supplyStartDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.supplyStartDate ? format(formData.supplyStartDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.supplyStartDate}
                        onSelect={(date) => handleFormChange("supplyStartDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {editingSupplier && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  placeholder="Enter company address"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingSupplier(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingSupplier ? "Update Supplier" : "Create Supplier"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search suppliers..."
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
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <Badge variant="secondary" className="self-center">
            {filteredSuppliers.length} Total
          </Badge>
        </div>
        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8 px-3"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 px-3"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Suppliers Display */}
      {viewMode === "grid" ? renderGridView() : renderListView()}

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No suppliers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "All"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first supplier"}
          </p>
          {!searchTerm && statusFilter === "All" && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Supplier
            </Button>
          )}
        </div>
      )}

      {/* Supplier Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-none flex flex-col">
          {selectedSupplier && (
            <div className="flex flex-col h-full">
              <SheetHeader className="shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedSupplier.avatar || `https://avatar.vercel.sh/${selectedSupplier.email}.png`}
                      alt={selectedSupplier.companyName}
                    />
                    <AvatarFallback className="text-xl">
                      {selectedSupplier.companyName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <SheetTitle className="text-2xl">{selectedSupplier.companyName}</SheetTitle>
                    <p className="text-muted-foreground">{selectedSupplier.contactPerson}</p>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedSupplier.status)} variant="secondary">
                        {selectedSupplier.status === "Active" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {selectedSupplier.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      openEditDialog(selectedSupplier)
                      setIsDetailSheetOpen(false)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </SheetHeader>
              <Tabs defaultValue="overview" className="mt-6 flex flex-col h-[calc(100%-100px)]">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="transactions">Sites</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="flex-1 overflow-y-auto pr-2 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">Payment Type</p>
                            <p className="text-xs text-muted-foreground">{selectedSupplier.paymentType}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Supply Started</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedSupplier.supplyStartDate
                                ? format(new Date(selectedSupplier.supplyStartDate), "MMM yyyy")
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Company Information */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{selectedSupplier.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">{selectedSupplier.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Address</p>
                            <p className="text-sm text-muted-foreground">{selectedSupplier.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <UserCheck className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Contact Person</p>
                            <p className="text-sm text-muted-foreground">{selectedSupplier.contactPerson}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Registered</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(selectedSupplier.createdAt), "PPP")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="transactions" className="flex-1 overflow-y-auto pr-2 space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Site Assignment & Material Tracking</h4>
                    <div className="space-y-4">
                      {/* Add New Project */}
                      <div className="space-y-2">
                        <Label htmlFor="project-select" className="block text-sm font-medium mb-2">
                          Add New Site
                        </Label>
                        <Select onValueChange={handleProjectSelect} value="" disabled={isLoadingProjects}>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={isLoadingProjects ? "Loading projects..." : "Select a site to add"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {projects
                              .filter((project) => !projectMaterials[project._id])
                              .map((project) => (
                                <SelectItem key={project._id} value={project._id}>
                                  {project.title}
                                </SelectItem>
                              ))}
                            {!isLoadingProjects && projects.length === Object.keys(projectMaterials).length && (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">No more sites available</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Project Materials List */}
                      {Object.keys(projectMaterials).length > 0 && (
                        <div className="space-y-4 mt-6">
                          <div className="space-y-4">
                            {Object.entries(projectMaterials).map(([projectId, materials]) => {
                              const project = projects.find((p) => p._id === projectId)
                              const currentInput = projectMaterialInputs[projectId] || { materialType: "", quantity: "1", amount: "0" }
                              if (!project) return null
                              return (
                                <Card key={projectId} className="border-l-4 border-l-blue-500">
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <h6 className="font-medium text-lg">{project.title}</h6>
                                        {project.description && (
                                          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                          <Calendar className="w-4 h-4 flex-shrink-0" />
                                          <span>
                                            {format(new Date(project.startDate || new Date()), "MMM d, yyyy")}
                                            {" - "}
                                            {project.endDate
                                              ? format(new Date(project.endDate), "MMM d, yyyy")
                                              : "Present"}
                                          </span>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => removeProject(projectId, e)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        disabled={isSaving}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    {/* Add Material to Project */}
                                    <div className="border-t pt-3 mt-3">
                                      <div className="space-y-3 mb-3">
                                        <div className="text-sm font-medium text-muted-foreground">Add New Material:</div>
                                        <div className="grid grid-cols-12 gap-2">
                                          <div className="col-span-5">
                                            <Select
                                              value={currentInput.materialType}
                                              onValueChange={(value) => updateProjectMaterialInput(projectId, "materialType", value)}
                                            >
                                              <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select material" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {selectedSupplier.materialTypes
                                                  .filter((material) => !materials.some((m) => m.materialType === material))
                                                  .map((material) => (
                                                    <SelectItem key={material} value={material}>
                                                      {material}
                                                    </SelectItem>
                                                  ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="col-span-2">
                                            <Input
                                              type="number"
                                              placeholder="Qty"
                                              min="1"
                                              value={currentInput.quantity}
                                              onChange={(e) => updateProjectMaterialInput(projectId, "quantity", e.target.value)}
                                              className="text-center"
                                            />
                                          </div>
                                          <div className="col-span-3">
                                            <div className="relative">
                                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                              <Input
                                                type="number"
                                                placeholder="Amount"
                                                min="0"
                                                step="0.01"
                                                value={currentInput.amount}
                                                onChange={(e) => updateProjectMaterialInput(projectId, "amount", e.target.value)}
                                                className="pl-8 text-center"
                                              />
                                            </div>
                                          </div>
                                          <div className="col-span-2">
                                            <Button
                                              size="sm"
                                              onClick={() => addMaterialToProject(projectId)}
                                              disabled={
                                                !currentInput.materialType ||
                                                !currentInput.quantity ||
                                                Number(currentInput.quantity) <= 0 ||
                                                Number(currentInput.amount) < 0 ||
                                                isSaving
                                              }
                                              className="w-full"
                                            >
                                              {isSaving ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <Plus className="w-4 h-4" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                        {/* Validation Messages */}
                                        <div className="text-xs text-muted-foreground">
                                          <div className="flex items-center gap-4">
                                            <span className={currentInput.materialType ? "text-green-600" : "text-red-600"}>
                                              • Material: {currentInput.materialType ? "✓" : "Required"}
                                            </span>
                                            <span className={Number(currentInput.quantity) > 0 ? "text-green-600" : "text-red-600"}>
                                              • Quantity: {Number(currentInput.quantity) > 0 ? "✓" : "Must be > 0"}
                                            </span>
                                            <span className={Number(currentInput.amount) >= 0 ? "text-green-600" : "text-red-600"}>
                                              • Amount: {Number(currentInput.amount) >= 0 ? "✓" : "Cannot be negative"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      {/* Materials List for this Project */}
                                      {materials.length > 0 ? (
                                        <div className="space-y-2">
                                          <p className="text-sm font-medium text-muted-foreground">
                                            Assigned Materials:
                                          </p>
                                          {materials.map((material, index) => (
                                            <div
                                              key={index}
                                              className="flex items-center justify-between bg-muted/20 p-3 rounded border"
                                            >
                                              <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-blue-600" />
                                                <span className="font-medium">{material.materialType}</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                  <span className="text-xs text-muted-foreground">Qty:</span>
                                                  <Input
                                                    type="number"
                                                    min="1"
                                                    value={material.quantity}
                                                    onChange={(e) => {
                                                      const newQuantity = Number.parseInt(e.target.value) || 0
                                                      if (newQuantity > 0) {
                                                        updateMaterialQuantityAndAmount(
                                                          projectId,
                                                          material.materialType,
                                                          newQuantity,
                                                          material.amount
                                                        )
                                                      }
                                                    }}
                                                    className="w-16 h-8 text-center"
                                                    disabled={isSaving}
                                                  />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                                                  <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={material.amount}
                                                    onChange={(e) => {
                                                      const newAmount = Number.parseFloat(e.target.value) || 0
                                                      if (newAmount >= 0) {
                                                        updateMaterialQuantityAndAmount(
                                                          projectId,
                                                          material.materialType,
                                                          material.quantity,
                                                          newAmount
                                                        )
                                                      }
                                                    }}
                                                    className="w-20 h-8 text-center"
                                                    disabled={isSaving}
                                                  />
                                                </div>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() =>
                                                    removeMaterialFromProject(projectId, material.materialType)
                                                  }
                                                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                                  disabled={isSaving}
                                                >
                                                  <X className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                          <div className="text-xs text-muted-foreground mt-2 p-2 bg-blue-50 rounded">
                                            <strong>Total for this project:</strong> {materials.length} materials, 
                                            Total Amount: ${materials.reduce((sum, m) => sum + m.amount, 0).toFixed(2)}
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground italic">
                                          No materials assigned yet. Use the form above to add materials.
                                        </p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      {Object.keys(projectMaterials).length === 0 && (
                        <div className="text-center py-8 border rounded-lg bg-muted/10">
                          <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                          <h4 className="font-medium mb-1">No Sites Assigned</h4>
                          <p className="text-sm text-muted-foreground">
                            Select a site above to start assigning materials, quantities, and amounts.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="materials" className="flex-1 overflow-y-auto pr-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Available Materials</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent"
                      onClick={() => {
                        openEditDialog(selectedSupplier)
                        setIsDetailSheetOpen(false)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Materials
                    </Button>
                  </div>
                  {selectedSupplier.materialTypes.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSupplier.materialTypes.map((material, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-blue-100">
                                <Package className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{material}</h4>
                                <p className="text-sm text-muted-foreground">Available for supply</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-lg bg-muted/10">
                      <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <h4 className="font-medium mb-1">No Materials Listed</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        This supplier doesn't have any materials specified yet.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          openEditDialog(selectedSupplier)
                          setIsDetailSheetOpen(false)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Add Materials
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
