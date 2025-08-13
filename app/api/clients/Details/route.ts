import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Client, { IClient } from "@/models/ClientModel";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDB();

    const client = await Client.findOne({ email }).lean() as unknown as IClient;

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: client.id.toString(),
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
      createdAt: client.createdAt?.toISOString() || '',
      updatedAt: client.updatedAt?.toISOString() || ''
    });
  } catch (error) {
    console.error('Error fetching client by email:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
