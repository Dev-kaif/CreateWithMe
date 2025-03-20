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

const ChatContainer = ({ chatId, isLoading, setIsLoading,fetchAgain }: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = async () => {
    if (!chatId) return;
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/api/chats/${chatId}`);
      
      const chatData = await response.json();

      if (response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedMessages = chatData.history.map((msg: any) => ({
          id: msg._id,
          type: msg.role === "user" ? "user" : "model",
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
  }, [chatId,fetchAgain]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-10 px-4 text-center">
          <h2 className="text-2xl font-medium text-white">Start a conversation</h2>
          <p className="text-white/70">Send a message to begin chatting.</p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage key={message.id} type={message.type} content={message.content} />
        ))
      )}
      {isLoading && <ChatMessage type="assistant" content="Thinking..." isLoading />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContainer;
