import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  // Get MongoDB URI from environment variables
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error("MONGODB_URI is not defined")
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    console.log("Using cached database connection")
    return { client: cachedClient, db: cachedDb }
  }

  try {
    console.log("Creating new database connection")

    // Connect to the MongoDB database with improved options
    const client = new MongoClient(uri, {
      // Add connection timeout
      connectTimeoutMS: 10000,
      // Add socket timeout
      socketTimeoutMS: 30000,
      // Add server selection timeout
      serverSelectionTimeoutMS: 10000,
    })

    console.log("Connecting to MongoDB...")
    await client.connect()
    console.log("Connected to MongoDB successfully")

    const dbName = process.env.MONGODB_DB || "oddiant"
    console.log(`Using database: ${dbName}`)
    const db = client.db(dbName)

    // Cache the connection
    cachedClient = client
    cachedDb = db
    console.log("Database connection cached")

    return { client, db }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`)
  }
}
