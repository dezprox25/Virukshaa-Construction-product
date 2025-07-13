import { NextResponse } from "next/server"
import connectToDB from "@/lib/db"
import Employee, { IEmployee } from "@/models/EmployeeModel"
import { Types } from 'mongoose'

// Helper to convert to client-safe employee object
const toClientEmployee = (employee: any) => ({
  _id: employee._id.toString(),
  name: employee.name,
  email: employee.email,
  phone: employee.phone,
  role: employee.role,
  salary: employee.salary,
  workType: employee.workType,
  status: employee.status,
  joinDate: employee.joinDate.toISOString(),
  endDate: employee.endDate?.toISOString(),
  address: employee.address,
  avatar: employee.avatar
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid employee ID' },
        { status: 400 }
      )
    }

    await connectToDB()
    const employee = await Employee.findById(params.id).lean()

    if (!employee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(toClientEmployee(employee))
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      { message: 'Failed to fetch employee' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid employee ID' },
        { status: 400 }
      )
    }

    const data = await request.json()

    await connectToDB()
    const updatedEmployee = await Employee.findByIdAndUpdate(
      params.id,
      { ...data },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedEmployee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(toClientEmployee(updatedEmployee))
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { message: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid employee ID' },
        { status: 400 }
      )
    }

    await connectToDB()
    const deletedEmployee = await Employee.findByIdAndDelete(params.id).lean()

    if (!deletedEmployee) {
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Employee deleted successfully' })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { message: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
