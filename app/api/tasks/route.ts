import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import Supervisor from "@/models/Supervisor";
import Project from "@/models/Project"; // ✅

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const supervisorId = searchParams.get("supervisorId");

    if (!email && !supervisorId) {
      return NextResponse.json(
        { message: "Email or supervisorId is required" },
        { status: 400 }
      );
    }

    let finalSupervisorId = supervisorId;

    if (email) {
      const supervisor = await Supervisor.findOne({ email });
      if (!supervisor) {
        return NextResponse.json(
          { message: "Supervisor not found" },
          { status: 404 }
        );
      }
      finalSupervisorId = supervisor._id.toString();
    }

    const tasks = await Task.find({ assignedTo: finalSupervisorId })
      .populate("projectId", "title")
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

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
      status = "Pending",
    } = body;

    if (!title || !supervisorId) {
      return NextResponse.json(
        { message: "Title and supervisorId are required" },
        { status: 400 }
      );
    }

    let finalProjectTitle = projectTitle;
    if (projectId && !projectTitle) {
      const project = await Project.findById(projectId).select("title");
      if (project) finalProjectTitle = project.title;
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
      assignedTo: supervisorId,
      status,
    });

    await newTask.save();
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
