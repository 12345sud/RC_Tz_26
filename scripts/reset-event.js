const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'google_contacts_db';

async function resetEventData() {
  console.log('\n=============================================');
  console.log('🧹 RC ARCADE - EVENT DATA CLEANUP UTILITY');
  console.log('=============================================\n');

  // 1. Clean local fallback files if any
  const dataDir = path.join(__dirname, '..', 'data');
  const waitingFile = path.join(dataDir, 'waiting_list.json');
  const leaderboardFile = path.join(dataDir, 'leaderboard.json');

  if (fs.existsSync(waitingFile)) {
    fs.writeFileSync(waitingFile, '[]', 'utf8');
    console.log('✅ Local waiting list cleared.');
  }
  if (fs.existsSync(leaderboardFile)) {
    fs.writeFileSync(leaderboardFile, '[]', 'utf8');
    console.log('✅ Local leaderboard cleared.');
  }

  // 2. Clean MongoDB collections (preserves contacts collection!)
  if (uri && uri.trim().startsWith('mongodb')) {
    console.log(`🔌 Connecting to MongoDB: "${dbName}"...`);
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db(dbName);

      const delWaiting = await db.collection('waiting_list').deleteMany({});
      console.log(`🗑️  Deleted ${delWaiting.deletedCount} items from "waiting_list" collection.`);

      const delScores = await db.collection('leaderboard').deleteMany({});
      console.log(`🗑️  Deleted ${delScores.deletedCount} scores from "leaderboard" collection.`);

      const studentCount = await db.collection('contacts').countDocuments();
      console.log(`🔒 Preserved ${studentCount} registered student contacts in database.`);

      console.log('\n✨ Tournament match data has been successfully reset to zero!');
      console.log('🚀 Ready fresh for the event!\n');
    } catch (err) {
      console.error('MongoDB cleanup error:', err.message);
    } finally {
      await client.close();
    }
  }
}

resetEventData();
