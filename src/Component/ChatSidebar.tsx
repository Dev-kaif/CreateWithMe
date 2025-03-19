// ChatSidebar.tsx
import React, { useEffect, useState } from 'react';
import { PlusCircle, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

const userId = "123";

type Chat = {
  id: string;
  title: string;
  timestamp: Date;
};

interface ChatSidebarProps {
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: (chatId: string) => void;
}

const ChatSidebar = ({ activeChat, onChatSelect, onNewChat }: ChatSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`/api/userchats?userId=${userId}`);
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text: 'New Chat' }),
      });
      const data = await response.json();
      onNewChat(data.chatId);
      setChats((prev) => [{ id: data.chatId, title: 'New Chat', timestamp: new Date() }, ...prev]);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-[#1E1E1E] border-r border-gray-800 transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-72"}`}>
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h2 className="text-xl font-medium text-gray-200">Chats</h2>}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <div className="px-3 mb-4">
        <button onClick={handleNewChat} className={`w-full flex items-center rounded-md py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 ${collapsed ? "justify-center px-0" : "justify-start pl-3 pr-4"}`}>
          <PlusCircle size={18} className="flex-shrink-0" />
          {!collapsed && <span className="ml-2">New Chat</span>}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 space-y-1">
          {loading ? <p className="text-gray-400 text-center">Loading...</p> : chats.length > 0 ? chats.map((chat) => (
            <button key={Math.random()} onClick={() => onChatSelect(chat.id)} className={`w-full flex items-center rounded-md px-3 py-2 text-sm transition-colors duration-200 ${activeChat === chat.id ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} ${collapsed ? "justify-center px-0" : "justify-start"}`}>
              <MessageSquare size={16} className="flex-shrink-0" />
              {!collapsed && <div className="ml-2 flex-1 truncate text-left">{chat.title}</div>}
            </button>
          )) : <p className="text-gray-400 text-center">No Chat History</p>}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;