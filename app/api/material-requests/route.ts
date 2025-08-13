import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import MaterialRequest, { IMaterialRequest } from "@/models/MaterialRequestModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Response type
type MaterialRequestResponse = {
  _id: string;
  material: string;
  materialName: string;
  unit: string;
  quantity: number;
  status: string;
  requestDate: string;
  requiredDate: string;
  notes?: string;
  requestedBy: string;
  supervisor?: string;
  createdAt: string;
  updatedAt: string;
};

// GET /api/material-requests
export async function GET() {
  try {
    await connectToDB();

    const requests = await MaterialRequest.find({})
      .sort({ createdAt: -1 })
      .lean();

    const response: MaterialRequestResponse[] = requests.map(request => ({
      _id: request._id.toString(),
      material: request.material,
      materialName: request.materialName,
      unit: request.unit,
      quantity: request.quantity,
      status: request.status,
      requestDate: request.requestDate.toISOString(),
      requiredDate: request.requiredDate.toISOString(),
      notes: request.notes,
      requestedBy: request.requestedBy,
      supervisor: request.supervisor,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString()
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching material requests:', error);
    return NextResponse.json(
      { message: 'Failed to fetch material requests' },
      { status: 500 }
    );
  }
}

// POST /api/material-requests
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.material || !data.quantity || !data.unit || !data.requiredDate) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDB();

    const materialRequest = new MaterialRequest({
      material: data.material,
      materialName: data.materialName,
      quantity: data.quantity,
      unit: data.unit,
      requiredDate: new Date(data.requiredDate),
      notes: data.notes || '',
      status: data.status || 'Pending',
      requestedBy: data.requestedBy || 'Anonymous',
      email: data.email || 'anonymous@example.com',
      requestDate: new Date()
    });

    await materialRequest.save();

    const response: MaterialRequestResponse = {
      _id: materialRequest._id.toString(),
      material: materialRequest.material,
      materialName: materialRequest.materialName,
      unit: materialRequest.unit,
      quantity: materialRequest.quantity,
      status: materialRequest.status,
      requestDate: materialRequest.requestDate.toISOString(),
      requiredDate: materialRequest.requiredDate.toISOString(),
      notes: materialRequest.notes,
      requestedBy: materialRequest.requestedBy,
      email: materialRequest.email,
      createdAt: materialRequest.createdAt.toISOString(),
      updatedAt: materialRequest.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating material request:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
