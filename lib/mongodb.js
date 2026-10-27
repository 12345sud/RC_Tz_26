import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'google_contacts_db';

let client = null;
let clientPromise = null;

export async function getMongoClient() {
  if (!uri || !uri.trim().startsWith('mongodb')) {
    return null;
  }

  try {
    if (!client) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      });
    }

    if (!clientPromise) {
      clientPromise = client.connect().catch((err) => {
        client = null;
        clientPromise = null;
        throw err;
      });
    }

    const connectedClient = await clientPromise;
    return connectedClient;
  } catch (err) {
    // Graceful fallback without crashing
    client = null;
    clientPromise = null;
    return null;
  }
}

export async function getDb() {
  try {
    const connectedClient = await getMongoClient();
    if (!connectedClient) return null;
    return connectedClient.db(dbName);
  } catch (err) {
    return null;
  }
}

export default getMongoClient;
