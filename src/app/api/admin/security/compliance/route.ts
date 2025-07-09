/**
 * Admin Security Compliance API
 * Provides compliance status for HIPAA, PIPEDA, and other regulations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock compliance checks
    // In a real application, these would be actual system checks
    const compliance = [
      {
        id: '1',
        category: 'HIPAA',
        description: 'Patient data encryption at rest',
        status: 'compliant',
        lastChecked: new Date().toISOString(),
        details: 'All patient data is encrypted using AES-256 encryption',
        requirement: 'HIPAA Security Rule §164.312(a)(2)(iv)'
      },
      {
        id: '2',
        category: 'HIPAA',
        description: 'Transmission security',
        status: 'compliant',
        lastChecked: new Date().toISOString(),
        details: 'All data transmission uses TLS 1.3 encryption',
        requirement: 'HIPAA Security Rule §164.312(e)'
      },
      {
        id: '3',
        category: 'PIPEDA',
        description: 'Data retention policies',
        status: 'compliant',
        lastChecked: new Date().toISOString(),
        details: 'Personal information is retained only as long as necessary',
        requirement: 'PIPEDA Principle 5'
      },
      {
        id: '4',
        category: 'PIPEDA',
        description: 'Consent management',
        status: 'compliant',
        lastChecked: new Date().toISOString(),
        details: 'Clear consent obtained for all data collection',
        requirement: 'PIPEDA Principle 3'
      },
      {
        id: '5',
        category: 'Security',
        description: 'SSL certificate validity',
        status: 'warning',
        lastChecked: new Date().toISOString(),
        details: 'SSL certificate expires in 45 days',
        requirement: 'Industry best practice'
      },
      {
        id: '6',
        category: 'Access Control',
        description: 'Multi-factor authentication',
        status: 'compliant',
        lastChecked: new Date().toISOString(),
        details: 'MFA enabled for all administrative accounts',
        requirement: 'HIPAA Security Rule §164.312(a)(2)(i)'
      },
      {
        id: '7',
        category: 'Access Control',
        description: 'User access reviews',
        status: 'compliant',
        lastChecked: new Date(Date.now() - 86400000 * 7).toISOString(),
        details: 'Access permissions reviewed weekly',
        requirement: 'HIPAA Security Rule §164.308(a)(4)'
      },
      {
        id: '8',
        category: 'Audit',
        description: 'Audit log integrity',
        status: 'compliant',
        lastChecked: new Date().toISOString(),
        details: 'Audit logs are tamper-evident and regularly backed up',
        requirement: 'HIPAA Security Rule §164.312(b)'
      },
      {
        id: '9',
        category: 'Business Continuity',
        description: 'Data backup verification',
        status: 'compliant',
        lastChecked: new Date(Date.now() - 86400000 * 1).toISOString(),
        details: 'Daily backups verified and tested monthly',
        requirement: 'HIPAA Security Rule §164.308(a)(7)'
      },
      {
        id: '10',
        category: 'Privacy',
        description: 'Minimum necessary standard',
        status: 'compliant',
        lastChecked: new Date().toISOString(),
        details: 'Access limited to minimum necessary information',
        requirement: 'HIPAA Privacy Rule §164.502(b)'
      }
    ];

    // Calculate compliance summary
    const summary = {
      total: compliance.length,
      compliant: compliance.filter(item => item.status === 'compliant').length,
      warning: compliance.filter(item => item.status === 'warning').length,
      nonCompliant: compliance.filter(item => item.status === 'non_compliant').length
    };

    const overallScore = Math.round((summary.compliant / summary.total) * 100);

    return NextResponse.json({
      success: true,
      compliance,
      summary: {
        ...summary,
        overallScore,
        lastFullAudit: new Date(Date.now() - 86400000 * 30).toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching compliance data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'run_audit') {
      // Simulate running a compliance audit
      // In a real application, this would trigger actual compliance checks
      
      return NextResponse.json({
        success: true,
        message: 'Compliance audit initiated',
        auditId: `audit_${Date.now()}`,
        estimatedCompletion: new Date(Date.now() + 300000).toISOString() // 5 minutes
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing compliance action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 