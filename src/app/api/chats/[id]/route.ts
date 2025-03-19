// app/api/chats/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/mongoDb';
import Chat from '@/lib/models/chat';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure DB connection
connectDb();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
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


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string); 

export async function generateAiResponse(question: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(question);
    const responseText = await result.response.text();
    console.log(question , responseText);
    
    return responseText || "I'm not sure how to respond.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I encountered an error while generating a response.";
  }
}




export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json({ message: 'Question is required' }, { status: 400 });
    }

    // Save user message first
    await Chat.updateOne({ _id: id }, { $push: { history: { role: "user", parts: [{ text: question }] } } });

    // Generate response using an AI API (e.g., OpenAI)
    const aiResponse = await generateAiResponse(question); // Implement this function

    // Save AI response
    await Chat.updateOne({ _id: id }, { $push: { history: { role: "model", parts: [{ text: aiResponse }] } } });

    return NextResponse.json({ message: 'Chat updated' }, { status: 200 });
  } catch (err) {
    console.error('Error in PUT /api/chats/[id]:', err);
    return NextResponse.json({ message: 'Error updating chat' }, { status: 500 });
  }
}

