import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  // Get MongoDB URI from environment variables
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    // Connect to the MongoDB database
    const client = new MongoClient(uri)
    await client.connect()

    const dbName = process.env.MONGODB_DB || "oddiant"
    const db = client.db(dbName)

    // Cache the connection
    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error("Failed to connect to database")
  }
}
