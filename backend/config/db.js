const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerconnect';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Failed to connect: ${error.message}`);
    console.error(`[MongoDB Error] Please ensure MONGODB_URI environment variable is configured in Render.`);
  }
};

module.exports = connectDB;

