import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import connectToDB from '@/lib/db';
import AdminProfile from '@/models/AdminProfile';

// GET: Get or Create Admin Profile
export async function GET() {
  try {
    console.log('GET /api/admin/profile - Starting request');

    await connectToDB();
    console.log('Connected to DB');

    let adminProfile = await AdminProfile.findOne().select('-password -__v').lean();

    if (!adminProfile) {
      console.log('No admin profile found, creating default...');
      
      const newProfile = new AdminProfile({
        companyName: 'My Company',
        adminName: 'Admin',
        email: 'admin@example.com',
        password: await hash('admin123', 12),
      });

      await newProfile.save();
      console.log('Created new admin profile');

      const { password, ...profileWithoutPassword } = newProfile.toObject();
      return NextResponse.json(profileWithoutPassword);
    }

    console.log('Found existing admin profile');
    return NextResponse.json(adminProfile);
  } catch (error) {
    console.error('Error in GET /api/admin/profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch admin profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Update Admin Profile (no auth)
export async function PUT(request: Request) {
  try {
    await connectToDB();

    const body = await request.json();
    const { companyName, adminName, email, password } = body;

    let adminProfile = await AdminProfile.findOne();

    if (!adminProfile) {
      // Create new profile
      adminProfile = new AdminProfile({
        companyName: companyName || 'My Company',
        adminName: adminName || 'Admin',
        email: email || 'admin@example.com',
        password: password ? await hash(password, 12) : await hash('admin123', 12),
      });
    } else {
      // Update existing profile
      if (companyName) adminProfile.companyName = companyName;
      if (adminName) adminProfile.adminName = adminName;
      if (email) adminProfile.email = email;
      if (password) adminProfile.password = await hash(password, 12);

      adminProfile.updatedAt = new Date();
    }

    await adminProfile.save();

    const { password: _, ...profileWithoutPassword } = adminProfile.toObject();

    return NextResponse.json({
      message: 'Profile saved successfully',
      data: profileWithoutPassword,
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/profile:', error);
    return NextResponse.json(
      { error: 'Failed to update admin profile' },
      { status: 500 }
    );
  }
}
