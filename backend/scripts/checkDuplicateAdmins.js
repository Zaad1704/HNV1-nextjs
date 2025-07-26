const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function checkDuplicateAdmins() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const superAdmins = await User.find({ role: 'Super Admin' }).select('_id name email createdAt');
    console.log(`\nFound ${superAdmins.length} Super Admin users:`);
    
    superAdmins.forEach((admin, i) => {
      console.log(`${i+1}. ID: ${admin._id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log('');
    });

    // Check for duplicates by email
    const emailCounts = {};
    superAdmins.forEach(admin => {
      emailCounts[admin.email] = (emailCounts[admin.email] || 0) + 1;
    });

    console.log('Email duplicates:');
    Object.entries(emailCounts).forEach(([email, count]) => {
      if (count > 1) {
        console.log(`❌ ${email}: ${count} accounts`);
      } else {
        console.log(`✅ ${email}: ${count} account`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDuplicateAdmins();