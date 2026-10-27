import fs from 'fs';
import path from 'path';
import { getDb } from './mongodb';

// Directory for local persistent fallbacks
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const WAITING_LIST_FILE = path.join(DATA_DIR, 'waiting_list.json');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');
const MANUAL_CONTACTS_FILE = path.join(DATA_DIR, 'manual_contacts.json');

// In-memory cache for contacts loaded from contacts_mql.js
let cachedContactsMap = null;

function loadContactsFromFile() {
  if (cachedContactsMap) return cachedContactsMap;

  const contactsMap = new Map();
  try {
    const filePath = path.join(process.cwd(), 'contacts_mql.js');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const start = content.indexOf('[');
      const end = content.lastIndexOf(']');
      if (start !== -1 && end !== -1) {
        const jsonStr = content.substring(start, end + 1);
        const contacts = JSON.parse(jsonStr);
        contacts.forEach(c => {
          if (c.rollNumber) {
            contactsMap.set(c.rollNumber.trim().toUpperCase(), {
              name: c.name || '',
              mail: c.mail || '',
              rollNumber: c.rollNumber.trim().toUpperCase()
            });
          }
        });
      }
    }
  } catch (err) {
    console.error('[DataService] Error parsing contacts_mql.js:', err);
  }

  // Also overlay any manually registered contacts saved locally
  try {
    if (fs.existsSync(MANUAL_CONTACTS_FILE)) {
      const manual = JSON.parse(fs.readFileSync(MANUAL_CONTACTS_FILE, 'utf8'));
      manual.forEach(c => {
        if (c.rollNumber) {
          contactsMap.set(c.rollNumber.trim().toUpperCase(), c);
        }
      });
    }
  } catch (err) {
    console.error('[DataService] Error reading manual_contacts.json:', err);
  }

  cachedContactsMap = contactsMap;
  return cachedContactsMap;
}

function readLocalJson(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`[DataService] Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

function writeLocalJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[DataService] Error writing ${filePath}:`, err);
  }
}

/**
 * Find student by Roll Number (checks MongoDB first, falls back to parsed contacts_mql.js)
 */
export async function findStudentByRoll(rollNumber) {
  if (!rollNumber) return null;
  const cleanRoll = rollNumber.trim().toUpperCase();

  const db = await getDb();
  if (db) {
    try {
      const student = await db.collection('contacts').findOne({
        rollNumber: { $regex: new RegExp(`^${cleanRoll}$`, 'i') }
      });
      if (student) {
        return {
          name: student.name,
          mail: student.mail || '',
          rollNumber: student.rollNumber
        };
      }
    } catch (err) {
      console.warn('[DataService] MongoDB student query failed, using local contacts:', err.message);
    }
  }

  // Fallback to in-memory/file map
  const map = loadContactsFromFile();
  return map.get(cleanRoll) || null;
}

/**
 * Register or update student details
 */
export async function registerStudent({ rollNumber, name, mail }) {
  if (!rollNumber) throw new Error('Roll number is required');
  const cleanRoll = rollNumber.trim().toUpperCase();
  const studentData = {
    rollNumber: cleanRoll,
    name: name ? name.trim() : `Student ${cleanRoll}`,
    mail: mail ? mail.trim() : ''
  };

  const db = await getDb();
  if (db) {
    try {
      await db.collection('contacts').updateOne(
        { rollNumber: cleanRoll },
        { $set: studentData },
        { upsert: true }
      );
    } catch (err) {
      console.warn('[DataService] MongoDB student save failed, writing locally:', err.message);
    }
  }

  // Save to local manual list and cache
  const map = loadContactsFromFile();
  map.set(cleanRoll, studentData);

  const manualList = readLocalJson(MANUAL_CONTACTS_FILE, []);
  const existingIdx = manualList.findIndex(c => c.rollNumber === cleanRoll);
  if (existingIdx >= 0) {
    manualList[existingIdx] = studentData;
  } else {
    manualList.push(studentData);
  }
  writeLocalJson(MANUAL_CONTACTS_FILE, manualList);

  return studentData;
}

/**
 * Get active Waiting List (FIFO order)
 */
export async function getWaitingList() {
  const db = await getDb();
  if (db) {
    try {
      const list = await db.collection('waiting_list')
        .find({ status: { $ne: 'completed' } })
        .sort({ registeredAt: 1 })
        .toArray();
      return list.map(item => ({
        id: item._id.toString(),
        rollNumber: item.rollNumber,
        name: item.name,
        mail: item.mail,
        source: item.source || 'RFID',
        registeredAt: item.registeredAt
      }));
    } catch (err) {
      console.warn('[DataService] MongoDB waiting list read failed, falling back to local file:', err.message);
    }
  }

  const list = readLocalJson(WAITING_LIST_FILE, []);
  return list.filter(item => item.status !== 'completed');
}

/**
 * Add a player to the Waiting List
 */
export async function addToWaitingList({ rollNumber, name, mail, source = 'RFID' }) {
  if (!rollNumber) throw new Error('Roll number is required');
  const cleanRoll = rollNumber.trim().toUpperCase();

  // If name not provided, auto-lookup from student database
  let resolvedName = name ? name.trim() : null;
  let resolvedMail = mail ? mail.trim() : '';

  if (!resolvedName) {
    const student = await findStudentByRoll(cleanRoll);
    if (student) {
      resolvedName = student.name;
      resolvedMail = resolvedMail || student.mail || '';
    } else {
      resolvedName = `Player (${cleanRoll})`;
    }
  }

  const newEntry = {
    id: 'wait_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    rollNumber: cleanRoll,
    name: resolvedName,
    mail: resolvedMail,
    source,
    status: 'waiting',
    registeredAt: new Date().toISOString()
  };

  const db = await getDb();
  if (db) {
    try {
      const res = await db.collection('waiting_list').insertOne({
        ...newEntry,
        _id: undefined
      });
      newEntry.id = res.insertedId.toString();
    } catch (err) {
      console.warn('[DataService] MongoDB waiting list insert failed, storing locally:', err.message);
    }
  }

  const currentList = readLocalJson(WAITING_LIST_FILE, []);
  currentList.push(newEntry);
  writeLocalJson(WAITING_LIST_FILE, currentList);

  return newEntry;
}

/**
 * Remove an item from the waiting list (e.g. when played or cancelled)
 */
export async function removeFromWaitingList(idOrRoll) {
  const db = await getDb();
  if (db) {
    try {
      const { ObjectId } = require('mongodb');
      let query;
      try {
        query = { _id: new ObjectId(idOrRoll) };
      } catch {
        query = { rollNumber: idOrRoll.toUpperCase() };
      }
      await db.collection('waiting_list').deleteOne(query);
    } catch (err) {
      console.warn('[DataService] MongoDB waiting list delete failed:', err.message);
    }
  }

  const currentList = readLocalJson(WAITING_LIST_FILE, []);
  const updated = currentList.filter(item => item.id !== idOrRoll && item.rollNumber !== idOrRoll.toUpperCase());
  writeLocalJson(WAITING_LIST_FILE, updated);
  return { success: true };
}

/**
 * Get Leaderboard: Top 10 scores and total player count
 */
export async function getLeaderboard(limit = 10) {
  const db = await getDb();
  if (db) {
    try {
      const totalCount = await db.collection('leaderboard').countDocuments();
      const topScores = await db.collection('leaderboard')
        .find()
        .sort({ playerScore: -1, playedAt: -1 })
        .limit(limit)
        .toArray();

      return {
        totalPlayed: totalCount,
        leaderboard: topScores.map((item, idx) => ({
          id: item._id.toString(),
          rank: idx + 1,
          playerName: item.playerName,
          rollNumber: item.rollNumber,
          playerScore: item.playerScore,
          robotScore: item.robotScore,
          result: item.result || (item.playerScore > item.robotScore ? 'WON' : item.playerScore < item.robotScore ? 'LOST' : 'DRAW'),
          playedAt: item.playedAt
        }))
      };
    } catch (err) {
      console.warn('[DataService] MongoDB leaderboard query failed, reading locally:', err.message);
    }
  }

  const allScores = readLocalJson(LEADERBOARD_FILE, []);
  const sorted = [...allScores].sort((a, b) => {
    if (b.playerScore !== a.playerScore) {
      return b.playerScore - a.playerScore;
    }
    return new Date(b.playedAt) - new Date(a.playedAt);
  });

  return {
    totalPlayed: allScores.length,
    leaderboard: sorted.slice(0, limit).map((item, idx) => ({
      ...item,
      rank: idx + 1
    }))
  };
}

/**
 * Save a match score
 */
export async function saveScore({ playerName, rollNumber, playerScore, robotScore }) {
  const cleanRoll = rollNumber ? rollNumber.trim().toUpperCase() : 'UNKNOWN';
  const pScore = Number(playerScore) || 0;
  const rScore = Number(robotScore) || 0;

  let result = 'DRAW';
  if (pScore > rScore) result = 'WON';
  else if (pScore < rScore) result = 'LOST';

  const entry = {
    id: 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    playerName: playerName || `Player ${cleanRoll}`,
    rollNumber: cleanRoll,
    playerScore: pScore,
    robotScore: rScore,
    result,
    playedAt: new Date().toISOString()
  };

  const db = await getDb();
  if (db) {
    try {
      const res = await db.collection('leaderboard').insertOne({
        ...entry,
        _id: undefined
      });
      entry.id = res.insertedId.toString();
    } catch (err) {
      console.warn('[DataService] MongoDB score save failed, writing locally:', err.message);
    }
  }

  const allScores = readLocalJson(LEADERBOARD_FILE, []);
  allScores.push(entry);
  writeLocalJson(LEADERBOARD_FILE, allScores);

  return entry;
}
