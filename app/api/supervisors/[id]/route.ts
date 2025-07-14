import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Supervisor from "@/models/Supervisor";

// GET single supervisor
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const supervisor = await Supervisor.findById(params.id);
    
    if (!supervisor) {
      return NextResponse.json(
        { message: 'Supervisor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(supervisor);
  } catch (error) {
    console.error('Error fetching supervisor:', error);
    return NextResponse.json(
      { message: 'Failed to fetch supervisor' },
      { status: 500 }
    );
  }
}

// UPDATE supervisor
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const body = await request.json();
    await connectToDB();
    
    const updatedSupervisor = await Supervisor.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedSupervisor) {
      return NextResponse.json(
        { message: 'Supervisor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedSupervisor);
  } catch (error) {
    console.error('Error updating supervisor:', error);
    return NextResponse.json(
      { message: 'Failed to update supervisor' },
      { status: 500 }
    );
  }
}

// DELETE supervisor
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const deletedSupervisor = await Supervisor.findByIdAndDelete(params.id);
    
    if (!deletedSupervisor) {
      return NextResponse.json(
        { message: 'Supervisor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Supervisor deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting supervisor:', error);
    return NextResponse.json(
      { message: 'Failed to delete supervisor' },
      { status: 500 }
    );
  }
}
