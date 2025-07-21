import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connectToDB from "@/lib/db";
import Client, { IClient } from "@/models/ClientModel";

interface ClientForMessaging {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

// Define consistent response structure
type ClientResponse = Omit<IClient, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

function toClientResponse(client: any): ClientResponse {
  return {
    ...client,
    _id: client._id?.toString?.() || '',
    createdAt: client.createdAt?.toISOString?.() || '',
    updatedAt: client.updatedAt?.toISOString?.() || ''
  };
}

// GET all clients
export async function GET() {
  try {
    await connectToDB();
    // Get all client fields
    const clients = await Client.find({})
      .sort({ name: 1 })
      .lean();

    // Transform MongoDB documents to include all fields
    const result = clients.map((client: any) => ({
      _id: client._id.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      postalCode: client.postalCode || '',
      taxId: client.taxId || '',
      website: client.website || '',
      status: client.status || 'Active',
      projectTotalAmount: client.projectTotalAmount || 0,
      totalPaid: client.totalPaid || 0,
      dueAmount: client.dueAmount || 0,
      lastPaymentDate: client.lastPaymentDate?.toISOString() || null,
      avatar: client.avatar || '',
      createdAt: client.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: client.updatedAt?.toISOString() || new Date().toISOString()
    }));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { message: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST create new client
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      name,
      email,
      phone,
      company,
      address,
      city,
      state,
      postalCode,
      taxId,
      website,
      projectTotalAmount,
      status,
      avatar
    } = data;

    await connectToDB();

    const client = new Client({
      name,
      email,
      phone,
      company,
      address,
      city,
      state,
      postalCode,
      taxId,
      website,
      projectTotalAmount,
      status,
      avatar
    });

    await client.save();

    return NextResponse.json(toClientResponse(client.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { message: 'Failed to create client' },
      { status: 500 }
    );
  }
}
