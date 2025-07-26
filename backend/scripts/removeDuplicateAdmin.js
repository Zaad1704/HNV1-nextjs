const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function removeDuplicateAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the older admin (alhaz.halim@gmail.com) and remove it
    const olderAdmin = await User.findOne({ email: 'alhaz.halim@gmail.com', role: 'Super Admin' });
    
    if (olderAdmin) {
      console.log('Found older admin:', olderAdmin.email);
      console.log('Created:', olderAdmin.createdAt);
      
      // Delete the older admin
      await User.deleteOne({ _id: olderAdmin._id });
      console.log('✅ Removed older Super Admin account:', olderAdmin.email);
    } else {
      console.log('No duplicate admin found');
    }

    // Verify only one admin remains
    const remainingAdmins = await User.find({ role: 'Super Admin' }).select('email name createdAt');
    console.log(`\nRemaining Super Admin accounts: ${remainingAdmins.length}`);
    remainingAdmins.forEach(admin => {
      console.log(`- ${admin.email} (${admin.name})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeDuplicateAdmin();