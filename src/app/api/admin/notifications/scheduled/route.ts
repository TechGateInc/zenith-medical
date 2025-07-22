/**
 * Admin Scheduled Notifications API
 * Manages scheduled notification jobs and campaigns
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { AdminRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    });

    if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Mock scheduled notifications data
    // In a real application, this would come from a database
    const notifications = [
      {
        id: '1',
        title: 'Appointment Reminder - Tomorrow',
        type: 'appointment_reminder',
        status: 'scheduled',
        template: 'appointment_reminder_24h',
        scheduledFor: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        recipient: {
          type: 'individual',
          email: 'patient@example.com',
          name: 'John Doe'
        },
        metadata: {
          appointmentId: 'apt_123',
          providerName: 'Dr. Smith',
          appointmentTime: new Date(Date.now() + 90000000).toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Follow-up Survey',
        type: 'survey',
        status: 'sent',
        template: 'patient_satisfaction_survey',
        scheduledFor: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        recipient: {
          type: 'individual',
          email: 'patient2@example.com',
          name: 'Jane Smith'
        },
        metadata: {
          appointmentId: 'apt_122',
          surveyType: 'post_visit',
          responseDeadline: new Date(Date.now() + 604800000).toISOString()
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        title: 'Prescription Refill Reminder',
        type: 'medication_reminder',
        status: 'failed',
        template: 'prescription_refill',
        scheduledFor: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        recipient: {
          type: 'individual',
          email: 'patient3@invalid-email',
          name: 'Bob Johnson'
        },
        metadata: {
          medicationName: 'Lisinopril',
          prescriptionId: 'rx_456',
          pharmacyName: 'Main Street Pharmacy'
        },
        error: 'Invalid email address',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: '4',
        title: 'Welcome Message - New Patient',
        type: 'welcome',
        status: 'pending',
        template: 'new_patient_welcome',
        scheduledFor: new Date(Date.now() + 1800000).toISOString(), // 30 minutes
        recipient: {
          type: 'individual',
          email: 'newpatient@example.com',
          name: 'Alice Wilson'
        },
        metadata: {
          registrationDate: new Date().toISOString(),
          assignedProvider: 'Dr. Brown'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Filter by status if requested
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const typeFilter = searchParams.get('type');
    
    let filteredNotifications = notifications;
    
    if (statusFilter && statusFilter !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.status === statusFilter);
    }
    
    if (typeFilter && typeFilter !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === typeFilter);
    }

    // Calculate summary stats
    const summary = {
      total: notifications.length,
      scheduled: notifications.filter(n => n.status === 'scheduled').length,
      sent: notifications.filter(n => n.status === 'sent').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      pending: notifications.filter(n => n.status === 'pending').length
    };

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      summary
    });

  } catch (error) {
    console.error('Error fetching scheduled notifications:', error);
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
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const user = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    });

    if (!user || !user.role || ![AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.EDITOR].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { action, notificationId, ...data } = body;

    switch (action) {
      case 'cancel':
        if (!notificationId) {
          return NextResponse.json(
            { error: 'Notification ID is required' },
            { status: 400 }
          );
        }
        
        // In a real application, this would update the database
        return NextResponse.json({
          success: true,
          message: 'Notification cancelled successfully'
        });

      case 'reschedule':
        if (!notificationId || !data.newScheduleTime) {
          return NextResponse.json(
            { error: 'Notification ID and new schedule time are required' },
            { status: 400 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Notification rescheduled successfully'
        });

      case 'retry':
        if (!notificationId) {
          return NextResponse.json(
            { error: 'Notification ID is required' },
            { status: 400 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Notification retry scheduled'
        });

      case 'schedule':
        const { templateId, recipients, scheduledFor, metadata } = data;
        
        if (!templateId || !recipients || !scheduledFor) {
          return NextResponse.json(
            { error: 'Template ID, recipients, and schedule time are required' },
            { status: 400 }
          );
        }
        
        // In a real application, this would create a new scheduled notification
        const newNotification = {
          id: `scheduled_${Date.now()}`,
          title: data.title || 'Custom Notification',
          type: data.type || 'custom',
          status: 'scheduled',
          template: templateId,
          scheduledFor,
          recipient: recipients,
          metadata: metadata || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return NextResponse.json({
          success: true,
          message: 'Notification scheduled successfully',
          notification: newNotification
        }, { status: 201 });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing scheduled notification action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 