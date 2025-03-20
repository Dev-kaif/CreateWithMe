# 🚀 AI-Powered Social Media Content Generator

This project is an AI-driven chatbot that generates **engaging social media content** using **Google Gemini API**. The chatbot is designed to analyze user input, check for missing details, and then generate high-quality posts, stories, and taglines for **ScrollConnect**, an event management platform.

## ✨ Features

- **Context Analysis:** Ensures the input contains all necessary details (content type, theme, target audience, tone, etc.).
- **AI-Powered Content Generation:** Generates Instagram posts, stories, captions, and more.
- **Smart Follow-Ups:** If information is missing, the chatbot asks for clarification.
- **Database Integration:** All messages (user inputs and AI responses) are stored in MongoDB.
- **Well-Formatted Responses:** AI ensures proper spacing and readability in replies.

---

## 🛠️ Tech Stack

- **Backend: Next.js (API Routes)**
- **AI:** Google Gemini Free API
- **Database:** MongoDB
- **Frontend: Next.js**

---

## 📂 Project Structure

---

## 🚀 How It Works

### 1️⃣ **User Input**

The user submits a request for content generation. Example:

> "Create an Instagram Story promoting our upcoming hackathon, CodeRush. Target audience is college students, and the tone should be exciting."

### 2️⃣ **AI Context Analysis**

The AI checks for missing details (e.g., content type, theme, target audience) and asks for clarification if needed.

### 3️⃣ **Content Generation**

Once the request is complete, AI generates a structured response:

### 4️⃣ **Response Storage**

All responses (including AI follow-ups) are stored in the database for frontend retrieval.

---

## 🏗️ Installation & Setup

1. **Clone the repository:**
2. **Install dependencies:**
3. **Set up environment variables:**
   Create a `.env` file and add:
4. **Start the server:**

---

## 📌 API Endpoints

### `PUT /api/chats/[id]`

Handles user requests and AI responses.

#### Request Body:

#### Response:

---

## 🤖 Future Improvements

✅ Support for more platforms (Twitter, LinkedIn, Facebook)
✅ Enhanced AI fine-tuning for more dynamic responses
✅ Interactive frontend for better user experience

---

## 💡 Contributing

1. Fork the repo
2. Create a new branch (`feature-xyz`)
3. Commit your changes
4. Open a pull request

---

## 📜 License

This project is licensed under the MIT License.

---

### 🔥 Made with ❤️ for ScrollConnect 🚀

