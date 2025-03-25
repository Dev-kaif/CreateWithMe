// app/api/chats/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/mongoDb";
import Chat from "@/lib/models/chat";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure DB connection
connectDb();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chat = await Chat.findById(id);
    if (!chat) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }
    return NextResponse.json(chat, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/chats/[id]:", err);
    return NextResponse.json(
      { message: "Error fetching chat" },
      { status: 500 }
    );
  }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function analyzeImage(imageBase64: string, mimeType: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Analyze this image and extract relevant event-related details." },
            { 
              inlineData: { 
                mimeType: mimeType,
                data: imageBase64,
              } 
            }
          ],
        },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Could not analyze the image.";
  }
}

async function analyzeAndRefineContext(
  question: string,
  id: string
): Promise<{ response: string; complete: boolean }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chatHistory = await getChatHistory(id);

  
    const contextAnalysisPrompt = `
      You are an AI assistant helping users create engaging social media content for **ScrollConnect**, an event management platform.  
      Your goal is to **understand the user’s request by analyzing their message and past conversation history**, ensuring all necessary details are gathered before generating content.  

      ---
      🔹 **User Request:**  
      "${question}"

      🔹 **Previous Conversation (for context extraction):**  
      "${chatHistory}"

      ---
      ### **Step 1: Extract Key Details from User's Request & History**  
      Analyze the **current request** along with **all previous messages** to find relevant details. Look for:  

      1️⃣ **Content Type** → (e.g., Instagram Post, Story, Carousel, Reel)  
      2️⃣ **Theme/Purpose** → (e.g., event promotion, engagement, awareness, countdown)  
      3️⃣ **Target Audience** → (e.g., college students, tech enthusiasts, event organizers)  
      4️⃣ **Tone & Style** → (e.g., professional, playful, FOMO-driven, hype)  
      5️⃣ **Specific Details** → (e.g., hashtags, CTA, prizes, guest speakers, event details)  

      ---
      ### **Step 2: Check for Missing Information**  
      - If **ALL necessary details** are available, respond in **this JSON format**:  
        \`{"response": "Context is complete. Ready to generate content.", "complete": true}\`  

      - If **some details are unclear or missing**, provide **a friendly, helpful message** that encourages the user to refine their request:  
        \`{"response": "To make your content even better, consider adding:\n\n
        🔹 [Missing Detail 1] → [Why it’s useful & example]\n
        🔹 [Missing Detail 2] → [Why it’s useful & example]\n
        \n💡 Let me know what works for you! 🚀", "complete": false}\`  

      ---
      ### **Step 3: Adapt to User Preferences**  
      - If the user has **previously provided enough context**, **don’t ask again**—just proceed.  
      - If the user **refuses to provide a detail**, suggest **common options instead** of insisting.  
      - If the user says **"continue with all the given info"**, **stop asking and proceed immediately**.  

      ---
      🔹 **Formatting Rules:**  
      ✅ **Be helpful, not repetitive**—avoid asking for the same details again if they were previously provided.  
      ✅ **Keep responses short & structured**—use bullet points for missing details.  
      ✅ **DO NOT** generate content until details are complete.  
      ✅ **DO NOT** use code blocks. Only return JSON output.  
      ✅  Ensure **proper spacing between lines for readability**.
`;


    const result = await model.generateContentStream({ contents: [{ role: "user", parts: [{ text: contextAnalysisPrompt }] }] });


    let responseText = (await result.response).text();

    // 🔥 Remove triple backticks if present
    responseText = responseText.replace(/```json|```/g, "").trim();

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error analyzing context:", error);
    return {
      response: "I encountered an error while analyzing your request.",
      complete: false,
    };
  }
}

async function generateAiResponse(refinedPrompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(refinedPrompt);
    const responseText = await result.response.text();

    return responseText || "I'm not sure how to respond.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I encountered an error while generating a response.";
  }
}

async function getChatHistory(id: string) {
  // **🔹 Fetch chat history**
  const chat = await Chat.findById(id, "history");

  const history = chat?.history || [];

  // **🔹 Format history for Gemini**
  const chatHistory = history
    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (msg: any) =>
        `${msg.role === "user" ? "User" : "AI"}: ${msg.parts[0].text}`
    )
    .join("\n");

  return chatHistory;
}

// PUT API for handling chat updates
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const question = formData.get("question") as string;
    const image = formData.get("image") as Blob | null;

    if (!question) {
      return NextResponse.json(
        { message: "Question is required" },
        { status: 400 }
      );
    }

    let extractedContext = "";

    // **🔹 Extract Image Context if Provided**
    if (image) {
      const mimeType = image.type || "image/jpeg"; 
      const imageBuffer = Buffer.from(await image.arrayBuffer()); 
      const imageBase64 = imageBuffer.toString("base64"); 
      extractedContext = await analyzeImage(imageBase64, mimeType); 
    }
    
    console.log(extractedContext);   
  
    // Save user message first
    await Chat.updateOne(
      { _id: id },
      {
        $push: {
          history: {
            role: "user",
            parts: [{ text: question || "User uploaded an image" }],
          },
        },
      }
    );

    // save extracted data
    if (extractedContext) {
      await Chat.updateOne(
        { _id: id },
        {
          $push: {
            history: {
              role: "model",
              parts: [{ text: `📸 Extracted from Image:\n${extractedContext}` }],
            },
          },
        }
      );
    } 

    const fullContext = `${extractedContext}\n\n${question}`.trim();
    const contextAnalysis = await analyzeAndRefineContext(fullContext, id);


    // If context is incomplete, return without generating content
    if (!contextAnalysis.complete) {
      
      // Save AI response for context check
      await Chat.updateOne(
        { _id: id },
        {
          $push: {
            history: {
              role: "model",
              parts: [{ text: contextAnalysis.response }],
            },
          },
        }
      );

      return NextResponse.json(
        { message: contextAnalysis.response },
        { status: 200 }
      );
    }

    const chatHistory = await getChatHistory(id);

    // **🔹 Update prompt to include chat history**
    // **🔹 Update prompt to ensure proper line breaks**
    const refinedPrompt = `
      You are an AI-powered social media content creator for ScrollConnect, an event management platform.
      Generate high-quality Instagram content based on the provided context.

      **Previous Conversation:**  
      ${chatHistory}

      **User's new request:** "${question}"

      Ensure the response is structured with a **catchy hook, main content, and CTA**.

      Formatting rules:
      - Use **two raw newlines (\n\n) instead of HTML <br> tags** when providing multiple options.
      - Do **NOT** use <br> or any HTML formatting—only use raw newlines.
      - Maintain clarity, conciseness, and engagement.
      - Keep the content structured and visually appealing.
    `;

    const aiResponse = await generateAiResponse(refinedPrompt);

    // Save AI-generated content
    await Chat.updateOne(
      { _id: id },
      { $push: { history: { role: "model", parts: [{ text: aiResponse }] } } }
    );

    return NextResponse.json(
      { message: "Chat updated", aiResponse },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in PUT /api/chats/[id]:", err);
    return NextResponse.json(
      { message: "Error updating chat" },
      { status: 500 }
    );
  }
}
