import { NextResponse } from 'next/server';
import { getLeaderboard, saveScore } from '@/lib/dataService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const data = await getLeaderboard(limit);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { playerName, rollNumber, playerScore, robotScore } = body;

    if (playerScore === undefined || robotScore === undefined) {
      return NextResponse.json(
        { success: false, error: 'Both playerScore and robotScore are required' },
        { status: 400 }
      );
    }

    const saved = await saveScore({
      playerName,
      rollNumber,
      playerScore,
      robotScore
    });

    const updatedLeaderboard = await getLeaderboard(10);

    return NextResponse.json({
      success: true,
      message: 'Score saved successfully!',
      score: saved,
      ...updatedLeaderboard
    });
  } catch (error) {
    console.error('Failed to save score:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
