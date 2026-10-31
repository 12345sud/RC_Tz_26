import { NextResponse } from 'next/server';
import { getLeaderboard, saveScore } from '@/lib/dataService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const data = await getLeaderboard(limit, search);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      playerName, 
      rollNumber, 
      playerScore, 
      robotScore,
      opponentScore,
      opponentName,
      opponentRoll,
      player1,
      player2,
      p1Score,
      p2Score
    } = body;

    const saved = await saveScore({
      playerName,
      rollNumber,
      playerScore,
      robotScore,
      opponentScore,
      opponentName,
      opponentRoll,
      player1,
      player2,
      p1Score,
      p2Score
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
