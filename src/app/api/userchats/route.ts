// app/api/userchats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/mongoDb';
import UserChats from '@/lib/models/userChat';

// Ensure DB connection
connectDb();

export async function GET(req: NextRequest) {
  try {
    // Get userId from query parameters since no authentication is used
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'userId is required' },
        { status: 400 }
      );
    }
    
    const userChats = await UserChats.findOne({ userId });
    if (!userChats) {
      return NextResponse.json({ chats: [] }, { status: 200 });
    }
    return NextResponse.json(userChats.chats, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/userchats:', err);
    return NextResponse.json({ message: 'Error fetching user chats' }, { status: 500 });
  }
}
