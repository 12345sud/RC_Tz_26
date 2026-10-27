import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'google_contacts_db';

let client;
let clientPromise;

if (uri && uri.trim().startsWith('mongodb')) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect();
  }
} else {
  clientPromise = null;
}

export async function getMongoClient() {
  if (!clientPromise) return null;
  try {
    const connectedClient = await clientPromise;
    return connectedClient;
  } catch (err) {
    console.warn('[MongoDB] Connection failed, using in-memory/file fallback:', err.message);
    return null;
  }
}

export async function getDb() {
  const connectedClient = await getMongoClient();
  if (!connectedClient) return null;
  return connectedClient.db(dbName);
}

export default clientPromise;
