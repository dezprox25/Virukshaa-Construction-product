// File: pages/api/auth/signup.ts

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import connectToDB from '@/lib/db'; // your MongoDB connection
 // assuming AdminModel for superadmin
import Supervisor from '@/models/Supervisor'; // or replace with your model
import Client from '@/models/ClientModel';

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDB();

    // Check if user already exists in appropriate collection
    const Model = role === 'client' ? Client : Supervisor;
    const existing = await Model.findOne({ email });

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const newUser = new Model({
      name,
      email,
      password: hashedPassword,
      status: 'Active',
    });

    await newUser.save();

    return NextResponse.json({ message: 'Signup successful', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
