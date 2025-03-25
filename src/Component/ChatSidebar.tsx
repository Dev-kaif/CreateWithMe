import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
} from "lucide-react";

const userId = "123";

type Chat = {
  _id: string;
  title: string;
  timestamp: Date;
};

interface ChatSidebarProps {
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: (chatId: string) => void;
}

const ChatSidebar = ({
  activeChat,
  onChatSelect,
  onNewChat,
}: ChatSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`/api/userchats?userId=${userId}`);
        const data = await response.json();
        setChats(data);

        // If no chats exist, create a new one automatically
        if (data.length === 0 && !isCreatingChat) {
          setIsCreatingChat(true); // Prevent infinite loop
          await handleNewChat();
          setIsCreatingChat(false);
        }
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
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text: "New Chat" }),
      });
      const data = await response.json();
      onNewChat(data.chatId);
      setChats((prev) => [
        { _id: data.chatId, title: "New Chat", timestamp: new Date() },
        ...prev,
      ]);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    setDeletingChatId(chatId);
    try {
      await fetch(`/api/chats?userId=${userId}&chatId=${chatId}`, {
        method: "DELETE",
      });
      setChats((prev) => {
        const newChats = prev.filter((chat) => chat._id !== chatId);
        // If the deleted chat was active, transfer to a new chat.
        if (activeChat === chatId) {
          if (newChats.length > 0) {
            onChatSelect(newChats[0]._id);
          } else {
            // If no chats remain, create a new chat.
            handleNewChat();
          }
        }
        return newChats;
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setDeletingChatId(null);
    }
  };

  const handleUpdateTitle = async (chatId: string) => {
    if (!newTitle.trim()) return;
    try {
      await fetch("/api/chats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, chatId, newTitle }),
      });
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId ? { ...chat, title: newTitle } : chat
        )
      );
      setEditingChat(null);
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  };

  return (
    <div
      className={`h-screen flex flex-col bg-[#1E1E1E] border-r border-gray-800 transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h2 className="text-xl font-medium text-gray-200">Chats</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <div className="px-3 mb-4">
        <button
          onClick={handleNewChat}
          className={`w-full flex items-center rounded-md py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 ${
            collapsed ? "justify-center px-0" : "justify-start pl-3 pr-4"
          }`}
        >
          <PlusCircle size={18} className="flex-shrink-0" />
          {!collapsed && <span className="ml-2">New Chat</span>}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 space-y-1">
          {loading ? (
            <p className="text-gray-400 text-center">Loading...</p>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
                  activeChat === chat._id
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {editingChat === chat._id ? (
                  <input
                    type="text"
                    className="flex-1 bg-gray-800 text-white px-2 py-1 rounded-md"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={() => handleUpdateTitle(chat._id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleUpdateTitle(chat._id)
                    }
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => onChatSelect(chat._id)}
                    className="flex-1 text-left truncate"
                  >
                    <MessageSquare
                      size={16}
                      className="flex-shrink-0 inline-block mr-2"
                    />
                    {!collapsed && chat.title}
                  </button>
                )}
                {!collapsed && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingChat(chat._id);
                        setNewTitle(chat.title);
                      }}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteChat(chat._id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      {deletingChatId === chat._id ? (
                        <div className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No Chat History</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
