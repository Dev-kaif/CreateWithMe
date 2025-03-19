import mongoose, { Document, Schema, Model } from 'mongoose';

// Define types for individual chat entries
interface ChatEntry {
  _id: string;
  title: string;
  createdAt: Date;
}

// Define user chat schema interface
interface UserChatsDocument extends Document {
  userId: string;
  chats: ChatEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// Define Mongoose schema
const userChatsSchema = new Schema<UserChatsDocument>(
  {
    userId: {
      type: String,
      required: true,
    },
    chats: [
      {
        _id: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Export the model
const UserChatsModel: Model<UserChatsDocument> =
  mongoose.models.UserChats || mongoose.model<UserChatsDocument>('UserChats', userChatsSchema);

export default UserChatsModel;
