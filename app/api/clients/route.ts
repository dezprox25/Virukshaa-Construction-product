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

// GET all clients or single by email
export async function GET(request: Request) {
  try {
    await connectToDB();
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (email) {
      const client = await Client.findOne({ email }).lean();

      if (!client) {
        return NextResponse.json({ message: "Client not found" }, { status: 404 });
      }

      return NextResponse.json(toClientResponse(client), { status: 200 });
    }

    const clients = await Client.find({}).sort({ name: 1 }).lean();

    const result = clients.map(toClientResponse);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { message: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// PUT update existing client by email
export async function PUT(request: Request) {
  try {
    await connectToDB();
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const body = await request.json();

    const updatedClient = await Client.findOneAndUpdate(
      { email },
      { $set: body },
      { new: true }
    ).lean();

    if (!updatedClient) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(toClientResponse(updatedClient), { status: 200 });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { message: "Failed to update client" },
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
