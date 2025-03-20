import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';

interface ChatInputProps {
  chatId: string | null;
  onMessageSent: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({ chatId, onMessageSent, disabled = false, placeholder = "Type a message..." }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    if (!chatId || !message.trim() || disabled || isLoading) return;

    setMessage(''); // Text disappears immediately
    setIsLoading(true); // Start loading

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
        setIsLoading(false); // Stop loading
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-800 bg-[#121212] px-4 py-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`flex items-end bg-gray-900 border border-gray-700 rounded-xl p-3 
              focus-within:border-purple-500 transition-all ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              rows={3}
              className="w-full resize-none bg-transparent text-white placeholder:text-white/40 focus:outline-none disabled:cursor-not-allowed text-lg p-2 leading-6"
            />
            <button
              type="submit"
              disabled={disabled || !message.trim() || isLoading}
              className={`ml-3 h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                message.trim() && !isLoading ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-700 opacity-50"
              } text-white`}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <SendHorizontal size={20} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
