import React, { useEffect, useRef, useState } from 'react';
import ChatMessage, { MessageType } from './ChatMessage';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
}

interface ChatContainerProps {
  chatId: string | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fetchAgain: boolean;
}

const ChatContainer = ({ chatId, isLoading, setIsLoading, fetchAgain }: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = async () => {
    if (!chatId) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chats/${chatId}`);
      const chatData = await response.json();

      if (response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedMessages = chatData.history.map((msg: any) => ({
          id: msg._id,
          type: msg.role === "user" ? "user" : "assistant",
          content: msg.parts[0].text,
        }));
        setMessages(formattedMessages);
      } else {
        console.error("Error fetching chat:", chatData.message);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [chatId, fetchAgain]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#121212] px-4 py-6 sm:px-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
      
      {/* Placeholder for no messages */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center flex-grow text-center">
          <h2 className="text-2xl font-semibold text-gray-200">Start a Conversation</h2>
          <p className="text-gray-400 mt-2">Send a message to begin chatting.</p>
        </div>
      )}

      {/* Render Messages */}
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} type={message.type} content={message.content} />
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <ChatMessage type="assistant" content="Thinking..." isLoading />
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;
