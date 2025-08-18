import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/content/doctors/[id] - Update doctor profile
export async function PUT(
  request: Request,
  { params }: any,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      professionalBio,
      medicalSchool,
      graduationYear,
      residency,
      fellowship,
      boardCertifications,
      hospitalAffiliations,
      researchInterests,
      publications,
      awards,
      memberships,
      consultationFee,
      availability,
      emergencyContact
    } = body;

    // Validate required fields
    if (!professionalBio) {
      return NextResponse.json(
        { success: false, error: 'Professional bio is required' },
        { status: 400 }
      );
    }

    // Update doctor profile
    const doctor = await prisma.doctor.update({
      where: { teamMemberId: id },
      data: {
        professionalBio,
        medicalSchool,
        graduationYear,
        residency,
        fellowship,
        boardCertifications: boardCertifications || [],
        hospitalAffiliations: hospitalAffiliations || [],
        researchInterests: researchInterests || [],
        publications: publications || [],
        awards: awards || [],
        memberships: memberships || [],
        consultationFee,
        availability,
        emergencyContact
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...doctor,
        createdAt: doctor.createdAt.toISOString(),
        updatedAt: doctor.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to update doctor profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update doctor profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/content/doctors/[id] - Delete doctor profile
export async function DELETE(
  request: Request,
  { params }: any,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Delete doctor profile
    await prisma.doctor.delete({
      where: { teamMemberId: id }
    });

    // Update team member to remove doctor status
    await prisma.teamMember.update({
      where: { id },
      data: { isDoctor: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Doctor profile deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete doctor profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete doctor profile' },
      { status: 500 }
    );
  }
}
