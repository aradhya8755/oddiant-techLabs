import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

const uri = process.env.MONGODB_URI

export async function connectToDatabase() {
  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // Connect to the MongoDB database
  const client = new MongoClient(uri)
  await client.connect()

  const dbName = process.env.MONGODB_DB || "oddiant"
  const db = client.db(dbName)

  // Cache the connection
  cachedClient = client
  cachedDb = db

  return { client, db }
}
