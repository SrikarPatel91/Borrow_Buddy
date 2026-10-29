const mongoose = require('mongoose');

let isConnected = false;

/**
 * Reusable MongoDB Connection Module
 * Connects to MongoDB Atlas or local MongoDB using MONGODB_URI from environment variables.
 */
const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    const errorMsg = 'MONGODB_URI is not defined in environment variables (server/.env)';
    console.error(`❌ [MongoDB Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Ensure database name is included when using MongoDB Atlas SRV URI
  if (mongoUri.includes('mongodb.net') && !mongoUri.includes('mongodb.net/')) {
    mongoUri = mongoUri.replace('mongodb.net', 'mongodb.net/borrowbuddy');
  } else if (mongoUri.endsWith('mongodb.net/')) {
    mongoUri = `${mongoUri}borrowbuddy`;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = true;
    console.log('----------------------------------------------------');
    console.log(`✅ [MongoDB Atlas] Connected successfully!`);
    console.log(`   Host:     ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port:     ${conn.connection.port || 'Default'}`);
    console.log('----------------------------------------------------');

    return conn;
  } catch (error) {
    isConnected = false;
    console.error('----------------------------------------------------');
    console.error(`❌ [MongoDB Atlas Connection Error]: ${error.message}`);
    console.error('   Please check:');
    console.error('   1. MongoDB Atlas Network Access: Ensure IP address 0.0.0.0/0 (or current IP) is whitelisted.');
    console.error('   2. Database User credentials: Ensure username and password in MONGODB_URI are correct.');
    console.error('   3. Network connectivity to mongodb.net clusters.');
    console.error('----------------------------------------------------');
    throw error;
  }
};

const checkDbConnection = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, checkDbConnection };
