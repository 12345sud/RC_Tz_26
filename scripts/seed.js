const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Try to read .env.local if present
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

async function seed() {
  console.log('\n=============================================');
  console.log('🤖 RC ARCADE - DATABASE SEEDING UTILITY');
  console.log('=============================================\n');

  if (!uri || !uri.trim().startsWith('mongodb')) {
    console.error('❌ Error: MONGODB_URI is not set in .env.local!');
    console.log('👉 Please set MONGODB_URI in your .env.local file');
    console.log('💡 Note: The application will continue to work fine with the local contacts_mql.js file in the meantime!\n');
    process.exit(1);
  }

  const contactsFile = path.join(__dirname, '..', 'contacts_mql.js');
  if (!fs.existsSync(contactsFile)) {
    console.error(`❌ Error: Could not find ${contactsFile}`);
    process.exit(1);
  }

  console.log(`📖 Reading ${contactsFile}...`);
  const content = fs.readFileSync(contactsFile, 'utf8');
  const start = content.indexOf('[');
  const end = content.lastIndexOf(']');
  if (start === -1 || end === -1) {
    console.error('❌ Error: Could not locate contacts JSON array in contacts_mql.js');
    process.exit(1);
  }

  console.log('⚙️  Parsing contacts JSON...');
  const jsonStr = content.substring(start, end + 1);
  const contacts = JSON.parse(jsonStr);
  console.log(`✅ Loaded ${contacts.length} student contact records from file.`);

  console.log(`🔌 Connecting to MongoDB database: "${dbName}"...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected successfully to MongoDB!');
    const db = client.db(dbName);
    const collection = db.collection('contacts');

    console.log('📌 Creating index on "rollNumber"...');
    await collection.createIndex({ rollNumber: 1 }, { unique: true });

    console.log(`🚀 Bulk upserting ${contacts.length} records into "contacts" collection...`);
    const batchSize = 1000;
    let processed = 0;

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      const operations = batch.map(c => ({
        updateOne: {
          filter: { rollNumber: (c.rollNumber || '').trim().toUpperCase() },
          update: {
            $set: {
              name: (c.name || '').trim(),
              mail: (c.mail || '').trim(),
              rollNumber: (c.rollNumber || '').trim().toUpperCase(),
              updatedAt: new Date()
            }
          },
          upsert: true
        }
      }));

      await collection.bulkWrite(operations, { ordered: false });
      processed += batch.length;
      process.stdout.write(`   ... Processed ${processed} / ${contacts.length} records\r`);
    }

    console.log(`\n🎉 Success! All ${contacts.length} student contacts are now stored in MongoDB.`);
    
    // Ensure indexes on leaderboard and waiting_list
    console.log('📌 Initializing collections & indexes for "waiting_list" and "leaderboard"...');
    await db.collection('waiting_list').createIndex({ registeredAt: 1 });
    await db.collection('waiting_list').createIndex({ rollNumber: 1 });
    await db.collection('leaderboard').createIndex({ playerScore: -1, playedAt: -1 });

    const totalStudents = await collection.countDocuments();
    console.log(`📊 Verified total student records in database: ${totalStudents}`);
    console.log('\n✨ Database setup complete! You are ready to run the tournament!\n');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await client.close();
  }
}

seed();
