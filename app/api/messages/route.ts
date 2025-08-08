import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Message from "@/models/MessageModel";

export async function GET(req: NextRequest) {
  await connectToDB();
  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json([], { status: 200 });

  const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  await connectToDB();
  const { conversationId, text, sender } = await req.json();
  if (!conversationId || !text || !sender)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const message = await Message.create({
    conversationId,
    text,
    sender,
    timestamp: new Date(),
  });

  return NextResponse.json(message, { status: 201 });
}
