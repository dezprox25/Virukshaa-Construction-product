"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Supplier {
  _id: string;
  name: string;
  // Add other supplier fields if needed
}
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import {
  Package,
  Plus,
  Edit,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ShoppingCart,
  Truck,
  Clock,
  CheckCircle,
} from "lucide-react"

interface Material {
  _id: string
  name: string
  category: string
  unit: string
  currentStock: number
  reorderLevel: number
  pricePerUnit: number
  supplier: string
  lastUpdated: string
  status: "In Stock" | "Low Stock" | "Out of Stock" | "On Order"
}

interface MaterialRequest {
  _id: string
  material: string
  materialName: string
  quantity: number
  unit: string
  requestDate: string
  requiredDate: string
  status: "Pending" | "Approved" | "Ordered" | "Delivered" | "Rejected"
  notes?: string
  requestedBy: string
  supervisor?: string
  createdAt: string
  updatedAt: string
}

export default function MaterialsManagement() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [requests, setRequests] = useState<MaterialRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [activeTab, setActiveTab] = useState<"inventory" | "requests">("inventory")
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false)
  
  const [inventoryData, setInventoryData] = useState<{
    name: string;
    category: string;
    unit: string;
    currentStock: number;
    reorderLevel: number;
    pricePerUnit: number;
    supplier: string;
    status: "In Stock" | "Low Stock" | "Out of Stock" | "On Order";
  }>({
    name: "",
    category: "",
    unit: "",
    currentStock: 0,
    reorderLevel: 0,
    pricePerUnit: 0,
    supplier: "",
    status: "In Stock"
  })

  const [requestData, setRequestData] = useState({
    materialId: "",
    materialName: "",
    quantity: 0,
    unit: "",
    requiredDate: "",
    supplierId: "",
    notes: "",
  })

  const categories = ["Cement", "Steel", "Masonry", "Concrete", "Electrical", "Plumbing", "Tools", "Safety"]


  // const fetchSuppliers = async () => {
  //   try {
  //     const response = await fetch('/api/suppliers')
  //     if (!response.ok) throw new Error('Failed to fetch suppliers')
  //     const data = await response.json()
  //     setSuppliers(data)
  //   } catch (error) {
  //     console.error("Error fetching suppliers:", error)
  //     throw error
  //   }
  // }

  const fetchSuppliers = async () => {
    try {
      setIsLoadingSuppliers(true)
      const response = await fetch('/api/suppliers')
      if (!response.ok) throw new Error('Failed to fetch suppliers')
      const data = await response.json()
      setSuppliers(data)
      return data
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      toast({
        title: "Error",
        description: "Failed to load suppliers. Please try again.",
        variant: "destructive",
      })
      return []
    } finally {
      setIsLoadingSuppliers(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        await Promise.all([
          fetchMaterials(),
          fetchRequests(),
          fetchSuppliers()
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchMaterials = async () => {
    try {
      // console.log('Fetching materials from:', '/api/materials')
      const response = await fetch('/api/materials')
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('Failed to fetch materials. Status:', response.status, 'Response:', errorData)
        throw new Error(`Failed to fetch materials: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      // console.log('Received materials data:', data)
      setMaterials(data)
      return data
    } catch (error) {
      console.error("Error in fetchMaterials:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load materials",
        variant: "destructive",
      })
      throw error
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/material-requests')
      if (!response.ok) throw new Error('Failed to fetch material requests')
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error("Error fetching requests:", error)
    }
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!requestData.materialId || !requestData.materialName || !requestData.unit) {
        throw new Error("Please fill in all required fields")
      }

      const isHardcodedMaterial = requestData.materialId.startsWith('hardcoded-');
      
      const response = await fetch('/api/material-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          material: isHardcodedMaterial ? requestData.materialName : requestData.materialId,
          materialName: requestData.materialName,
          quantity: requestData.quantity,
          unit: requestData.unit,
          requiredDate: new Date(requestData.requiredDate).toISOString(),
          notes: requestData.notes,
          status: 'Pending',
          requestedBy: 'Anonymous',
          email: 'anonymous@example.com'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit request')
      }

      const newRequest = await response.json()
      setRequests([newRequest, ...requests])
      setIsRequestDialogOpen(false)
      resetRequestForm()

      toast({
        title: "Request Submitted",
        description: `Material request for ${requestData.materialName} has been submitted successfully.`,
      })
    } catch (error) {
      console.error('Error submitting request:', error)
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",


        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetRequestForm = () => {
    setRequestData({
      materialId: "",
      materialName: "",
      quantity: 0,
      unit: "",
      requiredDate: "",
      supplierId: "",
      notes: "",
    })
  }

  const resetInventoryForm = () => {
    setInventoryData({
      name: "",
      category: "",
      unit: "",
      currentStock: 0,
      reorderLevel: 0,
      pricePerUnit: 0,
      supplier: "",
      status: "In Stock"
    })
    setEditingMaterial(null)
  }

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material)
    setInventoryData({
      name: material.name,
      category: material.category,
      unit: material.unit,
      currentStock: material.currentStock,
      reorderLevel: material.reorderLevel,
      pricePerUnit: material.pricePerUnit,
      supplier: material.supplier,
      status: material.status
    })
    setIsInventoryDialogOpen(true)
  }

  const handleSubmitInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingMaterial 
        ? `/api/materials/${editingMaterial._id}`
        : '/api/materials'
      
      const method = editingMaterial ? 'PUT' : 'POST'
      
      console.log('Submitting material data:', { url, method, data: inventoryData })
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryData),
      })

      // First, check if the response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        throw new Error('Server returned an invalid response. Please try again.')
      }

      const result = await response.json()
      
      if (!response.ok) {
        console.error('API error response:', result)
        throw new Error(result.message || 'Failed to save material')
      }

      console.log('API success response:', result)
      
      if (editingMaterial) {
        setMaterials(materials.map(m => 
          m._id === result._id ? { ...m, ...result } : m
        ))
      } else {
        setMaterials([result, ...materials])
      }

      setIsInventoryDialogOpen(false)
      resetInventoryForm()

      toast({
        title: "Success",
        description: `Material ${editingMaterial ? 'updated' : 'added'} successfully.`,
      })
    } catch (error) {
      console.error('Error saving material:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${editingMaterial ? 'update' : 'add'} material. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All" || material.category === categoryFilter
    const matchesStatus = statusFilter === "All" || material.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.materialName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
      case "Delivered":
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Low Stock":
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Out of Stock":
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "On Order":
      case "Ordered":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Stock":
      case "Delivered":
        return <CheckCircle className="w-4 h-4" />
      case "Low Stock":
      case "Pending":
        return <AlertTriangle className="w-4 h-4" />
      case "Out of Stock":
        return <TrendingDown className="w-4 h-4" />
      case "On Order":
      case "Ordered":
        return <Clock className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const inventoryStats = [
    {
      title: "Total Materials",
      value: materials.length.toString(),
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Low Stock Items",
      value: materials.filter((m) => m.status === "Low Stock").length.toString(),
      icon: AlertTriangle,
      color: "text-yellow-600",
    },
    {
      title: "Out of Stock",
      value: materials.filter((m) => m.status === "Out of Stock").length.toString(),
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "Total Value",
      value: `$${materials.reduce((sum, m) => sum + m.currentStock * m.pricePerUnit, 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-600",
    },
  ]

  const requestStats = [
    {
      title: "Total Requests",
      value: requests.length.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Pending Approval",
      value: requests.filter((r) => r.status === "Pending").length.toString(),
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "In Transit",
      value: requests.filter((r) => r.status === "Ordered").length.toString(),
      icon: Truck,
      color: "text-orange-600",
    },
    {
      title: "Delivered",
      value: requests.filter((r) => r.status === "Delivered").length.toString(),
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  if (loading && materials.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading materials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Materials Management</h2>
          <p className="text-muted-foreground">Manage inventory and material requests</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={activeTab === "inventory" ? "default" : "outline"} onClick={() => setActiveTab("inventory")}>
            <Package className="w-4 h-4 mr-2" />
            Inventory
          </Button>
          <Button variant={activeTab === "requests" ? "default" : "outline"} onClick={() => setActiveTab("requests")}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Requests
          </Button>
          
          {activeTab === "inventory" && (
            <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={() => {
                  resetInventoryForm()
                  setIsInventoryDialogOpen(true)
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingMaterial ? 'Edit' : 'Add New'} Material</DialogTitle>
                  <DialogDescription>
                    {editingMaterial 
                      ? 'Update the material details below.'
                      : 'Fill in the details to add a new material to inventory.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitInventory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="materialName">Material Name *</Label>
                      <Input
                        id="materialName"
                        value={inventoryData.name}
                        onChange={(e) => setInventoryData({...inventoryData, name: e.target.value})}
                        placeholder="e.g., Portland Cement"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        value={inventoryData.category}
                        onChange={(e) => setInventoryData({...inventoryData, category: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentStock">Current Stock *</Label>
                      <Input
                        id="currentStock"
                        type="number"
                        min="0"
                        value={inventoryData.currentStock}
                        onChange={(e) => setInventoryData({...inventoryData, currentStock: Number(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reorderLevel">Reorder Level *</Label>
                      <Input
                        id="reorderLevel"
                        type="number"
                        min="0"
                        value={inventoryData.reorderLevel}
                        onChange={(e) => setInventoryData({...inventoryData, reorderLevel: Number(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={inventoryData.unit || ''}
                        onChange={(e) => setInventoryData({...inventoryData, unit: e.target.value})}
                        placeholder="e.g., Bags, Pieces"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricePerUnit">Price per Unit *</Label>
                      <Input
                        id="pricePerUnit"
                        type="number"
                        min="0"
                        step="0.01"
                        value={inventoryData.pricePerUnit}
                        onChange={(e) => setInventoryData({...inventoryData, pricePerUnit: Number(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <select
                        id="status"
                        value={inventoryData.status}
                        onChange={(e) => setInventoryData({...inventoryData, status: e.target.value as any})}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="On Order">On Order</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <select
                      id="supplier"
                      value={inventoryData.supplier || ''}
                      onChange={(e) => setInventoryData({...inventoryData, supplier: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier.name}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    {isLoadingSuppliers && (
                      <p className="text-sm text-muted-foreground">Loading suppliers...</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsInventoryDialogOpen(false)
                        resetInventoryForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : editingMaterial ? "Update Material" : "Add Material"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
          
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetRequestForm}>
                <Plus className="w-4 h-4 mr-2" />
                Request Materials
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Materials</DialogTitle>
                <DialogDescription>Submit a request for materials needed for your project</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="materialInput">Material *</Label>
                    <div className="relative">
                      <Input
                        id="materialInput"
                        list="materialSuggestions"
                        value={requestData.materialName}
                        onChange={(e) => {
                          // Try to find in API-fetched materials first
                          const selectedMaterial = materials.find(
                            m => `${m.name} (${m.unit})` === e.target.value
                          );
                          
                          // If not found in API materials, check if it's a hardcoded material
                          if (!selectedMaterial) {
                            const hardcodedMatch = e.target.value.match(/(.+?)\s+\((.+?)\)/);
                            if (hardcodedMatch) {
                              const [, name, unit] = hardcodedMatch;
                              setRequestData({
                                ...requestData,
                                materialId: `hardcoded-${name.toLowerCase().replace(/\s+/g, '-')}`,
                                materialName: name.trim(),
                                unit: unit.trim()
                              });
                              return;
                            }
                          }
                          
                          // Handle API material or clear if not found
                          setRequestData({
                            ...requestData,
                            materialId: selectedMaterial?._id || '',
                            materialName: selectedMaterial?.name || e.target.value,
                            unit: selectedMaterial?.unit || ''
                          });
                        }}
                        placeholder="Type or select a material"
                        className="w-full"
                        required
                      />
                      <datalist id="materialSuggestions">
                        {materials.map((material) => (
                          <option 
                            key={material._id} 
                            value={`${material.name} (${material.unit})`}
                            data-unit={material.unit}
                          />
                        ))}
                        {/* Common construction materials suggestions */}
                        <option value="Portland Cement (Bags)" data-unit="Bags" />
                        <option value="Steel Rebar (Pieces)" data-unit="Pieces" />
                        <option value="Copper Wire (Meters)" data-unit="Meters" />
                        <option value="PVC Pipes (Meters)" data-unit="Meters" />
                        <option value="Bricks (Pieces)" data-unit="Pieces" />
                        <option value="Sand (Cubic Meters)" data-unit="Cubic Meters" />
                        <option value="Gravel (Cubic Meters)" data-unit="Cubic Meters" />
                        <option value="Plywood (Sheets)" data-unit="Sheets" />
                        <option value="TMT Steel Bars (Pieces)" data-unit="Pieces" />
                        <option value="Ceramic Tiles (Boxes)" data-unit="Boxes" />
                      </datalist>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={requestData.quantity}
                      onChange={(e) => setRequestData({ ...requestData, quantity: +e.target.value })}
                      placeholder="Enter quantity"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierId">Preferred Supplier (Optional)</Label>
                    <select
                      id="supplierId"
                      value={requestData.supplierId || ''}
                      onChange={(e) => setRequestData({ ...requestData, supplierId: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select Supplier (Optional)</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requiredDate">Required Date *</Label>
                    <Input
                      id="requiredDate"
                      type="date"
                      value={requestData.requiredDate}
                      onChange={(e) => setRequestData({ ...requestData, requiredDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={requestData.notes}
                    onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                    placeholder="Additional notes or special requirements..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsRequestDialogOpen(false)
                      resetRequestForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(activeTab === "inventory" ? inventoryStats : requestStats).map((stat) => (
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {activeTab === "inventory" && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="All">All Status</option>
            {activeTab === "inventory" ? (
              <>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="On Order">On Order</option>
              </>
            ) : (
              <>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Ordered">Ordered</option>
                <option value="Delivered">Delivered</option>
                <option value="Rejected">Rejected</option>
              </>
            )}
          </select>
        </div>
        <Badge variant="secondary" className="self-center">
          {activeTab === "inventory" ? filteredMaterials.length : filteredRequests.length} Items
        </Badge>
      </div>

      {/* Content */}
      {activeTab === "inventory" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{material.name}</h3>
                    <p className="text-sm text-muted-foreground">{material.category}</p>
                  </div>
                  <Badge className={getStatusColor(material.status)}>
                    {getStatusIcon(material.status)}
                    <span className="ml-1">{material.status}</span>
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Stock:</span>
                    <span className="text-sm">
                      {material.currentStock} {material.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Reorder Level:</span>
                    <span className="text-sm">
                      {material.reorderLevel} {material.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Price per {material.unit}:</span>
                    <span className="text-sm">${material.pricePerUnit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Supplier:</span>
                    <span className="text-sm">{material.supplier}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last Updated:</span>
                    <span className="text-sm">{new Date(material.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 bg-transparent"
                    onClick={() => handleEditMaterial(material)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update Stock
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setRequestData({
                        ...requestData,
                        materialId: material._id,
                        materialName: material.name,
                        unit: material.unit
                      })
                      setIsRequestDialogOpen(true)
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{request.materialName}</h3>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1">{request.status}</span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium">Quantity:</span>
                    <p className="text-sm">
                      {request.quantity} {request.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Requested:</span>
                    <p className="text-sm">{new Date(request.requestDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Required:</span>
                    <p className="text-sm">{new Date(request.requiredDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Supervisor:</span>
                    <p className="text-sm">{request.supervisor}</p>
                  </div>
                </div>

                {request.notes && (
                  <div className="mb-4">
                    <span className="text-sm font-medium">Notes:</span>
                    <p className="text-sm text-muted-foreground">{request.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Request
                  </Button>
                  {request.status === "Pending" && (
                    <Button size="sm" variant="destructive">
                      Cancel Request
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty States */}
      {activeTab === "inventory" && filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No materials found</h3>
          <p className="text-muted-foreground">
            {searchTerm || categoryFilter !== "All" || statusFilter !== "All"
              ? "Try adjusting your search or filter criteria"
              : "No materials in inventory"}
          </p>
        </div>
      )}

      {activeTab === "requests" && filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No requests found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "All"
              ? "Try adjusting your search or filter criteria"
              : "No material requests have been submitted"}
          </p>
          {!searchTerm && statusFilter === "All" && (
            <Button onClick={() => setIsRequestDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Submit First Request
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
