"use client";
import React, { useState, useEffect } from 'react';
import ChatSidebar from '@/Component/ChatSidebar';
import ChatContainer from '@/Component/ChatContainer';
import ChatInput from '@/Component/ChatInput';

const Home = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [chats, setChats] = useState<{ id: string; title: string }[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchAgain, setFetchAgain] = useState(false);
  const userId = "123";

  // Fetch user chats on load
  const fetchUserChats = async () => {
    try {
      const res = await fetch(`/api/userchats?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setChats(data);
      } else {
        console.error("Error fetching chats:", data.message);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    fetchUserChats();
  }, []);

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
  };

  // Handle new chat creation
  const handleNewChat = async () => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text: "New Chat" }),
      });

      const data = await res.json();
      if (res.ok) {
        setChats((prev) => [{ id: data.chatId, title: "New Chat" }, ...prev]);
        setActiveChat(data.chatId);
      } else {
        console.error("Error creating chat:", data.message);
      }
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  const handleChatInput = () =>{
    setFetchAgain((prev)=>!prev);
    setIsLoading(true);
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar activeChat={activeChat} onChatSelect={handleChatSelect} onNewChat={handleNewChat} />
      <div className="flex flex-col flex-1 bg-[#121212]">
        <ChatContainer fetchAgain={fetchAgain} chatId={activeChat} isLoading={isLoading} setIsLoading={setIsLoading} />
        <ChatInput chatId={activeChat} onMessageSent={handleChatInput} />
      </div>
    </div>
  );
};

export default Home;
