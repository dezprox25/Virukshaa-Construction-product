import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Message from '@/models/Message';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Document, Types } from 'mongoose';

// Type for message creation request body
interface CreateMessageRequest {
  text: string;
  sender: 'client' | 'superadmin';
  conversationId: string;
}

// Type for message response
interface MessageResponse {
  id: string;
  text: string;
  sender: 'client' | 'superadmin';
  conversationId: string;
  timestamp: string;
  read: boolean;
}

// Create a new message
export async function POST(req: Request) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { text, sender, conversationId }: Partial<CreateMessageRequest> = await req.json();
    
    // Validate request body
    if (!text?.trim() || !sender || !conversationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['client', 'superadmin'].includes(sender)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sender type' },
        { status: 400 }
      );
    }

    // Create and save the message
    const message = new Message({
      text: text.trim(),
      sender,
      conversationId,
      timestamp: new Date(),
      read: false,
    });

    await message.save();
    
    // Convert to plain object and format the response
    const messageObj = message.toObject();
    const response: MessageResponse = {
      id: messageObj._id.toString(),
      text: messageObj.text,
      sender: messageObj.sender,
      conversationId: messageObj.conversationId,
      timestamp: messageObj.timestamp.toISOString(),
      read: messageObj.read,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// Get messages for a conversation
export async function GET(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Get messages for the conversation, sorted by timestamp
    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .lean()
      .exec();

    // Format the response
    const response: MessageResponse[] = messages.map((msg: any) => ({
      id: msg._id.toString(),
      text: msg.text,
      sender: msg.sender,
      conversationId: msg.conversationId,
      timestamp: msg.timestamp.toISOString(),
      read: msg.read || false,
    }));

    return NextResponse.json({ success: true, messages: response });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
