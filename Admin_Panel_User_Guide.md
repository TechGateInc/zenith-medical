# Zenith Medical Centre - Admin Panel User Guide

**Version:** 1.0  
**Date:** December 2024  
**Base URL:** https://zenithmedical.ca/

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Dashboard](#dashboard)
4. [Patient Intake Management](#patient-intake-management)
5. [Content Management](#content-management)
6. [Appointments Management](#appointments-management)
7. [Security Center](#security-center)
8. [Data Export](#data-export)
9. [System Settings](#system-settings)
10. [Navigation Guide](#navigation-guide)
11. [Troubleshooting](#troubleshooting)
12. [Security & Compliance](#security--compliance)

---

## Overview

The Zenith Medical Centre Admin Panel provides comprehensive management tools for healthcare administrators to:

- Monitor patient intake submissions
- Manage website content (blog posts, FAQ, team members, services)
- Oversee appointment bookings and providers
- Monitor security events and compliance
- Export patient data for reporting
- Configure system settings

**Access URL:** https://zenithmedical.ca/admin/

### System Requirements

- **Supported Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Screen Resolution:** Minimum 1024x768, Recommended 1920x1080
- **Network:** Stable internet connection required
- **Security:** Two-factor authentication supported

---

## Getting Started

### Accessing the Admin Panel

1. **Navigate to Login Page**
   - URL: https://zenithmedical.ca/admin/login/
   - The system will automatically redirect you here if accessing other admin pages without authentication

2. **Default Admin Credentials**
   - **Email:** `admin@zenithmedical.ca`
   - **Password:** `Admin123!`
   - ⚠️ **CRITICAL:** Change the admin password immediately after first login!

3. **Login Process**
   - Enter your admin email address
   - Enter your password
   - Click "Sign In"
   - If two-factor authentication is enabled, enter the verification code

4. **First-Time Setup**
   - After first login, you'll be redirected to https://zenithmedical.ca/admin/dashboard/
   - **IMMEDIATELY** change the default password
   - Consider enabling two-factor authentication for enhanced security
   - Review and update admin contact information

### Navigation Overview

The admin panel uses a sidebar navigation system with the following main sections:

- **Dashboard:** Main overview and quick actions
- **Patient Intake:** Manage patient submissions
- **Content Management:** Blog, FAQ, Team, Services
- **Appointments:** Provider management and settings
- **Export Data:** Download patient information
- **Security:** Monitor security events and compliance
- **Settings:** System configuration

---

## Dashboard

**URL:** https://zenithmedical.ca/admin/dashboard/

The dashboard provides a comprehensive overview of your medical center's operations.

### Dashboard Components

#### Statistics Cards

1. **Total Submissions**
   - Shows total number of patient intake forms received
   - Updates in real-time

2. **Pending Review**
   - Number of intake forms awaiting review
   - Critical metric for workflow management

3. **Appointments Scheduled**
   - Count of scheduled appointments
   - Links to appointment management

4. **Completed Today**
   - Daily completion metrics
   - Useful for daily reporting

#### Recent Submissions Table

**Features:**
- View latest patient intake submissions
- Filter by status: All, Pending, Scheduled, Completed
- Quick access to individual submission details
- Real-time status updates

**Available Actions:**
- **View Details:** Click to see full patient information
- **Mark Reviewed:** Change status from submitted to reviewed

#### Quick Actions Section

Direct links to commonly used features:

1. **Manage Blog Posts**
   - URL: https://zenithmedical.ca/admin/content/blog/
   - Create and edit health articles

2. **Manage FAQs**
   - URL: https://zenithmedical.ca/admin/content/faq/
   - Update frequently asked questions

3. **Manage Team**
   - URL: https://zenithmedical.ca/admin/content/team/
   - Update team member profiles

4. **Notifications**
   - URL: https://zenithmedical.ca/admin/notifications/
   - Manage appointment reminders

### Step-by-Step Dashboard Usage

1. **Daily Workflow Check**
   - Review pending submissions count
   - Check recent submissions table
   - Address any items requiring attention

2. **Accessing Specific Features**
   - Use quick action cards for common tasks
   - Use sidebar navigation for full feature access

---

## Patient Intake Management

**URL:** https://zenithmedical.ca/admin/dashboard/intake/

This section manages all patient intake form submissions.

### Intake List Overview

#### Search and Filtering

1. **Search Functionality**
   - Search by patient name (legal or preferred)
   - Search by email address
   - Search by phone number
   - Real-time search results

2. **Status Filters**
   - **All Statuses:** View all submissions
   - **Submitted:** New submissions awaiting review
   - **Reviewed:** Submissions that have been reviewed
   - **Scheduled:** Appointments have been scheduled
   - **Checked In:** Patients who have arrived
   - **Completed:** Finished appointments
   - **Cancelled:** Cancelled appointments

3. **Date Filters**
   - **All Time:** No date restriction
   - **Today:** Submissions from today only
   - **Last 7 Days:** Recent week's submissions
   - **Last 30 Days:** Recent month's submissions

#### Submission Status Management

**Status Workflow:**
1. SUBMITTED → Initial form submission
2. REVIEWED → Admin has reviewed the form
3. APPOINTMENT_SCHEDULED → Appointment booked
4. CHECKED_IN → Patient arrived for appointment
5. COMPLETED → Appointment finished
6. CANCELLED → Appointment cancelled

### Viewing Individual Submissions

**URL Pattern:** https://zenithmedical.ca/admin/dashboard/intake/[ID]/

Each submission includes:

- **Patient Information**
  - Legal name and preferred name
  - Contact information (email, phone)
  - Address details
  - Emergency contact information

- **Medical Information**
  - Health concerns and symptoms
  - Medical history
  - Current medications
  - Insurance information

- **Administrative Data**
  - Submission timestamp
  - Current status
  - Admin notes (if any)

### Step-by-Step Intake Management

1. **Daily Review Process**
   - Navigate to https://zenithmedical.ca/admin/dashboard/intake/
   - Set filter to "Submitted" to see new forms
   - Review each submission by clicking "View Details"
   - Update status as appropriate

2. **Processing New Submissions**
   - Click on patient name or "View Details"
   - Review all provided information
   - Add any necessary notes
   - Update status to "Reviewed"
   - Schedule appointment if needed

3. **Search for Specific Patient**
   - Use search box at top of page
   - Enter patient name, email, or phone
   - Results update automatically

---

## Content Management

**Base URL:** https://zenithmedical.ca/admin/content/

The content management system handles all website content including blog posts, FAQs, team member profiles, and medical services.

### Blog Post Management

**URL:** https://zenithmedical.ca/admin/content/blog/

#### Creating New Blog Posts

1. **Access Blog Management**
   - Navigate to https://zenithmedical.ca/admin/content/blog/
   - Click "New Post" button

2. **Creating a New Post**
   - URL: https://zenithmedical.ca/admin/content/blog/new/
   - Fill in required fields:
     - Title (will auto-generate URL slug)
     - Content (rich text editor)
     - Excerpt (summary for listings)
     - SEO meta description
     - Featured image (optional)

3. **Publishing Options**
   - **Save as Draft:** Save without publishing
   - **Publish:** Make live on website immediately
   - **Schedule:** Set future publication date
   - **Featured:** Mark as featured content

#### Managing Existing Posts

1. **Blog Post Listing**
   - View all posts with status indicators
   - Filter by: All Posts, Published, Drafts, Featured
   - Search by title or content

2. **Post Actions**
   - **Edit:** Modify content and settings
   - **View:** See published post on website
   - **Publish/Unpublish:** Toggle publication status
   - **Feature/Unfeature:** Toggle featured status
   - **Delete:** Remove post permanently (admin only)

#### Step-by-Step Blog Management

1. **Creating a Health Article**
   - Go to https://zenithmedical.ca/admin/content/blog/new/
   - Enter compelling title (e.g., "Understanding Diabetes Management")
   - Write informative content using the rich text editor
   - Add relevant medical disclaimer if needed
   - Set as featured if it's particularly important
   - Click "Publish" or "Save as Draft"

2. **Updating Existing Content**
   - Navigate to https://zenithmedical.ca/admin/content/blog/
   - Find the post you want to edit
   - Click "Edit" next to the post
   - Make necessary changes
   - Click "Update" to save changes

### FAQ Management

**URL:** https://zenithmedical.ca/admin/content/faq/

#### Creating New FAQs

1. **Access FAQ Management**
   - Navigate to https://zenithmedical.ca/admin/content/faq/
   - Click "Add FAQ" button

2. **FAQ Creation Process**
   - URL: https://zenithmedical.ca/admin/content/faq/new/
   - Enter the question (keep clear and concise)
   - Provide comprehensive answer
   - Assign to appropriate category
   - Set display order (optional)

#### Managing FAQ Categories

Common categories include:
- General Information
- Appointments
- Insurance and Billing
- Medical Services
- Patient Procedures

#### Step-by-Step FAQ Management

1. **Adding Common Questions**
   - Go to https://zenithmedical.ca/admin/content/faq/new/
   - Example Question: "What should I bring to my first appointment?"
   - Provide detailed answer with all necessary information
   - Categorize appropriately
   - Save and publish

2. **Organizing FAQs**
   - Review all FAQs for relevance and accuracy
   - Update outdated information
   - Group related questions together
   - Ensure answers are comprehensive but concise

### Team Member Management

**URL:** https://zenithmedical.ca/admin/content/team/

#### Adding New Team Members

1. **Access Team Management**
   - Navigate to https://zenithmedical.ca/admin/content/team/
   - Click "Add Member" button

2. **Team Member Information**
   - Full name and title
   - Professional credentials
   - Specializations
   - Biography (professional background)
   - Professional photo
   - Contact information (if public-facing)

#### Step-by-Step Team Management

1. **Adding a New Doctor**
   - Go to https://zenithmedical.ca/admin/content/team/
   - Click "Add Member"
   - Fill in all professional details
   - Upload high-quality professional photo
   - Write engaging but professional biography
   - Include relevant specializations and certifications

### Services Management

**URL:** https://zenithmedical.ca/admin/content/services/

#### Managing Medical Services

1. **Service Categories**
   - Primary Care
   - Specialty Services
   - Diagnostic Services
   - Preventive Care
   - Emergency Services

2. **Service Information Required**
   - Service name and description
   - Duration and scheduling information
   - Prerequisites or preparation required
   - Cost information (if applicable)
   - Provider assignments

#### Step-by-Step Service Management

1. **Adding New Service**
   - Navigate to https://zenithmedical.ca/admin/content/services/
   - Click "Add Service"
   - Provide comprehensive service description
   - Include any special instructions for patients
   - Set appropriate categorization

---

## Appointments Management

**URL:** https://zenithmedical.ca/admin/appointments/

### Provider Management

**URL:** https://zenithmedical.ca/admin/appointments/providers/

#### Adding Appointment Providers

1. **Provider Setup**
   - Navigate to https://zenithmedical.ca/admin/appointments/providers/
   - Click "Add Provider"
   - Configure provider details:
     - Name and specialization
     - Available time slots
     - Appointment duration
     - Booking restrictions

2. **Integration Settings**
   - OSCAR EMR integration (if applicable)
   - External booking system connections
   - Calendar synchronization

#### Step-by-Step Provider Setup

1. **Configuring New Provider**
   - Go to https://zenithmedical.ca/admin/appointments/providers/
   - Enter provider information
   - Set availability schedule
   - Configure appointment types and durations
   - Test booking system integration

---

## Security Center

**URL:** https://zenithmedical.ca/admin/security/

The Security Center provides comprehensive monitoring and management of security-related activities.

### Security Overview Tab

#### Security Statistics

Monitor key security metrics:

1. **Total Logins (24h)**
   - Tracks all admin login attempts
   - Helps identify unusual activity patterns

2. **Failed Attempts**
   - Shows failed login attempts
   - Critical for identifying potential security threats

3. **Active Users**
   - Number of currently logged-in administrators
   - Useful for session management

4. **Compliance Score**
   - Overall compliance rating percentage
   - Based on HIPAA/PIPEDA requirements

#### Quick Security Actions

1. **Access Control**
   - Manage user permissions
   - Link to https://zenithmedical.ca/admin/settings/

2. **Data Protection**
   - Review encryption status
   - Monitor backup security

3. **Security Logs**
   - Export audit logs
   - Analyze security events

### Security Events Tab

#### Event Monitoring

Track various security events:

- **Login Events:** Successful admin logins
- **Failed Logins:** Failed authentication attempts
- **Admin Actions:** Administrative actions performed
- **Data Access:** Patient data access events
- **Security Alerts:** System-generated security warnings

#### Event Details

Each event includes:
- Event type and description
- User responsible
- Timestamp
- IP address (when applicable)
- Severity level (Low, Medium, High, Critical)

### Compliance Tab

#### Compliance Categories

Monitor compliance across multiple areas:

- **Data Encryption:** Patient data encryption status
- **Access Controls:** User permission management
- **Audit Logging:** Complete activity logging
- **Data Retention:** Proper data lifecycle management
- **Backup Security:** Secure backup procedures

#### Step-by-Step Security Management

1. **Daily Security Review**
   - Navigate to https://zenithmedical.ca/admin/security/
   - Review security statistics for anomalies
   - Check failed login attempts
   - Review recent security events

2. **Weekly Compliance Check**
   - Switch to Compliance tab
   - Review all compliance categories
   - Address any warnings or non-compliant items
   - Document remediation actions

3. **Monthly Security Export**
   - Click "Export Logs" button
   - Select date range (monthly)
   - Download security audit logs
   - Store securely for compliance records

---

## Data Export

**URL:** https://zenithmedical.ca/admin/export/

The export functionality allows authorized administrators to download patient intake data for reporting and analysis purposes.

### Export Configuration

#### Format Options

1. **CSV (Excel Compatible)**
   - Suitable for spreadsheet analysis
   - Compatible with Excel, Google Sheets
   - Includes all patient data fields
   - Easy to filter and sort

2. **PDF Report**
   - Formatted for printing
   - Professional appearance
   - Suitable for official reporting
   - Includes summary statistics

#### Filter Options

1. **Status Filter**
   - All Statuses
   - Pending Review
   - Reviewed
   - Appointment Scheduled
   - Checked In
   - Completed
   - Cancelled

2. **Date Range**
   - Start Date: Filter submissions from specific date
   - End Date: Filter submissions up to specific date
   - Useful for monthly/quarterly reports

### Data Included in Exports

**Patient Information:**
- Legal and preferred names
- Contact information (email, phone)
- Address details
- Emergency contact information

**Medical Information:**
- Health concerns and symptoms
- Medical history
- Current medications
- Insurance information

**Administrative Data:**
- Submission status
- Submission timestamp
- Last updated timestamp
- Admin notes

### Step-by-Step Export Process

1. **Basic Export Process**
   - Navigate to https://zenithmedical.ca/admin/export/
   - Select desired format (CSV or PDF)
   - Choose status filter if needed
   - Set date range if required
   - Click "Export Data"
   - File will automatically download

2. **Monthly Reporting Export**
   - Set start date to first day of month
   - Set end date to last day of month
   - Select "All Statuses" for comprehensive report
   - Choose CSV format for analysis
   - Export and save to secure location

3. **Status-Specific Export**
   - Select specific status (e.g., "Completed")
   - Set appropriate date range
   - Export for focused analysis

### Security and Compliance Notes

**Important Security Requirements:**

- All exported data contains Protected Health Information (PHI)
- Must be handled according to HIPAA/PIPEDA regulations
- Store exported files securely
- Do not share via email or unsecured systems
- Delete exported files when no longer needed
- All export actions are logged for compliance

---

## System Settings

**URL:** https://zenithmedical.ca/admin/settings/

System settings allow comprehensive configuration of the admin panel and underlying system.

### System Tab

#### Basic System Configuration

1. **Site Information**
   - Site Name: "Zenith Medical Centre"
   - Site Description: Public-facing description
   - Admin Email: Primary administrative contact
   - Timezone: Operational timezone (default: America/Toronto)
   - Date Format: Display format for dates
   - Language: System language (default: English)

#### Step-by-Step System Configuration

1. **Updating Basic Information**
   - Navigate to https://zenithmedical.ca/admin/settings/
   - Modify site name if needed
   - Update admin email to current contact
   - Set appropriate timezone for your location
   - Choose preferred date format
   - Click "Save Settings"

### Notifications Tab

#### Notification Settings

1. **Email Notifications**
   - Toggle system notifications via email
   - Includes system alerts and updates

2. **Appointment Reminders**
   - Automated appointment reminder system
   - Configurable timing and frequency

3. **Security Alerts**
   - Real-time security event notifications
   - Critical for maintaining security

4. **Maintenance Mode**
   - Emergency setting to disable public access
   - Use during system maintenance or emergencies

#### Step-by-Step Notification Setup

1. **Configuring Notifications**
   - Switch to Notifications tab
   - Enable email notifications for system updates
   - Enable appointment reminders for patients
   - Enable security alerts for administrators
   - Keep maintenance mode disabled unless needed

### Security Tab

#### Two-Factor Authentication (2FA)

1. **Setting Up 2FA**
   - Scan QR code with authenticator app
   - Enter verification code to confirm
   - Save backup codes securely
   - 2FA becomes mandatory after setup

2. **Security Parameters**
   - Session Timeout: Minutes before auto-logout (default: 30)
   - Max Login Attempts: Failed attempts before lockout (default: 5)
   - Password Expiry: Days before password change required (default: 90)
   - IP Whitelist: Restrict access to specific IP ranges

#### Step-by-Step Security Configuration

1. **Enabling Two-Factor Authentication**
   - Go to Security tab
   - Click "Setup Two-Factor Authentication"
   - Follow on-screen instructions
   - Test with authenticator app
   - Save backup codes in secure location

2. **Configuring Security Settings**
   - Set session timeout to appropriate duration
   - Configure maximum login attempts
   - Set password expiry policy
   - Configure IP whitelist if needed

### Database Tab

#### Database Management

1. **Connection Status**
   - Database Type: PostgreSQL
   - Connection Status: Real-time status indicator
   - Last Backup: Timestamp of most recent backup

2. **Maintenance Operations**
   - **Test Connection:** Verify database connectivity
   - **Create Backup:** Manual backup creation
   - **View Backup History:** Access to backup logs

#### Step-by-Step Database Management

1. **Regular Database Health Check**
   - Navigate to Database tab
   - Click "Test Connection" to verify status
   - Review last backup timestamp
   - Create manual backup if needed

2. **Creating Manual Backup**
   - Click "Create Backup" button
   - Wait for confirmation
   - Note backup ID for records
   - Verify backup completion

---

## Navigation Guide

### Sidebar Navigation

The admin panel uses a collapsible sidebar navigation system.

#### Main Navigation Items

1. **Dashboard**
   - URL: https://zenithmedical.ca/admin/dashboard/
   - Overview and quick actions

2. **Patient Intake**
   - URL: https://zenithmedical.ca/admin/dashboard/intake/
   - Badge shows unviewed submissions count

3. **Content Management**
   - URL: https://zenithmedical.ca/admin/content/
   - Expandable submenu with:
     - Team Members: https://zenithmedical.ca/admin/content/team/
     - Blog Posts: https://zenithmedical.ca/admin/content/blog/
     - FAQ: https://zenithmedical.ca/admin/content/faq/
     - Services: https://zenithmedical.ca/admin/content/services/

4. **Appointments**
   - URL: https://zenithmedical.ca/admin/appointments/
   - Submenu:
     - Providers: https://zenithmedical.ca/admin/appointments/providers/

5. **Export Data**
   - URL: https://zenithmedical.ca/admin/export/
   - Patient data export functionality

6. **Security**
   - URL: https://zenithmedical.ca/admin/security/
   - Security monitoring and compliance

7. **Settings**
   - URL: https://zenithmedical.ca/admin/settings/
   - System configuration

#### Quick Actions

- **Back to Website:** Return to public website (https://zenithmedical.ca/)
- **Sign Out:** End admin session securely

### Responsive Design

The admin panel adapts to different screen sizes:

- **Desktop:** Full sidebar navigation visible
- **Tablet:** Collapsible sidebar for more space
- **Mobile:** Hamburger menu with overlay navigation

### Keyboard Shortcuts

Common keyboard shortcuts for efficiency:
- **Ctrl/Cmd + /:** Focus search box (where available)
- **Ctrl/Cmd + S:** Save current form
- **Esc:** Close modal dialogs
- **Tab:** Navigate between form fields

---

## Troubleshooting

### Common Issues and Solutions

#### Login Problems

**Issue:** Cannot log in with correct credentials
**Solutions:**
1. Verify email address is correct
2. Check if Caps Lock is enabled
3. If using initial setup, try default credentials:
   - Email: `admin@zenithmedical.ca`
   - Password: `Admin123!`
4. Try password reset if needed
5. Clear browser cache and cookies
6. Try different browser
7. Contact system administrator

**Issue:** Two-factor authentication not working
**Solutions:**
1. Ensure device time is synchronized
2. Try backup codes if available
3. Re-scan QR code in authenticator app
4. Contact administrator for 2FA reset

#### Performance Issues

**Issue:** Slow loading pages
**Solutions:**
1. Check internet connection speed
2. Clear browser cache
3. Disable browser extensions temporarily
4. Try different browser
5. Check if other users experiencing same issue

**Issue:** Timeouts during data export
**Solutions:**
1. Reduce date range for export
2. Export data in smaller batches
3. Try during off-peak hours
4. Switch to CSV format instead of PDF

#### Data Issues

**Issue:** Patient intake submissions not appearing
**Solutions:**
1. Check date filters
2. Verify status filters
3. Try refreshing the page
4. Clear search terms
5. Check if submissions were filtered out

**Issue:** Content changes not appearing on website
**Solutions:**
1. Verify content is published (not draft)
2. Clear browser cache
3. Check publication date/time
4. Verify content passed approval process

### Browser Compatibility

#### Recommended Browsers
- **Chrome 90+:** Full feature support
- **Firefox 88+:** Full feature support
- **Safari 14+:** Full feature support
- **Edge 90+:** Full feature support

#### Known Issues
- Internet Explorer: Not supported
- Older browser versions may have limited functionality

### Error Messages

#### Common Error Messages and Meanings

**"Authentication required"**
- Session has expired
- Need to log in again
- Go to https://zenithmedical.ca/admin/login/

**"Access denied"**
- Insufficient permissions
- Contact administrator for access

**"Network error"**
- Internet connection issue
- Server temporarily unavailable
- Try again in a few minutes

**"Validation error"**
- Required fields not completed
- Invalid data format
- Check form for specific field errors

### Getting Help

#### Support Contacts

1. **Technical Issues**
   - First: Try troubleshooting steps above
   - Check system status page
   - Contact IT support team

2. **Training and Usage Questions**
   - Refer to this user guide
   - Contact administrative supervisor
   - Request additional training session

3. **Security Concerns**
   - Report immediately to security team
   - Document incident details
   - Do not attempt to resolve security issues independently

---

## Security & Compliance

### HIPAA/PIPEDA Compliance

The admin panel is designed to meet healthcare privacy regulations:

#### Data Protection Measures

1. **Encryption**
   - All data encrypted in transit (HTTPS)
   - Database encryption at rest
   - Secure password storage

2. **Access Controls**
   - Role-based permissions
   - Session management
   - Two-factor authentication support

3. **Audit Logging**
   - Complete action logging
   - User activity tracking
   - Data access records

4. **Data Retention**
   - Automated data lifecycle management
   - Secure data disposal
   - Backup encryption

### Best Practices for Administrators

#### Default Credentials Security

⚠️ **CRITICAL SECURITY REQUIREMENT:**

The system comes with default admin credentials for initial setup:
- **Email:** `admin@zenithmedical.ca`
- **Password:** `Admin123!`

**MANDATORY ACTIONS:**
1. **Change the default password IMMEDIATELY** after first login
2. **Never use default credentials in production**
3. **Update admin email to actual administrator's email**
4. **Enable two-factor authentication**

#### Password Security

1. **Strong Passwords**
   - Minimum 12 characters
   - Include uppercase, lowercase, numbers, symbols
   - Avoid personal information
   - Use unique password for admin account
   - **Never keep the default password `Admin123!`**

2. **Regular Updates**
   - Change password every 90 days
   - Don't reuse recent passwords
   - Update immediately if compromised
   - Change default password within 24 hours of system deployment

#### Session Management

1. **Secure Sessions**
   - Always log out when finished
   - Don't leave admin panel open unattended
   - Use private/incognito mode on shared computers

2. **Device Security**
   - Keep devices updated
   - Use antivirus software
   - Secure physical access to workstations

#### Data Handling

1. **Patient Information**
   - Access only when necessary
   - Don't share login credentials
   - Report any suspected data breaches immediately

2. **Export Security**
   - Encrypt exported files
   - Store in secure locations only
   - Delete when no longer needed
   - Never email patient data

### Incident Reporting

#### Security Incidents

If you suspect a security incident:

1. **Immediate Actions**
   - Document what happened
   - Note date, time, and circumstances
   - Don't attempt to "fix" the issue

2. **Reporting Process**
   - Contact security team immediately
   - Provide detailed incident report
   - Follow all investigation requests

3. **Follow-up**
   - Participate in incident review
   - Implement recommended changes
   - Document lessons learned

---

## Appendix

### Default Admin Credentials

⚠️ **FOR INITIAL SETUP ONLY - CHANGE IMMEDIATELY**

| Field | Value |
|-------|-------|
| Email | `admin@zenithmedical.ca` |
| Password | `Admin123!` |
| Role | Super Administrator |

**Security Notes:**
- These credentials are created during database seeding
- Must be changed within 24 hours of deployment
- Never use in production without modification
- Enable 2FA immediately after password change

### URL Quick Reference

| Feature | URL |
|---------|-----|
| Login | https://zenithmedical.ca/admin/login/ |
| Dashboard | https://zenithmedical.ca/admin/dashboard/ |
| Patient Intake | https://zenithmedical.ca/admin/dashboard/intake/ |
| Individual Intake | https://zenithmedical.ca/admin/dashboard/intake/[ID]/ |
| Content Management | https://zenithmedical.ca/admin/content/ |
| Blog Management | https://zenithmedical.ca/admin/content/blog/ |
| New Blog Post | https://zenithmedical.ca/admin/content/blog/new/ |
| Edit Blog Post | https://zenithmedical.ca/admin/content/blog/[ID]/edit/ |
| FAQ Management | https://zenithmedical.ca/admin/content/faq/ |
| New FAQ | https://zenithmedical.ca/admin/content/faq/new/ |
| Team Management | https://zenithmedical.ca/admin/content/team/ |
| Services Management | https://zenithmedical.ca/admin/content/services/ |
| Appointments | https://zenithmedical.ca/admin/appointments/ |
| Appointment Providers | https://zenithmedical.ca/admin/appointments/providers/ |
| Security Center | https://zenithmedical.ca/admin/security/ |
| Data Export | https://zenithmedical.ca/admin/export/ |
| System Settings | https://zenithmedical.ca/admin/settings/ |

### Status Definitions

#### Patient Intake Statuses

| Status | Description | Next Steps |
|--------|-------------|------------|
| SUBMITTED | Initial form submission | Review and approve |
| REVIEWED | Form has been reviewed | Schedule appointment |
| APPOINTMENT_SCHEDULED | Appointment booked | Wait for patient arrival |
| CHECKED_IN | Patient arrived | Begin appointment |
| COMPLETED | Appointment finished | Update records |
| CANCELLED | Appointment cancelled | Reschedule if needed |

#### Content Publication Statuses

| Status | Description | Visibility |
|--------|-------------|------------|
| Draft | Content being worked on | Not visible to public |
| Published | Live content | Visible on website |
| Featured | Highlighted content | Prominently displayed |
| Scheduled | Set for future publication | Will be published automatically |

### Contact Information

**For technical support or questions about this user guide:**

- **System Administrator:** [Contact details to be provided]
- **Training Coordinator:** [Contact details to be provided]
- **Security Team:** [Contact details to be provided]

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Next Review Date:** March 2025

---

*This document contains confidential information. Do not share with unauthorized personnel.* 