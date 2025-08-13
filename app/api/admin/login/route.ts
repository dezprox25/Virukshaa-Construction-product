import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Admin from "@/models/AdminModel";
import bcrypt from "bcryptjs"; // optional if you hash passwords

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const user = await Admin.findOne({ email, role });

    if (!user) {
      return NextResponse.json({ error: "Invalid username or role" }, { status: 401 });
    }

    // If you're using hashed passwords
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    // If not using hashing:
    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
