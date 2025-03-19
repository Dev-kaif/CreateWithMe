import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/mongoDb';
import Chat from '@/lib/models/chat';

// Ensure DB connection
connectDb();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const chat = await Chat.findById(id);
    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
    }
    return NextResponse.json(chat, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/chats/[id]:', err);
    return NextResponse.json({ message: 'Error fetching chat' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { question, answer } = body;
    
    if (!answer) {
      return NextResponse.json(
        { message: 'Answer is required' },
        { status: 400 }
      );
    }
    
    // Create new history items (no image field included)
    const newItems = [
      ...(question ? [{ role: "user", parts: [{ text: question }] }] : []),
      { role: "model", parts: [{ text: answer }] },
    ];
    
    const updatedChat = await Chat.updateOne(
      { _id: id },
      { $push: { history: { $each: newItems } } }
    );
    
    return NextResponse.json(updatedChat, { status: 200 });
  } catch (err) {
    console.error('Error in PUT /api/chats/[id]:', err);
    return NextResponse.json({ message: 'Error updating chat' }, { status: 500 });
  }
}
