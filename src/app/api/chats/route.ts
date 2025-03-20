// app/api/chats/route.ts
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


// PUT: Update chat title
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, chatId, newTitle } = body;

    if (!userId || !chatId || !newTitle) {
      return NextResponse.json(
        { message: 'userId, chatId, and newTitle are required' },
        { status: 400 }
      );
    }

    // Update the chat title in UserChats
    const updatedUserChats = await UserChats.findOneAndUpdate(
      { userId, 'chats._id': chatId },
      { $set: { 'chats.$.title': newTitle } },
      { new: true }
    );

    if (!updatedUserChats) {
      return NextResponse.json(
        { message: 'Chat not found or title not updated' },
        { status: 404 }
      );
    }

    // Find the updated chat entry
    const updatedChat = updatedUserChats.chats.find(chat => chat._id === chatId);

    return NextResponse.json({ message: 'Chat title updated successfully', chat: updatedChat });
  } catch (err) {
    console.error('Error in PUT /api/chats:', err);
    return NextResponse.json(
      { message: 'Error updating chat title' },
      { status: 500 }
    );
  }
}

// DELETE: Remove chat and its history
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const chatId = searchParams.get('chatId');

    if (!userId || !chatId) {
      return NextResponse.json(
        { message: 'userId and chatId are required' },
        { status: 400 }
      );
    }

    // Delete the chat from the Chat collection
    await Chat.findByIdAndDelete(chatId);

    // Remove the chat reference from UserChats
    const updatedUserChats = await UserChats.updateOne(
      { userId },
      { $pull: { chats: { _id: chatId } } }
    );

    if (updatedUserChats.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Chat not found or not deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Chat deleted successfully' });
  } catch (err) {
    console.error('Error in DELETE /api/chats:', err);
    return NextResponse.json(
      { message: 'Error deleting chat' },
      { status: 500 }
    );
  }
}
