
import React from 'react';
import { User, Bot } from 'lucide-react';

export type MessageType = 'user' | 'assistant';

interface ChatMessageProps {
  type: MessageType;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

const ChatMessage = ({ type, content, timestamp, isLoading }: ChatMessageProps) => {
  const isUser = type === 'user';
  
  return (
    <div className={`py-6 px-4 sm:px-6 ${isUser ? "bg-transparent" : "bg-gray-800/30"}`}>
      <div className="max-w-4xl mx-auto flex gap-4 sm:gap-6">
        <div className="flex-shrink-0 mt-1">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
            isUser ? "bg-blue-600" : "bg-purple-600"
          }`}>
            {isUser ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <h3 className="text-sm font-medium text-white/90">
              {isUser ? "You" : "Assistant"}
            </h3>
            <span className="ml-2 text-xs text-white/50">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className={`prose prose-invert max-w-none ${isLoading ? "animate-pulse" : ""}`}>
            {content.split('\n').map((line, i) => (
              <p key={i} className="mb-2 last:mb-0">
                {line || "\u00A0"}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
