import { getServerSession } from "next-auth/next"; 
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Message from "@/models/Message";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions); // ✅ works in App Router without req/res

    if (!session) {
      return NextResponse.json({ error: "Please login" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    await connectToDB();

    const messages = await Message.find({
      $or: [
        { senderEmail: conversationId },
        { receiverEmail: conversationId }
      ]
    }).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Please login" }, { status: 401 });
    }

    await connectToDB();

    const { senderEmail, receiverEmail, text } = await req.json();

    if (!senderEmail || !receiverEmail || !text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newMessage = new Message({
      senderEmail,
      receiverEmail,
      text,
    });

    await newMessage.save();

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
