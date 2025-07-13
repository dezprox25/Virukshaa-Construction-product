import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { title, description, startDate, endDate, documentUrl, assignedTo } = body;

    if (!title || !assignedTo) {
      return NextResponse.json({ message: "Title and assignedTo are required" }, { status: 400 });
    }

    const newTask = new Task({
      title,
      description,
      startDate,
      endDate,
      documentUrl,
      assignedTo,
    });

    await newTask.save();

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
