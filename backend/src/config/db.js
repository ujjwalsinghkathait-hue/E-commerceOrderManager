import mongoose from 'mongoose';

/**
 * Connects to MongoDB using MONGODB_URI.
 * Throws if URI is missing so the process fails fast in misconfigured environments.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined. Copy .env.example to .env and set MONGODB_URI.'
    );
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);

  const { host } = mongoose.connection;
  console.info(`MongoDB connected: ${host}`);

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
};

export default connectDB;
