import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  chatId: string | null;
  onMessageSent: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({ chatId, onMessageSent, disabled = false, placeholder = "Type a message..." }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId || !message.trim() || disabled) return;

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message, answer: "" }),
      });

      if (!response.ok) {
        console.error("Failed to send message");
      } else {
        onMessageSent();
        setMessage('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-800 bg-[#121212] px-4 py-3 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`flex items-center bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2 
              focus-within:border-purple-500 transition-all ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full resize-none bg-transparent py-2 text-white placeholder:text-white/40 focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={disabled || !message.trim()}
              className={`ml-3 h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                message.trim() ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-700 opacity-50"
              } text-white`}
            >
              <SendHorizontal size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
