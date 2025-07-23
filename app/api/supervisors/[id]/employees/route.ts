import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Supervisor from '@/models/Supervisor';
import Employee from '@/models/EmployeeModel';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    
    const supervisor = await Supervisor.findById(params.id)
      .populate('employees', 'name email position avatar')
      .select('employees');
    
    if (!supervisor) {
      return NextResponse.json(
        { message: 'Supervisor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(supervisor.employees);
  } catch (error) {
    console.error('Error fetching supervisor employees:', error);
    return NextResponse.json(
      { message: 'Failed to fetch assigned employees' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { employeeId } = await request.json();
    
    if (!employeeId) {
      return NextResponse.json(
        { message: 'Employee ID is required' },
        { status: 400 }
      );
    }
    
    await connectToDB();
    
    // Check if supervisor exists
    const supervisor = await Supervisor.findById(params.id);
    if (!supervisor) {
      return NextResponse.json(
        { message: 'Supervisor not found' },
        { status: 404 }
      );
    }
    
    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Check if employee is already assigned
    if (supervisor.employees.includes(employeeId)) {
      return NextResponse.json(
        { message: 'Employee is already assigned to this supervisor' },
        { status: 400 }
      );
    }
    
    // Add employee to supervisor
    supervisor.employees.push(employeeId);
    await supervisor.save();
    
    // Update employee's supervisor reference
    employee.supervisor = supervisor._id;
    await employee.save();
    
    return NextResponse.json(
      { message: 'Employee assigned successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error assigning employee:', error);
    return NextResponse.json(
      { message: 'Failed to assign employee' },
      { status: 500 }
    );
  }
}
