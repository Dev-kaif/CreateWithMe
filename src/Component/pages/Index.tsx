"use client";
import React, { useState, useEffect } from "react";
import ChatSidebar from "@/Component/ChatSidebar";
import ChatContainer from "@/Component/ChatContainer";
import ChatInput from "@/Component/ChatInput";
import { Loader2 } from 'lucide-react';

const Home = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [chats, setChats] = useState<{ id: string; title: string }[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNewChat, setIsLoadingNewChat] = useState(false);
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
    setIsLoadingNewChat(true);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } finally {
      setIsLoadingNewChat(false);
    }
  };

  const handleChatInput = () => {
    setFetchAgain((prev) => !prev);
    setIsLoading(true);
  };

  return (
    <div className="relative flex h-screen">
      {isLoadingNewChat && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black opacity-65">
          <Loader2 size={48} className="animate-spin text-white" />
        </div>
      )}
      <ChatSidebar
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-col flex-1 bg-[#121212]">
        <ChatContainer
          fetchAgain={fetchAgain}
          chatId={activeChat}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
        <ChatInput chatId={activeChat} onMessageSent={handleChatInput} />
      </div>
    </div>
  );
};

export default Home;
