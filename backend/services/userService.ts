import User from '../models/User';
import bcrypt from 'bcryptjs';

class UserService {
  async createUser(userData: any) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await User.findById(userId).select('-password');
      return user;
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      console.error('Failed to get user by email:', error);
      return null;
    }
  }

  async updateUser(userId: string, updateData: any) {
    try {
      const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
      return user;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  async validatePassword(plainPassword: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Failed to validate password:', error);
      return false;
    }
  }
}

export default new UserService();