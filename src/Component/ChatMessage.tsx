import React, { useState } from "react";
import { User, Bot, Clipboard, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

export type MessageType = "user" | "assistant";

interface ChatMessageProps {
  type: MessageType;
  content: string;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ type, content, isLoading }) => {
  const isUser = type === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Reset after 1.5 sec
  };

  return (
    <div className={`py-4 px-6 sm:px-12 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-3xl w-full flex ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-4`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full shadow-md flex items-center justify-center 
          ${isUser ? 'bg-blue-600' : 'bg-purple-600'} transition-transform duration-300`}>
          {isUser ? <User size={22} className="text-white" /> : <Bot size={22} className="text-white" />}
        </div>

        {/* Message Box */}
        <div
          className={`relative text-white px-6 py-4 rounded-2xl shadow-lg w-fit 
          ${isUser ? "bg-blue-600 text-right" : "bg-gray-800/90 backdrop-blur-md"} 
          ${isLoading ? "animate-pulse" : "opacity-100"} transition-all duration-300`}
          style={{
            maxWidth: "80%",
            lineHeight: "1.75",
          }}
        >
          {/* Copy Button (Only for AI messages) */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 rounded-md text-white/60 hover:text-white transition-all 
              z-10 focus:outline-none active:scale-95"
            >
              {copied ? (
                <Check size={18} className="text-green-400 animate-fade" />
              ) : (
                <Clipboard size={18} />
              )}
            </button>
          )}

          {/* Clickable Area Fix */}
          <div className="relative z-0 w-full cursor-text">
            <h3 className="text-xs font-semibold text-white/70 mb-2">
              {isUser ? "You" : "Assistant"}
            </h3>

            <div className="prose prose-invert max-w-none text-left text-white text-base leading-7">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>

          {/* Subtle Glow Effect */}
          <div
            className={`absolute inset-0 rounded-2xl blur-lg opacity-40 
            ${isUser ? "bg-blue-500/20" : "bg-purple-500/20"} pointer-events-none`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
