import { NextResponse } from 'next/server';
import { removeFromWaitingList } from '@/lib/dataService';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await removeFromWaitingList(id);
    return NextResponse.json({ success: true, message: 'Item deleted from waiting list' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
