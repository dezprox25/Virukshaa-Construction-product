import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";

// GET /api/tasks?supervisorId=...
export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const supervisorId = searchParams.get('supervisorId');

    if (!supervisorId) {
      return NextResponse.json(
        { message: "supervisorId is required" },
        { status: 400 }
      );
    }

    const tasks = await Task.find({ assignedTo: supervisorId })
      .populate('projectId', 'title') // Populate project title
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      documentUrl, 
      documentType,
      projectId,
      projectTitle,
      supervisorId,
      status = 'Pending' 
    } = body;

    if (!title || !supervisorId) {
      return NextResponse.json(
        { message: "Title and supervisorId are required" }, 
        { status: 400 }
      );
    }

    // If projectTitle is not provided but projectId is, we should fetch it
    let finalProjectTitle = projectTitle;
    if (projectId && !projectTitle) {
      const project = await mongoose.model('Project').findById(projectId).select('title');
      if (project) {
        finalProjectTitle = project.title;
      }
    }

    const newTask = new Task({
      title,
      description,
      startDate,
      endDate,
      documentUrl,
      documentType,
      projectId,
      projectTitle: finalProjectTitle,
      assignedTo: supervisorId, // Store as assignedTo in the database
      status
    });

    await newTask.save();

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { message: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
