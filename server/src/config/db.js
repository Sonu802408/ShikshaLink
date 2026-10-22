import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  try {
    const mongoURI = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shikshalink';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[MongoDB] Connection error: ${err.message}`);
    throw err;
  }
};
