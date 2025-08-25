import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

// GET /api/admin/content/doctors - Fetch all doctor profiles
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const doctors = await prisma.teamMember.findMany({
      where: {
        isDoctor: true
      },
      include: {
        doctor: true
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: doctors.map(doctor => ({
        ...doctor,
        createdAt: doctor.createdAt.toISOString(),
        updatedAt: doctor.updatedAt.toISOString(),
        doctor: doctor.doctor ? {
          ...doctor.doctor,
          createdAt: doctor.doctor.createdAt.toISOString(),
          updatedAt: doctor.doctor.updatedAt.toISOString()
        } : null
      }))
    });
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

// POST /api/admin/content/doctors - Create new doctor profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      teamMemberId,
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
    if (!teamMemberId || !professionalBio) {
      return NextResponse.json(
        { success: false, error: 'Team member ID and professional bio are required' },
        { status: 400 }
      );
    }

    // Check if team member exists and update to mark as doctor
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: teamMemberId }
    });

    if (!teamMember) {
      return NextResponse.json(
        { success: false, error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Create doctor profile
    const doctor = await prisma.doctor.create({
      data: {
        teamMemberId,
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

    // Update team member to mark as doctor
    await prisma.teamMember.update({
      where: { id: teamMemberId },
      data: { isDoctor: true }
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
    console.error('Failed to create doctor profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create doctor profile' },
      { status: 500 }
    );
  }
}
