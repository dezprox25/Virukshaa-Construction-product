import { NextRequest, NextResponse } from "next/server"
import { Types } from 'mongoose'
import connectToDB from "@/lib/db"
import { Material, IMaterial, MaterialDocument } from "@/models/MaterialModel"
import Task from "@/models/Task"

// Temporary type until auth is set up
type Session = {
  user: {
    id: string
    name?: string
    email?: string
  }
}

// Define a clean response type that matches our API response
type MaterialResponse = {
  _id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  pricePerUnit: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order';
  description?: string;
  notes?: string;
  minOrderQuantity?: number;
  location?: string;
  barcode?: string;
  sku?: string;
  imageUrl?: string;
  tags?: string[];
  projectId?: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
};

// GET /api/materials
export async function GET(request: NextRequest) {
  try {
    console.log('Connecting to database...')
    await connectToDB()
    console.log('Successfully connected to database')
    
    // Optional supervisor filter: only return materials linked to projects
    // assigned to the given supervisor via tasks
    const url = new URL(request.url)
    const supervisorId = url.searchParams.get('supervisorId')

    let query: any = {}
    if (supervisorId) {
      // Find distinct projectIds from Tasks assigned to this supervisor
      const projectIds = await Task.distinct('projectId', { assignedTo: supervisorId, projectId: { $ne: null } })
      if (!projectIds || projectIds.length === 0) {
        return NextResponse.json([])
      }
      query = { projectId: { $in: projectIds } }
    }

    console.log('Fetching materials...')
    const materials = await Material.find(query).sort({ name: 1 }).lean().exec()
    console.log(`Found ${materials.length} materials`)
    
    if (!materials || !Array.isArray(materials)) {
      console.error('Unexpected materials data format:', materials)
      throw new Error('Invalid materials data received from database')
    }
    
    // Define a type that matches the shape of our MongoDB document with string IDs
    type MaterialDocument = {
      _id: Types.ObjectId;
      name: string;
      category: string;
      unit: string;
      currentStock: number;
      reorderLevel: number;
      pricePerUnit: number;
      status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order';
      description?: string;
      notes?: string;
      minOrderQuantity?: number;
      location?: string;
      barcode?: string;
      sku?: string;
      imageUrl?: string;
      tags?: string[];
      projectId?: Types.ObjectId;
      lastUpdated: Date;
      createdAt: Date;
      updatedAt: Date;
    };
    
    // Process the materials
    const materialDocs: MaterialDocument[] = materials.map((doc: any) => {
      if (!doc || !doc._id) {
        console.error('Invalid material document:', doc);
        throw new Error('Invalid material document received from database');
      }
      
      // Ensure _id is a valid ObjectId
      const materialId = doc._id instanceof Types.ObjectId 
        ? doc._id 
        : new Types.ObjectId(String(doc._id));
      
      // Create a new object with proper typing
      const materialDoc: Omit<MaterialDocument, keyof Document> & { _id: Types.ObjectId } = {
        ...doc,
        _id: materialId,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
        lastUpdated: new Date(doc.lastUpdated)
      };
      
      return materialDoc as unknown as MaterialDocument;
    });
    
    // Map to the response type
    const response: MaterialResponse[] = materialDocs.map((material) => {
      const responseMaterial: MaterialResponse = {
        _id: material._id.toString(),
        name: material.name,
        category: material.category,
        unit: material.unit,
        currentStock: material.currentStock,
        reorderLevel: material.reorderLevel,
        pricePerUnit: material.pricePerUnit,
        status: material.status as 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order',
        ...(material.projectId && { projectId: material.projectId.toString() }),
        lastUpdated: material.lastUpdated.toISOString(),
        createdAt: material.createdAt.toISOString(),
        updatedAt: material.updatedAt.toISOString(),
      };
    
      if (material.description) responseMaterial.description = material.description;
      if (material.notes) responseMaterial.notes = material.notes;
      if (material.minOrderQuantity) responseMaterial.minOrderQuantity = material.minOrderQuantity;
      if (material.location) responseMaterial.location = material.location;
      if (material.barcode) responseMaterial.barcode = material.barcode;
      if (material.sku) responseMaterial.sku = material.sku;
      if (material.imageUrl) responseMaterial.imageUrl = material.imageUrl;
      if (material.tags) responseMaterial.tags = material.tags;
    
      return responseMaterial;
    });
    
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { message: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}

// POST /api/materials
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields (form was reduced: accept minimal fields)
    if (!data.name) {
      return NextResponse.json(
        { message: 'Missing required fields: name' },
        { status: 400 }
      )
    }
    
    await connectToDB()
    
    // Set default values for optional fields
    const materialData = {
      name: data.name,
      // Provide sensible defaults when omitted by the client
      category: data.category || 'Tools',
      unit: data.unit || '',
      currentStock: data.currentStock || 0,
      reorderLevel: data.reorderLevel || 0,
      pricePerUnit: data.pricePerUnit || 0,
      supplier: data.supplier || '',
      status: data.status || 'In Stock',
      lastUpdated: new Date(),
      ...(data.projectId && Types.ObjectId.isValid(String(data.projectId)) && { projectId: new Types.ObjectId(String(data.projectId)) }),
      ...(data.description && { description: data.description }),
      ...(data.notes && { notes: data.notes }),
      ...(data.minOrderQuantity && { minOrderQuantity: data.minOrderQuantity }),
      ...(data.location && { location: data.location }),
      ...(data.barcode && { barcode: data.barcode }),
      ...(data.sku && { sku: data.sku }),
      ...(data.imageUrl && { imageUrl: data.imageUrl }),
      ...(data.tags && { tags: data.tags })
    }
    
    const material = new Material(materialData) as unknown as MaterialDocument;
    await material.save();
    
    const response: MaterialResponse = {
      _id: material._id.toString(),
      name: material.name,
      category: material.category,
      unit: material.unit,
      currentStock: material.currentStock,
      reorderLevel: material.reorderLevel,
      pricePerUnit: material.pricePerUnit,
      status: material.status as 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order',
      ...(material.projectId && { projectId: material.projectId.toString() }),
      lastUpdated: material.lastUpdated.toISOString(),
      createdAt: material.createdAt.toISOString(),
      updatedAt: material.updatedAt.toISOString(),
      ...(material.description && { description: material.description }),
      ...(material.notes && { notes: material.notes }),
      ...(material.minOrderQuantity && { minOrderQuantity: material.minOrderQuantity }),
      ...(material.location && { location: material.location }),
      ...(material.barcode && { barcode: material.barcode }),
      ...(material.sku && { sku: material.sku }),
      ...(material.imageUrl && { imageUrl: material.imageUrl }),
      ...(material.tags && material.tags.length > 0 && { tags: material.tags })
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating material:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create material'
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

// Handle PUT /api/materials/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const data = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { message: 'Material ID is required' },
        { status: 400 }
      )
    }
    
    await connectToDB()
    
    const updatedData: any = {
      ...data,
      lastUpdated: new Date()
    }
    if (data.projectId === null || data.projectId === '') {
      updatedData.projectId = undefined
    } else if (data.projectId && Types.ObjectId.isValid(String(data.projectId))) {
      updatedData.projectId = new Types.ObjectId(String(data.projectId))
    }
    
    const material = await Material.findByIdAndUpdate(id, updatedData, { new: true })
    
    if (!material) {
      return NextResponse.json(
        { message: 'Material not found' },
        { status: 404 }
      )
    }
    
    const response: MaterialResponse = {
      _id: material._id.toString(),
      name: material.name,
      category: material.category,
      unit: material.unit,
      currentStock: material.currentStock,
      reorderLevel: material.reorderLevel,
      pricePerUnit: material.pricePerUnit,
      status: material.status as 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order',
      lastUpdated: material.lastUpdated.toISOString(),
      createdAt: material.createdAt.toISOString(),
      updatedAt: material.updatedAt.toISOString(),
      ...(material.description && { description: material.description }),
      ...(material.notes && { notes: material.notes }),
      ...(material.minOrderQuantity && { minOrderQuantity: material.minOrderQuantity }),
      ...(material.location && { location: material.location }),
      ...(material.barcode && { barcode: material.barcode }),
      ...(material.sku && { sku: material.sku }),
      ...(material.imageUrl && { imageUrl: material.imageUrl }),
      ...(material.tags && material.tags.length > 0 && { tags: material.tags })
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating material:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update material'
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}
