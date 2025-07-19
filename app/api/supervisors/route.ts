import { NextResponse } from "next/server"
import connectToDB from "@/lib/db"
import Supervisor from "@/models/Supervisor"

// GET all supervisors
export async function GET() {
  try {
    await connectToDB()
    const supervisors = await Supervisor.find({}).sort({ createdAt: -1 })
    return NextResponse.json(supervisors)
  } catch (error) {
    console.error('Error fetching supervisors:', error)
    return NextResponse.json(
      { message: 'Failed to fetch supervisors' },
      { status: 500 }
    )
  }
}

// Create a new supervisor
export async function POST(request: Request) {
  try {
    const body = await request.json()
    await connectToDB()
    
    // Check if supervisor with email or username already exists
    const existingSupervisor = await Supervisor.findOne({
      $or: [
        { email: body.email },
        { username: body.username }
      ]
    });
    
    if (existingSupervisor) {
      if (existingSupervisor.email === body.email) {
        return NextResponse.json(
          { message: 'Supervisor with this email already exists' },
          { status: 400 }
        );
      }
      if (existingSupervisor.username === body.username) {
        return NextResponse.json(
          { message: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // Hash password before saving
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    const newSupervisor = new Supervisor({
      ...body,
      password: hashedPassword
    });

    const savedSupervisor = await newSupervisor.save()
    return NextResponse.json(savedSupervisor, { status: 201 })
  } catch (error: any) {
    console.error('Error creating supervisor:', error);

    // Check for Mongoose validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: 'Validation failed', errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to create supervisor', error: error.message },
      { status: 500 }
    );
  }
}
