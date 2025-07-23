import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Payroll from '@/models/PayrollModel';

// GET all payroll records
export async function GET() {
  try {
    console.log('Connecting to database...');
    await connectToDB();
    console.log('Database connected, fetching payroll records...');
    
    const payrollRecords = await Payroll.find({})
      .populate('user', 'name email') // Populate user data with name and email
      .sort({ paymentDate: -1 })
      .lean();
      
    console.log(`Fetched ${payrollRecords.length} payroll records`);
    return NextResponse.json(payrollRecords);
  } catch (err: unknown) {
    // Type guard to check if the error is an instance of Error
    if (err instanceof Error) {
      console.error('Error in GET /api/payroll:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
      
      return NextResponse.json(
        { 
          message: 'Failed to fetch payroll records',
          ...(process.env.NODE_ENV === 'development' && { error: err.message })
        },
        { status: 500 }
      );
    }
    
    // Handle non-Error thrown values
    console.error('Unknown error in GET /api/payroll:', err);
    return NextResponse.json(
      { message: 'An unknown error occurred while fetching payroll records' },
      { status: 500 }
    );
  }
}

// POST a new payroll transaction
export async function POST(request: Request) {
  try {
    console.log('Received payroll creation request');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { user, userRole, amount, paymentDate, status, notes } = body;

    // Basic validation
    if (!user || !userRole || amount === undefined) {
      const errorMessage = 'Missing required fields. Required: user, userRole, and amount.';
      console.error(errorMessage, { user, userRole, amount });
      return NextResponse.json(
        { 
          message: errorMessage,
          required: ['user', 'userRole', 'amount'],
          received: { user, userRole, amount }
        },
        { status: 400 }
      );
    }

    // Normalize userRole to match the expected enum values
    let normalizedUserRole: 'Employee' | 'Supervisor' | 'Client' | 'Supplier';
    const userRoleStr = String(userRole).toLowerCase();
    
    if (userRoleStr.includes('employee')) normalizedUserRole = 'Employee';
    else if (userRoleStr.includes('supervisor')) normalizedUserRole = 'Supervisor';
    else if (userRoleStr.includes('client')) normalizedUserRole = 'Client';
    else if (userRoleStr.includes('supplier')) normalizedUserRole = 'Supplier';
    else {
      const errorMessage = 'Invalid userRole. Must be one of: Employee, Supervisor, Client, Supplier';
      console.error(errorMessage, { receivedRole: userRole });
      return NextResponse.json(
        { 
          message: errorMessage,
          allowedRoles: ['Employee', 'Supervisor', 'Client', 'Supplier'],
          receivedRole: userRole 
        },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    await connectToDB();
    console.log('Database connected, creating payroll entry...');

    const payrollData = {
      user,  
      userRole: normalizedUserRole,
      amount: Number(amount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      status: status || 'paid',
      notes: notes || '',
    };

    console.log('Creating payroll entry with data:', JSON.stringify(payrollData, null, 2));
    const newPayrollEntry = await Payroll.create(payrollData);
    
    console.log('Payroll entry created successfully:', newPayrollEntry._id);
    return NextResponse.json(newPayrollEntry, { status: 201 });
  } catch (err: unknown) {
    // Type guard for standard Error
    if (err instanceof Error) {
      const error = err as Error & { 
        code?: string | number; 
        keyPattern?: Record<string, unknown>; 
        keyValue?: Record<string, unknown>;
      };
      
      const errorDetails: Record<string, unknown> = {
        message: error.message,
        name: error.name,
        ...(error.stack && { stack: error.stack }),  // Only include stack if it exists
      };
      
      // Add MongoDB-specific error details if available
      if (error.code) {
        errorDetails.code = error.code;
        if (error.keyPattern) errorDetails.keyPattern = error.keyPattern;
        if (error.keyValue) errorDetails.keyValue = error.keyValue;
      }
      
      console.error('Error in POST /api/payroll:', errorDetails);
      
      const response: Record<string, unknown> = {
        message: 'Failed to create payroll entry',
      };
      
      // Add debug information in development
      if (process.env.NODE_ENV === 'development') {
        response.error = error.message;
        response.details = {
          name: error.name,
          ...(error.code && { code: error.code }),
          ...(error.keyPattern && { keyPattern: error.keyPattern }),
          ...(error.keyValue && Object.keys(error.keyValue).length > 0 && { keyValue: error.keyValue })
        };
      }
      
      return NextResponse.json(response, { status: 500 });
    }
    
    // Handle non-Error thrown values
    console.error('Unknown error in POST /api/payroll:', err);
    return NextResponse.json(
      { 
        message: 'An unknown error occurred while creating payroll entry',
        ...(process.env.NODE_ENV === 'development' && { error: String(err) })
      },
      { status: 500 }
    );
  }
}

