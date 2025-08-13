import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Admin from "@/models/AdminModel"; // adjust if you're using a common UserModel

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    // Create new user
    const newUser = new Admin({
      name,
      email,
      password, // You should hash the password in production!
      role,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "Signup successful", user: { name: newUser.name, email: newUser.email, role: newUser.role } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
