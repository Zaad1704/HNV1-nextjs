import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const fixSuperAdminEmail = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all Super Admin users and set their email as verified
    const result = await User.updateMany(
      {
        role: 'Super Admin',
        isEmailVerified: false
      },
      {
        $set: {
          isEmailVerified: true,
          status: 'active'
        }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} Super Admin users`);
    
    // Also fix any users created before email verification was implemented
    const oldUsersResult = await User.updateMany(
      {
        createdAt: { $lt: new Date('2025-01-26T00:00:00.000Z') },
        isEmailVerified: false
      },
      {
        $set: { isEmailVerified: true }
      }
    );
    
    console.log(`Updated ${oldUsersResult.modifiedCount} old users`);
    
  } catch (error) {
    console.error('Fix failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

fixSuperAdminEmail();