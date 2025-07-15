// import mongoose from "mongoose";


// // Type for cached connection
// interface CachedConnection {
//   conn: typeof mongoose | null;
//   promise: Promise<typeof mongoose> | null;
// }

// declare global {
//   // This preserves the connection across hot reloads in development
//   // eslint-disable-next-line no-var
//   var mongoose: CachedConnection;
// }

// const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://dezprox25:catlover6208@cluster0.jbcrgrb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// console.log('Attempting to read MONGODB_URI:', MONGODB_URI);

// if (!MONGODB_URI) {
//   throw new Error(
//     'Please define the MONGODB_URI environment variable inside .env.local'
//   );
// }

// // Initialize the cached connection
// let cached: CachedConnection = global.mongoose || { conn: null, promise: null };

// const connectToDB = async () => {
//   console.log('Checking database connection...');
  
//   // If we have a cached connection, return it
//   if (cached.conn) {
//     console.log('✅ Using existing database connection');
//     return cached.conn;
//   }

//   // If we don't have a connection promise, create one
//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//       dbName: 'construction-management',
//     };

//     console.log('🌐 Connecting to MongoDB...');
    
//     cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
//       console.log('✅ Successfully connected to MongoDB');
//       return mongooseInstance;
//     }).catch((error) => {
//       console.error('❌ MongoDB connection error:', error);
//       throw error;
//     });
//   }

//   try {
//     // Wait for the connection to be established
//     cached.conn = await cached.promise;
    
//     // Log connection status
//     const connectionState = mongoose.connection.readyState;
//     const states = {
//       0: 'disconnected',
//       1: 'connected',
//       2: 'connecting',
//       3: 'disconnecting',
//       4: 'uninitialized'
//     };
    
//     console.log(`📊 Database connection state: ${states[connectionState as keyof typeof states]}`);
    
//     // Log when connected
//     const logConnectionDetails = () => {
//       console.log('✅ MongoDB connected successfully');
//       if (mongoose.connection?.db) {
//         console.log(`📊 Database name: ${mongoose.connection.db.databaseName}`);
//         console.log(`👥 Collections: ${Object.keys(mongoose.connection.collections).join(', ')}`);
//       }
//     };
    
//     // Log initial connection
//     logConnectionDetails();
    
//     // Also log on reconnection
//     mongoose.connection.on('connected', logConnectionDetails);
    
//     // Log connection errors
//     mongoose.connection.on('error', (err) => {
//       console.error('❌ MongoDB connection error:', err);
//     });
    
//     // Log disconnection
//     mongoose.connection.on('disconnected', () => {
//       console.log('ℹ️ MongoDB disconnected');
//     });
    
//     return cached.conn;
//   } catch (e) {
//     console.error('❌ Failed to connect to MongoDB:', e);
//     cached.promise = null;
//     throw e;
//   }
// };

// export default connectToDB;
import mongoose, { ConnectOptions } from "mongoose";

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // Prevent type error on global object in strict mode
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb+srv://dezprox25:catlover6208@cluster0.jbcrgrb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables.");
}

let cached: CachedConnection = global.mongoose ?? { conn: null, promise: null };

export default async function connectToDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log("✅ Using cached DB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false,
      dbName: "construction-management",
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("✅ DB connected successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;

    const connectionState = mongoose.connection.readyState;
    const states: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    console.log(`📶 MongoDB status: ${states[connectionState]}`);

    mongoose.connection.on("connected", () => {
      console.log(`🧠 Connected to DB: ${mongoose.connection.db?.databaseName}`);
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ DB Error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ DB Disconnected");
    });

    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

// Assign to global for dev hot-reload safety
if (typeof global !== "undefined") {
  global.mongoose = cached;
}
