import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // 1. Clean local files
    const dataDir = path.join(process.cwd(), 'data');
    const waitingFile = path.join(dataDir, 'waiting_list.json');
    const leaderboardFile = path.join(dataDir, 'leaderboard.json');

    if (fs.existsSync(waitingFile)) fs.writeFileSync(waitingFile, '[]', 'utf8');
    if (fs.existsSync(leaderboardFile)) fs.writeFileSync(leaderboardFile, '[]', 'utf8');

    // 2. Clean MongoDB collections (preserves contacts!)
    const db = await getDb();
    if (db) {
      await db.collection('waiting_list').deleteMany({});
      await db.collection('leaderboard').deleteMany({});
    }

    return NextResponse.json({
      success: true,
      message: 'Event data reset successfully. Leaderboard and waiting list are cleared to zero.'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
