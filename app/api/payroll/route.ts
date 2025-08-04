import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Payroll, { IPayroll } from '@/models/PayrollModel';
import mongoose from 'mongoose';
// Set response timeout (10 seconds)
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// GET all payroll records
export async function GET() {
  console.log('🔍 Starting GET /api/payroll');
  
  try {
    console.log('1. Attempting to connect to database...');
    await connectToDB();
    console.log('2. Database connection successful');
    
    console.log('3. Fetching payroll records...');
    const payrollRecords = await Payroll.find({})
      .populate({
        path: 'user',
        select: 'name email',
        options: { lean: true }
      })
      .sort({ paymentDate: -1 })
      .lean()
      .maxTimeMS(10000); // 10 second timeout
      
    console.log(`4. Successfully fetched ${payrollRecords.length} payroll records`);
    
    // Ensure all _id fields are strings for the client
    const processedRecords = payrollRecords.map((record: any) => ({
      ...record,
      _id: record._id?.toString(),
      user: record.user ? {
        ...record.user,
        _id: record.user._id?.toString()
      } : null
    }));
    
    return NextResponse.json(processedRecords);
    
  } catch (err: unknown) {
    console.error('❌ Error in GET /api/payroll:', {
      error: err,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      dbConnection: mongoose.connection?.readyState === 1 ? 'connected' : 'disconnected'
    });
    
    const errorResponse = {
      success: false,
      message: 'Failed to fetch payroll records',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && {
        error: err instanceof Error ? {
          name: err.name,
          message: err.message,
          ...(err.stack && { stack: err.stack })
        } : 'Unknown error type'
      })
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
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

