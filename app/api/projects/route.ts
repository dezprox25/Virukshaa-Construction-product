import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Project from "@/models/ProjectModel";

// GET /api/projects
export async function GET(req: NextRequest) {
  await connectToDB();
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/projects
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
