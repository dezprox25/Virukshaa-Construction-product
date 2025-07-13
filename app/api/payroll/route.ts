import { NextResponse } from 'next/server';
import connectToDB  from '@/lib/db';
import Payroll from '@/models/Payroll';

export async function GET() {
  try {
    await connectToDB();
    
    // Get all payroll records with user details
    const payrolls = await Payroll.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          userId: 1,
          name: {
            $ifNull: [
              '$user.name',
              { $concat: ['$user.firstName', ' ', '$user.lastName'] }
            ]
          },
          email: '$user.email',
          phone: '$user.phone',
          role: '$userType',
          salary: 1,
          totalPaid: 1,
          dueAmount: 1,
          lastPaymentDate: 1,
          status: 1,
          paymentHistory: 1
        }
      }
    ]);

    return NextResponse.json(payrolls);
  } catch (error) {
    console.error('Error fetching payroll data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    await connectToDB();

    // Create or update payroll record
    const payroll = await Payroll.findOneAndUpdate(
      { userId: payload.userId },
      {
        $set: {
          userType: payload.userType,
          salary: payload.salary,
          totalPaid: payload.totalPaid,
          dueAmount: payload.dueAmount,
          lastPaymentDate: payload.lastPaymentDate,
          status: payload.status || 'active'
        },
        $push: payload.payment ? {
          paymentHistory: {
            amount: payload.payment.amount,
            date: payload.payment.date || new Date(),
            paymentMethod: payload.payment.paymentMethod,
            reference: payload.payment.reference,
            status: payload.payment.status || 'completed'
          }
        } : undefined
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(payroll);
  } catch (error) {
    console.error('Error saving payroll data:', error);
    return NextResponse.json(
      { error: 'Failed to save payroll data' },
      { status: 500 }
    );
  }
}
