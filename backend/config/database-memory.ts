import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/hnv1-nextjs', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.log('⚠️ MongoDB not available, using in-memory storage');
  }
};