import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    // Skip database connection for now
    console.log('⚠️ Database connection skipped - using mock data');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};