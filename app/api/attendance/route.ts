import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Attendance from "@/models/Attendance";

// POST: Mark attendance for a supervisor or employee
export async function POST(req: NextRequest) {
  await connectToDB();
  try {
    const { supervisorId, employeeId, date, status } = await req.json();

    if ((!supervisorId && !employeeId) || !date || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Use the start of the day in UTC for consistency
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    let filter: any = { date: attendanceDate };
    if (employeeId) filter.employeeId = employeeId;
    else filter.supervisorId = supervisorId;

    const attendance = await Attendance.findOneAndUpdate(
      filter,
      { status },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Fetch attendance for a specific date (optionally by employeeId or supervisorId)
export async function GET(req: NextRequest) {
  await connectToDB();
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const employeeId = searchParams.get("employeeId");
    const supervisorId = searchParams.get("supervisorId");

    // Use the provided date or default to today's date
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setUTCDate(targetDate.getUTCDate() + 1);

    let filter: any = {
      date: {
        $gte: targetDate,
        $lt: nextDay,
      },
    };
    if (employeeId) filter.employeeId = employeeId;
    if (supervisorId) filter.supervisorId = supervisorId;

    const attendanceRecords = await Attendance.find(filter)
      .populate("supervisorId", "_id name email")
      .populate("employeeId", "_id name email"); // Populate supervisor and employee details

    return NextResponse.json(attendanceRecords, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Mock data for attendance
const attendance = [
  {
    id: 1,
    date: "2024-11-12",
    projectId: 1,
    workers: [
      { id: 1, name: "John Doe", role: "Mason", status: "Present", checkIn: "08:00", checkOut: "17:00" },
      { id: 2, name: "Jane Smith", role: "Carpenter", status: "Present", checkIn: "08:15", checkOut: "17:15" },
      { id: 3, name: "Bob Johnson", role: "Electrician", status: "Absent", checkIn: null, checkOut: null },
      { id: 4, name: "Alice Brown", role: "Plumber", status: "Present", checkIn: "08:30", checkOut: "17:30" },
    ],
  },
]

// export async function GET() {
//   return NextResponse.json(attendance)
// }

// export async function POST(request: Request) {
//   const body = await request.json()
//   const newAttendance = {
//     id: attendance.length + 1,
//     date: new Date().toISOString().split("T")[0],
//     ...body,
//   }
//   attendance.push(newAttendance)
//   return NextResponse.json(newAttendance, { status: 201 })
// }
