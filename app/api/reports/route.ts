import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Report from '@/models/Report';

// GET /api/reports - Get all reports or filter by type
// POST /api/reports - Create a new report

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'client' | 'supervisor' | 'employee' | 'supplier' | null;
    const search = searchParams.get('search') || '';

    const db = await connectToDB();
    
    let query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const reports = await Report.find(query)
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const reportData = await request.json();
    
    // Basic validation
    if (!reportData.title || !reportData.content || !reportData.type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    const newReport = {
      ...reportData,
      date: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await Report.create(newReport);
    
    return NextResponse.json({
      ...newReport,
      _id: result.insertedId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
