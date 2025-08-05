import { NextResponse } from "next/server"
import { Types } from 'mongoose'
import connectToDB from "@/lib/db"
import { Material, IMaterial, MaterialDocument } from "@/models/MaterialModel"

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
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order';
  description?: string;
  notes?: string;
  minOrderQuantity?: number;
  location?: string;
  barcode?: string;
  sku?: string;
  imageUrl?: string;
  tags?: string[];
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
};

// GET /api/materials
export async function GET() {
  try {
    console.log('Connecting to database...')
    await connectToDB()
    console.log('Successfully connected to database')
    
    console.log('Fetching materials...')
    const materials = await Material.find({}).sort({ name: 1 }).lean().exec()
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
      supplier: string;
      status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order';
      description?: string;
      notes?: string;
      minOrderQuantity?: number;
      location?: string;
      barcode?: string;
      sku?: string;
      imageUrl?: string;
      tags?: string[];
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
        supplier: material.supplier,
        status: material.status as 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order',
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
    
    // Validate required fields
    if (!data.name || !data.category || !data.unit) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    await connectToDB()
    
    // Set default values for optional fields
    const materialData = {
      name: data.name,
      category: data.category,
      unit: data.unit,
      currentStock: data.currentStock || 0,
      reorderLevel: data.reorderLevel || 0,
      pricePerUnit: data.pricePerUnit || 0,
      supplier: data.supplier || '',
      status: data.status || 'In Stock',
      lastUpdated: new Date(),
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
      supplier: material.supplier,
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
    
    const updatedData = {
      ...data,
      lastUpdated: new Date()
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
      supplier: material.supplier,
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
