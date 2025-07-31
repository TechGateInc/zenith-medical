import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../../lib/auth/config'
import { prisma } from '../../../../../../lib/prisma'
import { decryptPHI } from '../../../../../../lib/utils/encryption'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to access this endpoint' },
        { status: 401 }
      )
    }

    // Only super admin can access debug endpoints
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only super administrators can access debug endpoints' },
        { status: 403 }
      )
    }

    // Fetch the submission data
    const submission = await prisma.patientIntake.findUnique({
      where: { id: submissionId }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Not found', message: 'Submission not found' },
        { status: 404 }
      )
    }

    // Check which fields exist and their lengths
    const fieldAnalysis: Record<string, any> = {}
    const fieldsToCheck = [
      'legalFirstName', 'legalLastName', 'preferredName', 'dateOfBirth',
      'phoneNumber', 'emailAddress', 'streetAddress', 'city', 
      'provinceState', 'postalZipCode', 'nextOfKinName', 'nextOfKinPhone',
      'relationshipToPatient', 'healthInformationNumber'
    ]

    for (const field of fieldsToCheck) {
      const value = submission[field as keyof typeof submission]
      fieldAnalysis[field] = {
        exists: value !== null && value !== undefined,
        type: typeof value,
        length: typeof value === 'string' ? value.length : 0,
        isEmpty: !value || (typeof value === 'string' && value.trim() === ''),
        preview: typeof value === 'string' && value.length > 0 ? value.substring(0, 20) + '...' : value
      }
    }

    // Try to decrypt each field individually
    const decryptionResults: Record<string, any> = {}
    for (const field of fieldsToCheck) {
      const value = submission[field as keyof typeof submission]
      try {
        if (value && typeof value === 'string' && value.trim() !== '') {
          const decrypted = decryptPHI(value)
          decryptionResults[field] = {
            success: true,
            decryptedLength: decrypted.length,
            decryptedPreview: decrypted.substring(0, 20) + '...'
          }
        } else {
          decryptionResults[field] = {
            success: true,
            reason: 'empty_or_null',
            value: value
          }
        }
      } catch (error) {
        decryptionResults[field] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          originalValue: typeof value === 'string' ? value.substring(0, 50) + '...' : value
        }
      }
    }

    return NextResponse.json({
      submissionId,
      fieldAnalysis,
      decryptionResults,
      summary: {
        totalFields: fieldsToCheck.length,
        existingFields: Object.values(fieldAnalysis).filter(f => f.exists).length,
        emptyFields: Object.values(fieldAnalysis).filter(f => f.isEmpty).length,
        successfulDecryptions: Object.values(decryptionResults).filter(f => f.success).length,
        failedDecryptions: Object.values(decryptionResults).filter(f => !f.success).length
      }
    })

  } catch (error) {
    console.error('Submission debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to analyze submission'
      },
      { status: 500 }
    )
  }
}