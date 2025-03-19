import mongoose, { Document, Schema } from 'mongoose';

// Define types for the chat schema
interface ChatHistoryPart {
  text: string;
}

interface ChatHistory {
  role: 'user' | 'model';
  parts: ChatHistoryPart[];
}

interface ChatDocument extends Document {
  userId: string;
  history: ChatHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema with type annotations
const chatSchema = new Schema<ChatDocument>(
  {
    userId: {
      type: String,
      required: true,
    },
    history: [
      {
        role: {
          type: String,
          enum: ['user', 'model'],
          required: true,
        },
        parts: [
          {
            text: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Export the model
export default mongoose.models.Chat || mongoose.model<ChatDocument>('Chat', chatSchema);
