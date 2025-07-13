import mongoose, { Connection } from "mongoose";

// Type for cached connection
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // This preserves the connection across hot reloads in development
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Initialize the cached connection
let cached: CachedConnection = global.mongoose || { conn: null, promise: null };

const connectToDB = async () => {
  console.log('Checking database connection...');
  
  // If we have a cached connection, return it
  if (cached.conn) {
    console.log('✅ Using existing database connection');
    return cached.conn;
  }

  // If we don't have a connection promise, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'construction-management',
    };

    console.log('🌐 Connecting to MongoDB...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✅ Successfully connected to MongoDB');
      return mongooseInstance;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    });
  }

  try {
    // Wait for the connection to be established
    cached.conn = await cached.promise;
    
    // Log connection status
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      4: 'uninitialized'
    };
    
    console.log(`📊 Database connection state: ${states[connectionState as keyof typeof states]}`);
    
    // Log when connected
    const logConnectionDetails = () => {
      console.log('✅ MongoDB connected successfully');
      if (mongoose.connection?.db) {
        console.log(`📊 Database name: ${mongoose.connection.db.databaseName}`);
        console.log(`👥 Collections: ${Object.keys(mongoose.connection.collections).join(', ')}`);
      }
    };
    
    // Log initial connection
    logConnectionDetails();
    
    // Also log on reconnection
    mongoose.connection.on('connected', logConnectionDetails);
    
    // Log connection errors
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    // Log disconnection
    mongoose.connection.on('disconnected', () => {
      console.log('ℹ️ MongoDB disconnected');
    });
    
    return cached.conn;
  } catch (e) {
    console.error('❌ Failed to connect to MongoDB:', e);
    cached.promise = null;
    throw e;
  }
};

export default connectToDB;