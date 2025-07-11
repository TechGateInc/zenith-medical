/**
 * Intake Counter Utilities
 * Functions for managing patient intake view tracking
 */

import { prisma } from '@/lib/prisma';

/**
 * Mark a patient intake submission as viewed
 * @param intakeId - The ID of the patient intake submission
 * @returns Promise<boolean> - Success status
 */
export async function markIntakeAsViewed(intakeId: string): Promise<boolean> {
  try {
    await prisma.patientIntake.update({
      where: { id: intakeId },
      data: { viewedAt: new Date() }
    });
    return true;
  } catch (error) {
    console.error('Error marking intake as viewed:', error);
    return false;
  }
}

/**
 * Mark multiple patient intake submissions as viewed
 * @param intakeIds - Array of patient intake submission IDs
 * @returns Promise<boolean> - Success status
 */
export async function markMultipleIntakesAsViewed(intakeIds: string[]): Promise<boolean> {
  try {
    await prisma.patientIntake.updateMany({
      where: { id: { in: intakeIds } },
      data: { viewedAt: new Date() }
    });
    return true;
  } catch (error) {
    console.error('Error marking multiple intakes as viewed:', error);
    return false;
  }
}

/**
 * Get count of unviewed patient intake submissions
 * @returns Promise<number> - Count of unviewed submissions
 */
export async function getUnviewedIntakeCount(): Promise<number> {
  try {
    return await prisma.patientIntake.count({
      where: { viewedAt: null }
    });
  } catch (error) {
    console.error('Error getting unviewed intake count:', error);
    return 0;
  }
} 