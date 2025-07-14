import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Supplier from "@/models/SupplierModel"

type Params = {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    await dbConnect()
    const { id } = params
    
    const supplier = await Supplier.findById(id)
    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(supplier)
  } catch (error) {
    console.error(`Error fetching supplier:`, error)
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, context: Params) {
  const { id } = context.params;
  try {
    await dbConnect();
    
    const body = await request.json();

    const {
      companyName,
      contactPerson,
      email,
      phone,
      materialTypes,
      paymentType,
      address,
      status,
      supplyStartDate,
      avatar,
    } = body;

    if (!companyName || !contactPerson || !email || !phone || !materialTypes || !paymentType || !address || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (email) {
      const existingSupplier = await Supplier.findOne({ email, _id: { $ne: id } });
      if (existingSupplier) {
        return NextResponse.json(
          { error: "A supplier with this email already exists" },
          { status: 400 }
        );
      }
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      {
        companyName,
        contactPerson,
        email,
        phone,
        materialTypes,
        paymentType,
        address,
        status,
        supplyStartDate,
        avatar,
      },
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error(`Error updating supplier:`, error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await dbConnect()
    const { id } = params
    
    const deletedSupplier = await Supplier.findByIdAndDelete(id)
    
    if (!deletedSupplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: "Supplier deleted successfully" })
  } catch (error) {
    console.error(`Error deleting supplier:`, error)
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    )
  }
}
