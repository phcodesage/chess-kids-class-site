import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.monggodb_uri;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri as string);
  await client.connect();
  const db = client.db("chess-kids-class");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getZellePaymentsCollection() {
  const { db } = await connectToDatabase();
  return db.collection("zellePayments");
}
