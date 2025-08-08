import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Client from "@/models/ClientModel";
import connectToDB from "@/lib/db";
import { Types } from "mongoose";

// Define a clean client response type
type ClientResponse = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  taxId?: string;
  website?: string;
  projectTotalAmount?: number;
  status?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
};

export async function GET(
  request: Request,
  { params }: { params: { email: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { email } = params;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const client = (await Client.findOne({ email })
      .select("-__v -password")
      .lean()) as {
      _id: Types.ObjectId;
      name: string;
      email: string;
      phone?: string;
      company?: string;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      taxId?: string;
      website?: string;
      projectTotalAmount?: number;
      status?: string;
      avatar?: string;
      createdAt?: Date;
      updatedAt?: Date;
    } | null;

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    const responseData: ClientResponse = {
      _id: client._id.toString(),
      name: client.name || "",
      email: client.email || "",
      phone: client.phone,
      company: client.company,
      address: client.address,
      city: client.city,
      state: client.state,
      postalCode: client.postalCode,
      taxId: client.taxId,
      website: client.website,
      projectTotalAmount: client.projectTotalAmount,
      status: client.status,
      avatar: client.avatar,
      createdAt: client.createdAt
        ? client.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: client.updatedAt
        ? client.updatedAt.toISOString()
        : new Date().toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching client by email:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
