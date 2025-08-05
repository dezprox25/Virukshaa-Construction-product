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
      username,
      password,
      phone,
      materialTypes,
      projectMaterials,
      paymentType,
      address,
      supplyStartDate,
      avatar,
    } = body;

    if (!companyName || !contactPerson || !email || !username || !password || !phone || !materialTypes || !paymentType || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if email or username already exists
    const existingSupplier = await Supplier.findOne({
      $or: [
        { email },
        { username }
      ]
    });
    
    if (existingSupplier) {
      if (existingSupplier.email === email) {
        return NextResponse.json(
          { error: "A supplier with this email already exists" },
          { status: 400 }
        );
      }
      if (existingSupplier.username === username) {
        return NextResponse.json(
          { error: "This username is already taken" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate project materials if provided
    const validatedProjectMaterials = [];
    if (projectMaterials && Array.isArray(projectMaterials)) {
      // Validate each project material entry
      for (const pm of projectMaterials) {
        if (!pm.projectId || !pm.materialType || typeof pm.quantity !== 'number' || pm.quantity <= 0) {
          return NextResponse.json(
            { error: 'Invalid project materials format. Each item must have projectId, materialType, and quantity > 0' },
            { status: 400 }
          );
        }
        validatedProjectMaterials.push({
          projectId: pm.projectId,
          materialType: pm.materialType,
          quantity: pm.quantity
        });
      }
    }

    const newSupplier = new Supplier({
      companyName,
      contactPerson,
      email,
      username,
      password: hashedPassword,
      phone,
      materialTypes,
      projectMaterials: validatedProjectMaterials,
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
