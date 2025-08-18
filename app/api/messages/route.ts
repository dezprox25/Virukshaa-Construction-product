// import { NextResponse } from 'next/server';
// import connectToDB from '@/lib/db';
// import Message from '@/models/Message';
// // Auth optional for now; wire up NextAuth later if needed

// // Type for message creation request body
// interface CreateMessageRequest {
//   text: string;
//   sender: 'client' | 'superadmin';
//   conversationId: string;
// }

// // Type for message response
// interface MessageResponse {
//   id: string;
//   text: string;
//   sender: 'client' | 'superadmin';
//   conversationId: string;
//   timestamp: string;
//   read: boolean;
// }

// // Create a new message
// export async function POST(req: Request) {
//   try {
//     await connectToDB();
//     // Optionally validate session here

//     const { text, sender, conversationId }: Partial<CreateMessageRequest> = await req.json();
    
//     // Validate request body
//     if (!text?.trim() || !sender || !conversationId) {
//       return NextResponse.json(
//         { success: false, error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     if (!['client', 'superadmin'].includes(sender)) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid sender type' },
//         { status: 400 }
//       );
//     }

//     // Derive receiver from sender
//     const receiver: 'client' | 'superadmin' = sender === 'client' ? 'superadmin' : 'client';

//     // Create and save the message
//     const message = new Message({
//       text: text.trim(),
//       sender,
//       receiver,
//       conversationId,
//       timestamp: new Date(),
//       read: false,
//     });

//     await message.save();
    
//     // Convert to plain object and format the response
//     const messageObj = message.toObject();
//     const response: MessageResponse = {
//       id: messageObj._id.toString(),
//       text: messageObj.text,
//       sender: messageObj.sender,
//       conversationId: messageObj.conversationId,
//       timestamp: messageObj.timestamp.toISOString(),
//       read: messageObj.read,
//     };

//     return NextResponse.json({ success: true, data: response });
//   } catch (error: any) {
//     console.error('Error sending message:', error?.message || error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to send message' },
//       { status: 500 }
//     );
//   }
// }

// // Get messages for a conversation
// export async function GET(req: Request) {
//   try {
//     await connectToDB();
//     const { searchParams } = new URL(req.url);
//     const conversationId = searchParams.get('conversationId');
//     const seed = searchParams.get('seed');
    
//     // If no conversationId provided, return ALL messages
//     if (!conversationId) {
//       const all = await Message.find({})
//         .sort({ timestamp: 1 })
//         .lean()
//         .exec();
//       const responseAll: MessageResponse[] = all.map((msg: any) => ({
//         id: msg._id.toString(),
//         text: msg.text,
//         sender: msg.sender,
//         conversationId: msg.conversationId,
//         timestamp: msg.timestamp.toISOString(),
//         read: msg.read || false,
//       }));
//       return NextResponse.json({ success: true, messages: responseAll });
//     }

//     // Get messages for the conversation, sorted by timestamp
//     let messages = await Message.find({ conversationId })
//       .sort({ timestamp: 1 })
//       .lean()
//       .exec();

//     // Optional seed (first-time welcome from superadmin)
//     if ((seed === '1' || seed === 'true') && (!messages || messages.length === 0)) {
//       const now = new Date();
//       const seedDocs = [
//         new Message({
//           text: "Welcome to our support system! I'm here to help you with any questions.",
//           sender: 'superadmin',
//           receiver: 'client',
//           conversationId,
//           timestamp: new Date(now.getTime() - 1000 * 60 * 10), // 10 mins ago
//           read: false,
//         }),
//         new Message({
//           text: "Great! Feel free to ask me anything. I'm available 24/7 to assist you.",
//           sender: 'superadmin',
//           receiver: 'client',
//           conversationId,
//           timestamp: new Date(now.getTime() - 1000 * 60 * 5), // 5 mins ago
//           read: false,
//         }),
//       ];
//       await Message.insertMany(seedDocs);
//       messages = await Message.find({ conversationId }).sort({ timestamp: 1 }).lean().exec();
//     }

//     // Format the response
//     const response: MessageResponse[] = messages.map((msg: any) => ({
//       id: msg._id.toString(),
//       text: msg.text,
//       sender: msg.sender,
//       conversationId: msg.conversationId,
//       timestamp: msg.timestamp.toISOString(),
//       read: msg.read || false,
//     }));

//     return NextResponse.json({ success: true, messages: response });
//   } catch (error: any) {
//     console.error('Error fetching messages:', error?.message || error);
//     return NextResponse.json(
//       { error: 'Failed to fetch messages' },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server"
import connectToDB from "@/lib/db"
import Message from "@/models/Message"

// Type for message creation request body
interface CreateMessageRequest {
  text: string
  sender: "client" | "superadmin"
}

// Type for message response
interface MessageResponse {
  id: string
  text: string
  sender: "client" | "superadmin"
  timestamp: string
  read: boolean
}

// Create a new message
export async function POST(req: Request) {
  try {
    await connectToDB()

    const { text, sender }: Partial<CreateMessageRequest> = await req.json()

    // Validate request body
    if (!text?.trim() || !sender) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!["client", "superadmin"].includes(sender)) {
      return NextResponse.json({ success: false, error: "Invalid sender type" }, { status: 400 })
    }

    const message = new Message({
      text: text.trim(),
      sender,
      receiver: sender === "client" ? "superadmin" : "client",
      conversationId: "main-chat", // Single conversation for all messages
      timestamp: new Date(),
      read: false,
    })

    await message.save()

    const messageObj = message.toObject()
    const response: MessageResponse = {
      id: messageObj._id.toString(),
      text: messageObj.text,
      sender: messageObj.sender,
      timestamp: messageObj.timestamp.toISOString(),
      read: messageObj.read,
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error: any) {
    console.error("Error sending message:", error?.message || error)
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
  }
}

// Get all messages between client and admin
export async function GET(req: Request) {
  try {
    await connectToDB()
    const { searchParams } = new URL(req.url)
    const seed = searchParams.get("seed")

    let messages = await Message.find({}).sort({ timestamp: 1 }).lean().exec()

    // Optional seed for first-time users
    if ((seed === "1" || seed === "true") && (!messages || messages.length === 0)) {
      const now = new Date()
      const seedDocs = [
        new Message({
          text: "Welcome to our support system! I'm here to help you with any questions.",
          sender: "superadmin",
          receiver: "client",
          conversationId: "main-chat",
          timestamp: new Date(now.getTime() - 1000 * 60 * 10), // 10 mins ago
          read: false,
        }),
        new Message({
          text: "Great! Feel free to ask me anything. I'm available 24/7 to assist you.",
          sender: "superadmin",
          receiver: "client",
          conversationId: "main-chat",
          timestamp: new Date(now.getTime() - 1000 * 60 * 5), // 5 mins ago
          read: false,
        }),
      ]
      await Message.insertMany(seedDocs)
      messages = await Message.find({}).sort({ timestamp: 1 }).lean().exec()
    }

    const response: MessageResponse[] = messages.map((msg: any) => ({
      id: msg._id.toString(),
      text: msg.text,
      sender: msg.sender,
      timestamp: msg.timestamp.toISOString(),
      read: msg.read || false,
    }))

    return NextResponse.json({ success: true, messages: response })
  } catch (error: any) {
    console.error("Error fetching messages:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
