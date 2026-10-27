import { NextResponse } from 'next/server';
import { addToWaitingList, findStudentByRoll } from '@/lib/dataService';

export async function handleScanPost(request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const configuredKey = process.env.RFID_API_KEY || 'rc_arcade_rfid_2026';

    // Verify API Key
    if (apiKey && apiKey !== configuredKey && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid x-api-key header' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawRoll = body.rollNumber || body.rollNo || body.roll_number || body.studentId || body.rfid || body.id;

    if (!rawRoll) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing rollNumber in request body. Expected JSON: { "rollNumber": "23CEB0B10" }'
        },
        { status: 400 }
      );
    }

    const rollNumber = String(rawRoll).trim().toUpperCase();

    // Look up student from database
    const student = await findStudentByRoll(rollNumber);
    const playerName = student ? student.name : `Student (${rollNumber})`;
    const playerMail = student ? student.mail : '';

    // Add to waiting list
    const waitingEntry = await addToWaitingList({
      rollNumber,
      name: playerName,
      mail: playerMail,
      source: 'RFID'
    });

    return NextResponse.json({
      success: true,
      message: 'Student scanned successfully and added to waiting list queue',
      player: {
        rollNumber,
        name: playerName,
        mail: playerMail,
        foundInDb: !!student
      },
      queueId: waitingEntry.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('RFID Scan API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function handleScanGet() {
  return NextResponse.json({
    status: 'ACTIVE',
    service: 'Robotics Club Arcade RFID Scanner Endpoint',
    event: 'Technozion Arcade (Air Hockey)',
    specs: {
      method: 'POST',
      url: '/api/arcade/scan',
      fallbackUrl: '/api/rfid/scan',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.RFID_API_KEY || 'rc_arcade_rfid_2026'
      },
      bodyExample: {
        rollNumber: '23CEB0B10'
      }
    }
  });
}
