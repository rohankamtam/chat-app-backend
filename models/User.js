// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Define the User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true, // Each email must be unique
      lowercase: true, // Store emails in lowercase
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6, // Password must be at least 6 characters
    },
  },
  {
    // 2. Add timestamps
    // This automatically adds `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);

// 3. IMPORTANT: Password Hashing Middleware
// This function runs BEFORE a new user is saved to the database
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password with a cost factor of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  // Use bcrypt to compare the plain text password with the hashed password
  return await bcrypt.compare(enteredPassword, this.password);
};

// 4. Create and Export the User Model
const User = mongoose.model('User', userSchema);

module.exports = User;