import mongoose from 'mongoose';

// Cache connection for serverless
let cachedConnection: typeof mongoose | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  // Return cached connection if available (for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  // If connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ MongoDB connection already in progress, waiting...');
    await new Promise(resolve => {
      mongoose.connection.once('connected', resolve);
    });
    return mongoose;
  }

  try {
    console.log('🔌 Initiating MongoDB connection...');
    console.log('📍 Connection string (masked):', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@'));

    const conn = await mongoose.connect(process.env.MONGODB_URI!, {
      // Removed bufferCommands: false - let mongoose handle buffering
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = mongoose;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Add event listeners for debugging
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      cachedConnection = null;
    });

    return conn;
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error Details:', {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    cachedConnection = null;
    throw new Error(`Database connection failed: ${error.message}`);
  }
};
