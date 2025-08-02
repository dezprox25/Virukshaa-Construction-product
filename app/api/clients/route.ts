import { NextResponse } from "next/server";
import { Types } from "mongoose";
import bcrypt from 'bcryptjs';
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
      username: client.username, // Include username in the response
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
      username,
      email,
      phone,
      password,
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

    // Validate required fields
    if (!username) {
      return NextResponse.json(
        { message: 'Username is required' },
        { status: 400 }
      );
    }

    // If password is not provided, use a default one
    let hashedPassword = '';
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { message: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    } else {
      // Set a default password if not provided
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash('password123', salt);
    }

    await connectToDB();

    // Check if username or email already exists
    const existingUser = await Client.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Username or email already exists' },
        { status: 400 }
      );
    }

    const client = new Client({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      company: company || '',
      address,
      city,
      state,
      postalCode,
      taxId: taxId || '',
      website: website || '',
      projectTotalAmount: Number(projectTotalAmount) || 0,
      status: status || 'Active',
      avatar: avatar || '',
      totalPaid: 0,
      dueAmount: Number(projectTotalAmount) || 0,
      lastPaymentDate: null
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
