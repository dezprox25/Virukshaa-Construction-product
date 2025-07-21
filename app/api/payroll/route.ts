import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Payroll from '@/models/PayrollModel';

// GET all payroll records
export async function GET() {
  try {
    await connectToDB();
    const payrollRecords = await Payroll.find({})
      .populate('user', 'name email') // Populate user data with name and email
      .sort({ paymentDate: -1 });
    return NextResponse.json(payrollRecords);
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    return NextResponse.json(
      { message: 'Failed to fetch payroll records' },
      { status: 500 }
    );
  }
}

// POST a new payroll transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, userRole, amount, paymentDate, status, notes } = body;

    // Basic validation
    if (!user || !userRole || !amount) {
      return NextResponse.json(
        { message: 'Missing required fields: user, userRole, and amount are required.' },
        { status: 400 }
      );
    }

    // Bulletproof normalization: match 'userRole' to allowed enum values regardless of case
    let normalizedUserRole = userRole;
    const allowedUserRoles = ['Employee', 'Supervisor', 'Client', 'Supplier'];
    const match = allowedUserRoles.find(r => r.toLowerCase() === String(userRole).toLowerCase());
    if (match) {
      normalizedUserRole = match;
    }

    await connectToDB();

    const newPayrollEntry = await Payroll.create({
      user,  
      userRole: normalizedUserRole,
      amount,
      paymentDate: paymentDate || new Date(),
      status: status || 'paid',
      notes,
    });

    return NextResponse.json(newPayrollEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating payroll entry:', error);
    return NextResponse.json(
      { message: 'Failed to create payroll entry' },
      { status: 500 }
    );
  }
}

