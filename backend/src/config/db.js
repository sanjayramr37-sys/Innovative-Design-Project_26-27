const mongoose = require('mongoose');

/**
 * Connect to MongoDB with robust connection events and auto-reconnect handling.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediguardian';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Allow application to run in fallback / offline state if DB is unreachable during development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('[Database Warning] Running in development mode without active MongoDB. Ensure MongoDB is running locally or provide MONGODB_URI in .env.');
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Error] Runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database Warning] MongoDB disconnected.');
  });
};

module.exports = connectDB;
