import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Supervisor from "@/models/Supervisor";
import Project from "@/models/Project";


function toSupervisorResponse(supervisor: any) {
  return {
    ...supervisor,
    _id: supervisor._id?.toString?.() || '',
    createdAt: supervisor.createdAt?.toISOString?.() || '',
    updatedAt: supervisor.updatedAt?.toISOString?.() || ''
  };
}

// ✅ GET all supervisors or one by email
export async function GET(request: Request) {
  try {
    await connectToDB();
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (email) {
      const supervisor = await Supervisor.findOne({ email }).lean();
      if (!supervisor) {
        return NextResponse.json({ message: "Supervisor not found" }, { status: 404 });
      }
      return NextResponse.json(toSupervisorResponse(supervisor), { status: 200 });
    }

    const supervisors = await Supervisor.find({}).sort({ name: 1 }).lean();
    const result = supervisors.map(toSupervisorResponse);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching supervisors:", error);
    return NextResponse.json(
      { message: "Failed to fetch supervisors" },
      { status: 500 }
    );
  }
}

// ✅ POST create new supervisor
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, username, password, avatar } = data;

    await connectToDB();

    // Check if supervisor already exists
    const existingSupervisor = await Supervisor.findOne({
      $or: [{ email }, { username }]
    });
    if (existingSupervisor) {
      return NextResponse.json(
        { message: "Supervisor with this email or username already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const supervisor = new Supervisor({
      name,
      email,
      phone,
      username,
      password: hashedPassword,
      avatar
    });

    await supervisor.save();

    return NextResponse.json(toSupervisorResponse(supervisor.toObject()), { status: 201 });
  } catch (error) {
    console.error("Error creating supervisor:", error);
    return NextResponse.json(
      { message: "Failed to create supervisor" },
      { status: 500 }
    );
  }
}
