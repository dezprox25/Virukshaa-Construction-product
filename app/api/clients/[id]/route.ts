import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connectToDB from "@/lib/db";
import Client, { IClient } from "@/models/ClientModel";

// Fixed type usage for lean object
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
    }

    await connectToDB();
    const client = await Client.findById(id).lean().exec();

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(toClientResponse(client));
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ message: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
    }

    const body = await request.json();

    // Convert date strings to Date objects
    if (body.lastPaymentDate && typeof body.lastPaymentDate === 'string') {
      body.lastPaymentDate = new Date(body.lastPaymentDate);
    }

    // Create a clean update object with only allowed fields
    const updateData: Partial<IClient> = {};
    const allowedFields: (keyof IClient)[] = [
      'name', 'email', 'phone', 'company', 'address', 'city', 'state',
      'postalCode', 'taxId', 'website', 'status', 'projectTotalAmount',
      'totalPaid', 'dueAmount', 'lastPaymentDate', 'avatar'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        (updateData as any)[field] = body[field];
      }
    });

    await connectToDB();
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedClient) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(toClientResponse(updatedClient));
  } catch (error) {
    console.error(`Error updating client ${id}:`, error);
    return NextResponse.json({ message: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
    }

    await connectToDB();
    const deletedClient = await Client.findByIdAndDelete(id).lean().exec();

    if (!deletedClient) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...toClientResponse(deletedClient),
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ message: 'Failed to delete client' }, { status: 500 });
  }
}
