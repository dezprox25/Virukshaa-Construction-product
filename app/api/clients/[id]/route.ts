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

type UpdateClientData = Partial<Omit<IClient, '_id' | 'createdAt' | 'updatedAt'>>;

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const data: UpdateClientData = await request.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
    }

    await connectToDB();

    const updatePayload: any = {
      ...data,
      updatedAt: new Date(),
    };

    // Only add avatar if it's defined
    if (data.avatar !== undefined) {
      updatePayload.avatar = data.avatar;
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    ).lean().exec();

    if (!updatedClient) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(toClientResponse(updatedClient));
  } catch (error) {
    console.error('Error updating client:', error);
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
