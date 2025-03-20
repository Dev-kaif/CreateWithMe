// app/api/chats/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/mongoDb";
import Chat from "@/lib/models/chat";
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

async function analyzeAndRefineContext(
  question: string
): Promise<{ response: string; complete: boolean }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // const contextAnalysisPrompt = `
    //   You are an AI assistant helping a user create social media content for ScrollConnect, an event management platform.
    //   The user has asked: "${question}"

    //   Your task is to check if all required details are provided. These include:
    //   1. **Content Type** - What kind of content is needed? (e.g., Instagram post caption, tagline, story, carousel post).
    //   2. **Theme/Purpose** - What is the goal of this post? (e.g., event promotion, brand awareness, engagement).
    //   3. **Target Audience** - Who is this post for? (e.g., college students, event organizers, tech enthusiasts).
    //   4. **Tone** - What style should the content have? (e.g., professional, friendly, witty, informative).
    //   5. **Specific Details** - Are there any required elements like hashtags, calls-to-action (CTA), or key points to mention?

    //   If all details are provided, respond with:
    //   {"response": "Context is complete. Ready to generate content.", "complete": true}

    //   If any details are missing, respond with a **detailed message** explaining what is missing and why it is important.
    //   Format it like this:
    //   {"response": "Some important details are missing: \\n\\n
    //   - **Content Type**: [Explanation if missing] \\n
    //   - **Theme/Purpose**: [Explanation if missing] \\n
    //   - **Target Audience**: [Explanation if missing] \\n
    //   - **Tone**: [Explanation if missing] \\n
    //   - **Specific Details**: [Explanation if missing] \\n\\n
    //   Please provide the missing details so I can generate the best content for you!", "complete": false}

    //   - Ensure **proper spacing between lines for readability**.
    //   - Do **NOT** format the response as a code block.
    //   - Do **NOT** add extra explanations. Only return pure JSON.
    // `;

    //     const contextAnalysisPrompt = `
    //       You are a **social media content strategist AI** helping users create **highly engaging** Instagram content for **ScrollConnect**, an event management platform.
    //       The user has asked: "${question}"

    //       🎯 **Your Role:**
    //       - Ensure that all required details are provided before generating content.
    //       - If any details are missing, **politely ask for them in an engaging and structured way**.
    //       - Format your response with **proper spacing for readability**.

    //       **✅ Required Details:**
    //       1️⃣ **Content Type** – What kind of post is this? (Caption, Story, Tagline, Carousel, etc.)
    //       2️⃣ **Theme/Purpose** – What is the goal? (Promote an event, highlight a feature, drive engagement, etc.)
    //       3️⃣ **Target Audience** – Who should this content appeal to? (College students, tech enthusiasts, event organizers, etc.)
    //       4️⃣ **Tone & Style** – Should it be **fun, professional, witty, or informative**?
    //       5️⃣ **Specific Details** – Are there any key elements like **hashtags, CTAs, or must-mention features**?

    //       **📌 AI Response Rules:**
    //       - **If all details are provided**, return:
    //         \`{"response": "Context is complete. Ready to generate content.", "complete": true}\`

    //       - **If any details are missing, respond in a clear and engaging way**:
    //         \`{"response": "**🚀 Some important details are missing!**\\n\\n
    //         🔹 **Content Type**: [Explain why this is important & how it shapes the post]\\n\\n
    //         🔹 **Theme/Purpose**: [Explain why knowing the goal helps tailor the content]\\n\\n
    //         🔹 **Target Audience**: [Mention how different audiences need different styles]\\n\\n
    //         🔹 **Tone & Style**: [Guide the user to choose a fitting tone]\\n\\n
    //         🔹 **Specific Details**: [Encourage user to provide hashtags, CTAs, key points]\\n\\n
    //         **💡 Pro Tip:** The more details you give, the better your content will be! 🚀", "complete": false}\`

    //       **🛠 Formatting Guidelines:**
    //       - Use **line breaks** for better readability.
    //       - Ensure **proper spacing between lines for readability**.
    //       - Keep responses **engaging, clear, and friendly**.
    //       - **Never generate content** until all details are complete.
    //       - Do **NOT** format the response as a code block.
    //       - Do **NOT** add extra explanations. Only return pure JSON.
    //     `
    // ;

    const contextAnalysisPrompt = `
      You are an AI assistant analyzing a user's request for social media content.  
      Your goal is to **extract the necessary details from the user's message** and **only ask for additional details if something is genuinely unclear or missing**.

      ---
      🔹 **User Request:**  
      "${question}"

      ### **Step 1: Identify Key Details**  
      Look for the following **inside the user's message**:  

      1️⃣ **Content Type** → (e.g., Instagram Story, Post, Carousel, Reel)  
      2️⃣ **Theme/Purpose** → (e.g., event promotion, engagement, awareness, countdown)  
      3️⃣ **Target Audience** → (e.g., college students, devs, beginners, experienced coders)  
      4️⃣ **Tone & Style** → (e.g., professional, playful, hype-driven, FOMO)  
      5️⃣ **Specific Details** → (e.g., hashtags, CTA, prizes, guest speakers, special challenges)  

      ---
      ### **Step 2: Check for Missing Info**  
      - If **ALL details are present**, respond in **exactly** this JSON format:  
      {"response": "Context is complete. Ready to generate content.", "complete": true}

      - If **some details are missing**, respond in **this format**, BUT **also provide helpful guidance** on what the user needs to add:  
      {"response": "Some details are missing. Here's what would improve your request:\n\n
      🔹 [Missing Detail 1] → [Why it’s needed & example]\n
      🔹 [Missing Detail 2] → [Why it’s needed & example]\n
      \n💡 Try adding these for the best results! 🚀", "complete": false}

      - **DO NOT return generic missing details. Always provide guidance.**  
      - **DO NOT format responses as a code block. Only return JSON.**  
      - Ensure **proper spacing between lines for readability**.
      - Do **NOT** format the response as a code block.
      - Do **NOT** add extra explanations. Only return pure JSON. 
      `;

    const result = await model.generateContent(contextAnalysisPrompt);
    let responseText = await result.response.text();

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

// PUT API for handling chat updates
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json(
        { message: "Question is required" },
        { status: 400 }
      );
    }

    // Save user message first
    await Chat.updateOne(
      { _id: id },
      { $push: { history: { role: "user", parts: [{ text: question }] } } }
    );

    // Step 1: Analyze the context
    const contextAnalysis = await analyzeAndRefineContext(question);

    console.log(contextAnalysis.response);

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

    // If context is incomplete, return without generating content
    if (!contextAnalysis.complete) {
      return NextResponse.json(
        { message: contextAnalysis.response },
        { status: 200 }
      );
    }

    // Step 2: Generate AI response only if context is complete
    const refinedPrompt = `
      You are an AI-powered social media content creator for ScrollConnect, an event management platform.
      Generate high-quality Instagram content based on the provided context.

      User's input: "${question}"

      Ensure the response is structured with a catchy **hook, main content, and CTA**.
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
