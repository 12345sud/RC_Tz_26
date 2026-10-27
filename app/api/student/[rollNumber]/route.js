import { NextResponse } from 'next/server';
import { findStudentByRoll } from '@/lib/dataService';

export async function GET(request, { params }) {
  try {
    const { rollNumber } = params;
    if (!rollNumber) {
      return NextResponse.json({ success: false, error: 'Roll number is required' }, { status: 400 });
    }

    const student = await findStudentByRoll(rollNumber);
    if (!student) {
      return NextResponse.json({
        success: false,
        found: false,
        message: `Student with roll number "${rollNumber}" not found in database.`
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      found: true,
      student
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
