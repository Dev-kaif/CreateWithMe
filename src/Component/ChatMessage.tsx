import React, { useMemo } from "react";
import { User, Bot } from "lucide-react";

export type MessageType = "user" | "assistant";

interface ChatMessageProps {
  type: MessageType;
  content: string;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ type, content, isLoading }) => {
  const isUser = type === "user";

  // Memoized content for better performance
  const formattedContent = useMemo(
    () =>
      content.split("\n").map((line, i) => (
        <p key={i} className="mb-1 last:mb-0">{line || "\u00A0"}</p>
      )),
    [content]
  );

  return (
    <div className={`py-3 px-5 sm:px-10 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-2xl w-full flex ${isUser ? "flex-row-reverse" : "flex-row"} items-end gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full shadow-lg flex items-center justify-center 
          ${isUser ? 'bg-blue-600' : 'bg-purple-600'} transition-transform duration-300`}>
          {isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
        </div>

        {/* Message Box */}
        <div
          className={`relative text-white px-5 py-3 rounded-2xl shadow-lg 
          ${isUser ? "bg-blue-600 text-right" : "bg-gray-800/80 backdrop-blur-md"} 
          ${isLoading ? "animate-pulse" : "opacity-100"} transition-all duration-300`}
          style={{
            maxWidth: "75%",
          }}
        >
          <h3 className="text-xs font-semibold text-white/70 mb-1">
            {isUser ? "You" : "Assistant"}
          </h3>

          <div className="prose prose-invert max-w-none text-white text-sm leading-relaxed">
            {formattedContent}
          </div>

          {/* Subtle Glow Effect */}
          <div
            className={`absolute inset-0 rounded-2xl blur-lg opacity-40 
            ${isUser ? "bg-blue-500/20" : "bg-purple-500/20"}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
