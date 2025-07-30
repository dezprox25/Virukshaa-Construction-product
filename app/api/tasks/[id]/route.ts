import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";

// GET: Fetch a single task by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
        const task = await Task.findById(params.id).populate("assignedTo", "name");
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update a task by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      status 
    } = body;

    // If projectId is being updated, ensure we have the latest project title
    let finalProjectTitle = projectTitle;
    if (projectId && !projectTitle) {
      const project = await mongoose.model('Project').findById(projectId).select('title');
      if (project) {
        finalProjectTitle = project.title;
      }
    }

    const updateData: Record<string, any> = {
      title,
      description,
      startDate,
      endDate,
      documentUrl,
      documentType,
      ...(projectId && { projectId }),
      ...(finalProjectTitle && { projectTitle: finalProjectTitle }),
      ...(status && { status })
    };

    const updatedTask = await Task.findByIdAndUpdate(
      params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a task by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const deletedTask = await Task.findByIdAndDelete(params.id);
    if (!deletedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
