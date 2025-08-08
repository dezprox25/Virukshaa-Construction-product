import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Project from "@/models/ProjectModel";
import Client from "@/models/ClientModel";

// GET /api/projects?email=bh@gmail.com
export async function GET(req: NextRequest) {
  await connectToDB();

  try {
  const email = req.nextUrl.searchParams.get("email");
const clientId = req.nextUrl.searchParams.get("clientId");

if (!email && !clientId) {
  return NextResponse.json(
    { message: "Email or ClientId parameter is required" },
    { status: 400 }
  );
}

let client;
if (clientId) {
  client = await Client.findById(clientId);
} else {
  client = await Client.findOne({ email });
}

if (!client) {
  return NextResponse.json(
    { message: "Client not found" },
    { status: 404 }
  );
}

    

    // Find projects using clientId
    const projects = await Project.find({ clientId: client._id }).sort({ createdAt: -1 });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects by email:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST remains unchanged
export async function POST(req: NextRequest) {
  await connectToDB();
  try {
    const body = await req.json();
    const {
      title,
      description,
      status = "Planning",
      startDate,
      endDate,
      budget,
      progress = 0,
      clientId,
      client,
      manager,
      tasks = [],
    } = body;

    if (!title || !description || !startDate || !endDate || !budget || !clientId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newProject = new Project({
      title,
      description,
      status,
      startDate,
      endDate,
      budget,
      progress,
      clientId,
      client,
      manager,
      tasks,
    });

    await newProject.save();
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
