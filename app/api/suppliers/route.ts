import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Supplier from "@/models/SupplierModel"

export async function GET() {
  try {
    await dbConnect()
    const suppliers = await Supplier.find({}).sort({ createdAt: -1 })
    return NextResponse.json(suppliers)
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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
      supplyStartDate,
      avatar,
    } = body;

    if (!companyName || !contactPerson || !email || !phone || !materialTypes || !paymentType || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return NextResponse.json(
        { error: "A supplier with this email already exists" },
        { status: 400 }
      );
    }

    const newSupplier = new Supplier({
      companyName,
      contactPerson,
      email,
      phone,
      materialTypes,
      paymentType,
      address,
      supplyStartDate,
      avatar,
      status: 'Active',
    });

    const savedSupplier = await newSupplier.save();
    return NextResponse.json(savedSupplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}

// Handle PUT and DELETE methods using dynamic route handlers
// Create a new file at: app/api/suppliers/[id]/route.ts
// The implementation is provided below
