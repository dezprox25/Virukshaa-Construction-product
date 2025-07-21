import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Supervisor from '@/models/Supervisor';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find supervisor by email
    const supervisor = await Supervisor.findOne({ email });

    if (!supervisor) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if password matches using the model's method
    const isMatch = await supervisor.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Don't send password back in response
    const { password: _, ...supervisorWithoutPassword } = supervisor.toObject();

    return NextResponse.json({
      success: true,
      user: supervisorWithoutPassword
    });

  } catch (error) {
    console.error('Supervisor login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
