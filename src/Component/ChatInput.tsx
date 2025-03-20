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
        body: JSON.stringify({ question: message, answer: "" }), // Empty answer, will be handled on backend
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
    <div className="border-t border-gray-800 bg-[#1A1A1A] py-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`rounded-lg overflow-hidden border border-gray-700 focus-within:border-purple-500 ${disabled ? "opacity-60" : ""}`}>
            <div className="flex items-end">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className="min-h-[40px] w-full resize-none bg-transparent py-3 pl-4 pr-12 text-white placeholder:text-white/40 focus:outline-none disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={disabled || !message.trim()}
                className={`absolute bottom-1.5 right-1.5 h-8 w-8 rounded-md ${
                  message.trim() ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-700"
                } text-white/90 flex items-center justify-center transition-colors ${
                  !message.trim() ? "opacity-60" : ""
                }`}
              >
                <SendHorizontal size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
