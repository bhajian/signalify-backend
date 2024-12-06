import { MongoClient, Db } from "mongodb";

let db: Db;

export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI as string; // MongoDB connection string from .env
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db("signalify");
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the application on failure
  }
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error("Database not connected. Call connectDB first.");
  }
  return db;
};
