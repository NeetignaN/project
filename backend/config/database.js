import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

class Database {
  constructor() {
    this.client = new MongoClient(process.env.MONGO_URI);
    this.db = null;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db("Interiora");
      console.log("✅ Connected to MongoDB");
      return this.db;
    } catch (error) {
      console.error("❌ Error connecting to MongoDB:", error);
      throw error;
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  async close() {
    try {
      await this.client.close();
      console.log("📴 Disconnected from MongoDB");
    } catch (error) {
      console.error("❌ Error closing MongoDB connection:", error);
    }
  }
}

export default new Database();
