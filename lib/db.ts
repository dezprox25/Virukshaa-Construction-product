import mongoose from 'mongoose';

let isConnected = false;

export default async function connectToDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment variables");
  }

  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(uri, { dbName: 'virukshaa-db' });
    isConnected = true;
    console.log("[MongoDB] Connected to:", uri);
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    throw error;
  }
}
