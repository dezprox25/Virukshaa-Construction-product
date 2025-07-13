import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Client, { IClient } from "@/models/ClientModel";

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
    const clients = await Client.find({}).sort({ createdAt: -1 }).lean();

    const result = clients.map(toClientResponse);
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
