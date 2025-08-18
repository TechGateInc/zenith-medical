import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/doctors - Fetch published doctor profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Fetch specific doctor by slug (name converted to slug)
      const doctor = await prisma.teamMember.findFirst({
        where: {
          isDoctor: true,
          published: true,
          name: {
            contains: slug.replace(/-/g, ' '),
            mode: 'insensitive'
          }
        },
        include: {
          doctor: true
        }
      });

      if (!doctor) {
        return NextResponse.json(
          { success: false, error: 'Doctor not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          ...doctor,
          createdAt: doctor.createdAt.toISOString(),
          updatedAt: doctor.updatedAt.toISOString(),
          doctor: doctor.doctor ? {
            ...doctor.doctor,
            createdAt: doctor.doctor.createdAt.toISOString(),
            updatedAt: doctor.doctor.updatedAt.toISOString()
          } : null
        }
      });
    }

    // Fetch all published doctors
    const doctors = await prisma.teamMember.findMany({
      where: {
        isDoctor: true,
        published: true
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
