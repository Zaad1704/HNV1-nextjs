const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Landlord' },
  status: { type: String, default: 'active' },
  isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

async function createSuperAdmin() {
  try {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';
    
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if super admin exists
    const existingAdmin = await User.findOne({ email: 'admin@hnvpm.com' });
    if (existingAdmin) {
      console.log('✅ Super Admin already exists');
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'admin@hnvpm.com',
      password: 'Admin123!',
      role: 'Super Admin',
      status: 'active',
      isEmailVerified: true
    });

    await superAdmin.save();
    console.log('✅ Super Admin created successfully');
    console.log('Email: admin@hnvpm.com');
    console.log('Password: Admin123!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();