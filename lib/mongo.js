import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'brainmate';

let cachedClient = null;
let cachedDb = null;

export async function getDb() {
  if (cachedDb && cachedClient) return cachedDb;
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db(dbName);
  // Ensure useful indexes (idempotent)
  try {
    await cachedDb
      .collection('history')
      .createIndex({ user_id: 1, created_at: -1 });
    await cachedDb.collection('history').createIndex({ id: 1 }, { unique: true });
    await cachedDb
      .collection('user_stats')
      .createIndex({ user_id: 1 }, { unique: true });
  } catch (e) {
    // ignore index creation race in dev
  }
  return cachedDb;
}

export async function getHistoryCollection() {
  const db = await getDb();
  return db.collection('history');
}

export async function getStatsCollection() {
  const db = await getDb();
  return db.collection('user_stats');
}
