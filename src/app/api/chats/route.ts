import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/mongoDb';
import Chat from '@/lib/models/chat';
import UserChats from '@/lib/models/userChat';

// Ensure DB connection
connectDb();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, text } = body;
    
    if (!userId || !text) {
      return NextResponse.json(
        { message: 'userId and text are required' },
        { status: 400 }
      );
    }
    
    // Create a new chat with the user's initial message
    const newChat = new Chat({
      userId,
      history: [{ role: "user", parts: [{ text }] }],
    });
    const savedChat = await newChat.save();
    
    // Check if a UserChats document exists for the user
    const userChats = await UserChats.findOne({ userId });
    
    if (!userChats) {
      // Create a new document if none exists
      const newUserChats = new UserChats({
        userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });
      await newUserChats.save();
    } else {
      // Push the new chat into the existing chats array
      await UserChats.updateOne(
        { userId },
        { $push: { chats: { _id: savedChat._id, title: text.substring(0, 40) } } }
      );
    }
    
    return NextResponse.json({ chatId: savedChat._id }, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/chats:', err);
    return NextResponse.json({ message: 'Error creating chat' }, { status: 500 });
  }
}
