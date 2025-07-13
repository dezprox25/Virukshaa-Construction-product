import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Payroll from '@/models/Payroll';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    
    const payroll = await Payroll.findById(params.id)
      .populate('userId', 'name email phone')
      .lean();

    if (!payroll) {
      return NextResponse.json(
        { error: 'Payroll record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payroll);
  } catch (error) {
    console.error('Error fetching payroll record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll record' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    await connectToDB();

    // If payment is being processed
    if (updates.payment) {
      const updatedPayroll = await Payroll.findByIdAndUpdate(
        params.id,
        {
          $inc: {
            totalPaid: updates.payment.amount,
            dueAmount: -updates.payment.amount
          },
          $set: {
            lastPaymentDate: new Date(),
            'paymentHistory.$[].status': 'completed' // Update all pending payments to completed
          },
          $push: {
            paymentHistory: {
              amount: updates.payment.amount,
              date: new Date(),
              paymentMethod: updates.payment.paymentMethod || 'bank_transfer',
              reference: updates.payment.reference || `PAY-${Date.now()}`,
              status: 'completed'
            }
          }
        },
        { new: true }
      );

      return NextResponse.json(updatedPayroll);
    }

    // Regular update
    const updatedPayroll = await Payroll.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true }
    );

    if (!updatedPayroll) {
      return NextResponse.json(
        { error: 'Payroll record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPayroll);
  } catch (error) {
    console.error('Error updating payroll record:', error);
    return NextResponse.json(
      { error: 'Failed to update payroll record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    
    const deletedPayroll = await Payroll.findByIdAndDelete(params.id);
    
    if (!deletedPayroll) {
      return NextResponse.json(
        { error: 'Payroll record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Payroll record deleted successfully' });
  } catch (error) {
    console.error('Error deleting payroll record:', error);
    return NextResponse.json(
      { error: 'Failed to delete payroll record' },
      { status: 500 }
    );
  }
}