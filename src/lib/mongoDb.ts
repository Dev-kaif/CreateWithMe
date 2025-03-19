import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

export default connectDb;
