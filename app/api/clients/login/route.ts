   import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Client from "@/models/ClientModel";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const user = await Client.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "Invalid email" }, { status: 401 });
    }

    // If using hashed password:
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Client login successful",
      user: {
        name: user.adminName,
        email: user.email,
        role: "client",
      },
    });
  } catch (error) {
    console.error("Client login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
