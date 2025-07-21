import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import connectToDB from '@/lib/db';
import AdminProfile from '@/models/AdminProfile';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Find admin by email or username
    const admin = await AdminProfile.findOne({
      $or: [
        { email },
        { username: email } // Allow login with username as well
      ]
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare passwords
    const isPasswordValid = await compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return success response without sensitive data
    const { password: _, ...adminData } = admin.toObject();
    
    return NextResponse.json({
      success: true,
      user: adminData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
