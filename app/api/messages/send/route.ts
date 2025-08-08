import { NextRequest, NextResponse } from 'next/server'
import connectToDB from '@/lib/db'
import Message from '@/models/MessageModel'

export async function POST(req: NextRequest) {
  await connectToDB()
  const { conversationId, sender, text } = await req.json()

  if (!conversationId || !sender || !text) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const message = await Message.create({ conversationId, sender, text })
  return NextResponse.json(message)
}
