import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Supplier, { ISupplier } from "@/models/SupplierModel";
import { Types } from 'mongoose';

type Params = {
  params: {
    id: string;
  };
};

export async function GET(request: Request, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error(`Error fetching supplier:`, error);
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid supplier ID' }, { status: 400 });
    }

    await dbConnect();
    const body = await request.json();

    // Convert date strings to Date objects
    if (body.lastPaymentDate && typeof body.lastPaymentDate === 'string') {
      body.lastPaymentDate = new Date(body.lastPaymentDate);
    }
    if (body.supplyStartDate && typeof body.supplyStartDate === 'string') {
      body.supplyStartDate = new Date(body.supplyStartDate);
    }

    // Check if username is being updated and if it's already taken
    if (body.username) {
      const existingUser = await Supplier.findOne({ 
        username: body.username, 
        _id: { $ne: id } 
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'This username is already taken' },
          { status: 400 }
        );
      }
    }

    // Create a clean update object with only allowed fields
    const updateData: Partial<ISupplier> = {};
    const allowedFields: (keyof ISupplier)[] = [
      'companyName', 'contactPerson', 'email', 'username', 'phone', 'materialTypes',
      'paymentType', 'address', 'status', 'supplyStartDate', 'avatar',
      'totalPaid', 'dueAmount', 'lastPaymentDate'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        (updateData as any)[field] = body[field];
      }
    });

    // Handle password update separately to hash it
    if (body.password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(body.password, 10);
    }
    
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error(`Error updating supplier:`, error);
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await dbConnect();
    const { id } = params;

    const deletedSupplier = await Supplier.findByIdAndDelete(id);

    if (!deletedSupplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error(`Error deleting supplier:`, error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
