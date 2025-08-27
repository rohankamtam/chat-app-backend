const mongoose = require('mongoose');

const connectDB = async () => {
  // Log to confirm the function is being called and what URI is being used
  console.log('Attempting to connect to MongoDB...');
  console.log(`Using URI: ${process.env.MONGO_URI ? 'Loaded' : 'Not Loaded'}`);

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // This will now log the full error object, giving us more details
    console.error('--- MONGODB CONNECTION FAILED ---');
    console.error(error);
    console.error('---------------------------------');
    process.exit(1);
  }
};

module.exports = connectDB;