import { NextResponse } from "next/server"
import mongoose from 'mongoose'
import connectToDB from "@/lib/db"
import Supplier from "@/models/SupplierModel"

type ProjectMaterial = {
  projectId: string;
  materialType: string;
  quantity: number;
  amount: number;
};

// GET /api/suppliers/[id]/materials
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid supplier ID' },
        { status: 400 }
      );
    }

    await connectToDB();
    
    const supplier = await Supplier.findById(id).select('projectMaterials').lean();
    
    if (!supplier) {
      return NextResponse.json(
        { message: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(supplier.projectMaterials || []);
  } catch (error) {
    console.error('Error fetching supplier project materials:', error);
    return NextResponse.json(
      { message: 'Failed to fetch project materials' },
      { status: 500 }
    );
  }
}

// POST /api/suppliers/[id]/materials
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { projectId, materialType, quantity, amount, date } = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid supplier ID' },
        { status: 400 }
      );
    }
    
    if (!projectId || !materialType || !quantity || amount === undefined) {
      return NextResponse.json(
        { message: 'Project ID, material type, quantity, and amount are required' },
        { status: 400 }
      );
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { message: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }
    
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { message: 'Amount must be a non-negative number' },
        { status: 400 }
      );
    }

    await connectToDB();
    
    // Check if material type is already assigned to this project for this supplier
    const existingMaterial = await Supplier.findOne({
      _id: id,
      'projectMaterials.projectId': projectId,
      'projectMaterials.materialType': materialType
    });
    
    let updatedSupplier;
    
    if (existingMaterial) {
      // Update existing material quantity, amount, and date
      updatedSupplier = await Supplier.findOneAndUpdate(
        { 
          _id: id,
          'projectMaterials.projectId': projectId,
          'projectMaterials.materialType': materialType
        },
        { 
          $inc: { 
            'projectMaterials.$.quantity': quantity
          },
          $set: {
            'projectMaterials.$.amount': amount,
            'projectMaterials.$.date': date ? new Date(date) : new Date()
          }
        },
        { new: true }
      );
    } else {
      // Add new material
      const newMaterial = {
        projectId,
        materialType,
        quantity: Number(quantity),
        amount: Number(amount),
        date: date ? new Date(date) : new Date()
      };
      
      updatedSupplier = await Supplier.findByIdAndUpdate(
        id,
        { $push: { projectMaterials: newMaterial } },
        { new: true }
      );
      
      console.log('Added new material:', newMaterial);
    }
    
    if (!updatedSupplier) {
      return NextResponse.json(
        { message: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedSupplier.projectMaterials, { status: 201 });
  } catch (error) {
    console.error('Error adding project material:', error);
    return NextResponse.json(
      { message: 'Failed to add project material' },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id]/materials
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { projectId, materialType } = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid supplier ID' },
        { status: 400 }
      );
    }
    
    if (!projectId || !materialType) {
      return NextResponse.json(
        { message: 'Project ID and material type are required' },
        { status: 400 }
      );
    }

    await connectToDB();
    
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      {
        $pull: {
          projectMaterials: {
            projectId,
            materialType
          }
        }
      },
      { new: true }
    );
    
    if (!updatedSupplier) {
      return NextResponse.json(
        { message: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Project material removed successfully',
      projectMaterials: updatedSupplier.projectMaterials
    });
  } catch (error) {
    console.error('Error removing project material:', error);
    return NextResponse.json(
      { message: 'Failed to remove project material' },
      { status: 500 }
    );
  }
}
