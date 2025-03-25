import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Loader2, Image as ImageIcon, X } from 'lucide-react';

interface ChatInputProps {
  chatId: string | null;
  onMessageSent: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({ chatId, onMessageSent, disabled = false, placeholder = "Type a message..." }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // 🔹 Ref for resetting file input

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // ✅ Handle image selection and reset input
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview); // ✅ Cleanup old preview URL
      }

      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile)); // ✅ Store new preview URL

      // Reset input field to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // ✅ Reset input
      }
    }
  };

  // ✅ Cleanup preview URL when image changes or component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ✅ Remove selected image
  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview); 
    }
    setImage(null);
    setImagePreview(null);
  };

  // ✅ Handle message send
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId || (!message.trim() && !image) || disabled || isLoading) return;
  
    setIsLoading(true);
  
    const formData = new FormData();
    formData.append('question', message);
  
    if (image) {
      formData.append('image', image);
    }
  
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        body: formData,
      });
  
      if (!response.ok) {
        console.error("Failed to send message");
        const errorText = await response.text();
        console.error("Server Response:", errorText);
      } else {
        onMessageSent();
        setMessage('');
        removeImage(); 
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle Enter key for message sending
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
          <div className={`flex items-end bg-gray-900 border border-gray-700 rounded-xl p-3 focus-within:border-purple-500 transition-all ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
            {/* Image Upload */}
            <input ref={fileInputRef} type="file" accept="image/*" hidden id="image-upload" onChange={handleImageUpload} />
            <label htmlFor="image-upload" className="cursor-pointer p-2 text-white hover:bg-gray-700 rounded-md">
              <ImageIcon size={24} />
            </label>

            {/* Message Input */}
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

            {/* Send Button */}
            <button
              type="submit"
              disabled={disabled || (!message.trim() && !image) || isLoading}
              className={`ml-3 h-12 w-12 rounded-full flex items-center justify-center transition-all ${message.trim() || image ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-700 opacity-50"} text-white`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <SendHorizontal size={20} />}
            </button>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-2 flex items-center space-x-2 bg-gray-800 p-2 rounded-md">
              <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
              <button onClick={removeImage} className="text-red-500 hover:text-red-700">
                <X size={20} />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
