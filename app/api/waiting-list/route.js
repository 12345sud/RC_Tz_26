import { NextResponse } from 'next/server';
import { getWaitingList, addToWaitingList, registerStudent, removeFromWaitingList } from '@/lib/dataService';

export async function GET() {
  try {
    const list = await getWaitingList();
    return NextResponse.json({ success: true, list });
  } catch (error) {
    console.error('Failed to get waiting list:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { rollNumber, name, mail } = body;

    if (!rollNumber) {
      return NextResponse.json(
        { success: false, error: 'Roll number is required' },
        { status: 400 }
      );
    }

    const cleanRoll = rollNumber.trim().toUpperCase();

    // If user provided a name manually, update/store in student directory too
    if (name && name.trim()) {
      await registerStudent({
        rollNumber: cleanRoll,
        name: name.trim(),
        mail: mail ? mail.trim() : ''
      });
    }

    // Add to waiting list
    const entry = await addToWaitingList({
      rollNumber: cleanRoll,
      name: name ? name.trim() : null,
      mail: mail ? mail.trim() : '',
      source: 'MANUAL'
    });

    return NextResponse.json({
      success: true,
      message: 'Player registered successfully to waiting list',
      entry
    });
  } catch (error) {
    console.error('Failed to add to waiting list:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const roll = searchParams.get('roll');

    if (!id && !roll) {
      return NextResponse.json({ success: false, error: 'id or roll required' }, { status: 400 });
    }

    await removeFromWaitingList(id || roll);
    return NextResponse.json({ success: true, message: 'Removed from waiting list' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
