# Product Requirements Document: OSCAR REST API Integration

## Introduction/Overview

This document outlines the requirements for integrating OSCAR's REST API into the existing Zenith Medical Centre Next.js application. The integration will enable seamless patient registration and appointment scheduling by automatically creating patient records in OSCAR when patients complete the intake form, and subsequently booking appointments directly in the OSCAR system. This eliminates duplicate data entry, reduces administrative overhead, and provides real-time synchronization between the web application and the clinic's EMR system.

## Goals

1. **Eliminate Duplicate Data Entry**: Automatically sync patient intake data from the web application to OSCAR
2. **Streamline Patient Registration**: Create OSCAR patient records immediately upon intake form submission
3. **Enable Direct Appointment Booking**: Allow patients to book appointments in OSCAR through the web interface
4. **Maintain Data Integrity**: Ensure bidirectional synchronization between web app and OSCAR
5. **Preserve Security & Compliance**: Maintain existing HIPAA/PIPEDA compliance standards
6. **Provide Real-time Integration**: Immediate reflection of changes between systems
7. **Support Administrative Workflows**: Enable staff to manage OSCAR data through the web interface

## User Stories

### Primary User: Patients
- **US-1**: As a patient completing the intake form, I want my information automatically registered in OSCAR so I don't have to provide it again during my appointment.
- **US-2**: As a patient, I want to immediately book an appointment after completing intake so I can secure my preferred time slot.
- **US-3**: As a patient, I want to receive confirmation that both my registration and appointment booking were successful.

### Secondary User: Administrative Staff
- **US-4**: As an admin, I want to see real-time OSCAR patient data in the web dashboard so I can manage appointments efficiently.
- **US-5**: As an admin, I want failed OSCAR integrations to be queued for manual processing so no patient data is lost.
- **US-6**: As an admin, I want to search for existing OSCAR patients before creating duplicates.

### System Users: Integration Service
- **US-7**: As the system, I want to automatically retry failed OSCAR operations so temporary connectivity issues don't disrupt patient flow.
- **US-8**: As the system, I want to maintain audit logs of all OSCAR operations for compliance purposes.

## Functional Requirements

### OSCAR API Setup & Authentication
1. **FR-O1**: The system must enable OSCAR's REST API module in Administration → Integration → REST Clients
2. **FR-O2**: The system must register a new client in OSCAR to obtain Consumer Key and Consumer Secret
3. **FR-O3**: The system must implement OAuth 1.0a authentication flow for OSCAR API access
4. **FR-O4**: The system must store OSCAR credentials securely in environment variables:
   - `OSCAR_BASE_URL`
   - `OSCAR_CONSUMER_KEY` 
   - `OSCAR_CONSUMER_SECRET`
   - `OSCAR_TOKEN`
   - `OSCAR_TOKEN_SECRET`
5. **FR-O5**: The system must implement token refresh mechanism for long-lived integration access

### Patient Registration Integration
6. **FR-P1**: The system must automatically create OSCAR patient records upon successful intake form submission
7. **FR-P2**: The system must map all intake form fields to OSCAR demographics API:
   - Legal first/last name → OSCAR name fields
   - Date of birth → OSCAR DOB field
   - Phone/email → OSCAR contact fields
   - Address → OSCAR address fields
   - Health Information Number → OSCAR health number
   - Next of kin information → OSCAR emergency contact
8. **FR-P3**: The system must search OSCAR for existing patients by health number before creating new records
9. **FR-P4**: The system must handle duplicate patient scenarios gracefully:
   - If exact match found: update existing record with new information
   - If similar match found: flag for manual review
   - If no match: create new patient record
10. **FR-P5**: The system must store the OSCAR `demographicNo` in the local PatientIntake record for future reference

### Appointment Scheduling Integration  
11. **FR-A1**: The system must integrate with OSCAR's schedule API (`/oscar/ws/services/schedule/add`)
12. **FR-A2**: The system must map appointment booking data to OSCAR schedule fields:
    - `demographicNo` from patient registration
    - `providerNo` from selected healthcare provider
    - `appointmentDate` and `startTime` from booking selection
    - Appointment type and reason codes
13. **FR-A3**: The system must retrieve available OSCAR providers and appointment types for booking interface
14. **FR-A4**: The system must validate appointment availability against OSCAR schedule before booking
15. **FR-A5**: The system must update local appointment records with OSCAR appointment IDs for synchronization

### Error Handling & Fallback Mechanisms
16. **FR-E1**: The system must implement comprehensive error handling for OSCAR API failures:
    - Network connectivity issues
    - Authentication failures  
    - API rate limiting
    - Invalid data responses
17. **FR-E2**: The system must queue failed operations for automatic retry with exponential backoff
18. **FR-E3**: The system must provide manual processing interface for failed integrations
19. **FR-E4**: The system must notify administrators of integration failures via email/dashboard alerts
20. **FR-E5**: The system must maintain local data integrity even when OSCAR integration fails
21. **FR-E6**: The system must provide fallback appointment booking options when OSCAR scheduling fails

### Data Synchronization & Management
22. **FR-S1**: The system must implement bidirectional sync to update local records when OSCAR data changes
23. **FR-S2**: The system must handle OSCAR webhook notifications for appointment updates
24. **FR-S3**: The system must provide admin interface to manually trigger OSCAR sync operations
25. **FR-S4**: The system must detect and resolve data conflicts between local and OSCAR records
26. **FR-S5**: The system must maintain sync status indicators in the admin dashboard

### Security & Compliance
27. **FR-SC1**: The system must maintain existing HIPAA/PIPEDA compliance standards for OSCAR integration
28. **FR-SC2**: The system must encrypt all OSCAR API communications using TLS 1.3
29. **FR-SC3**: The system must limit OSCAR integration user permissions to minimum required (demographics, scheduling)
30. **FR-SC4**: The system must audit log all OSCAR operations with patient identifiers obfuscated
31. **FR-SC5**: The system must validate all data before sending to OSCAR to prevent injection attacks

## Non-Goals (Out of Scope)

1. **Medical Records Integration**: This integration will not sync clinical notes, lab results, or other medical records beyond demographics and appointments
2. **Billing Integration**: OSCAR billing/payment processing is not included in this scope
3. **Provider Portal**: Direct provider access to web application is not included
4. **OSCAR Customization**: No modifications to OSCAR software itself
5. **Historical Data Migration**: Existing web app patients will not be retroactively created in OSCAR
6. **Real-time Clinical Data**: Lab results, prescriptions, and clinical notes sync are excluded
7. **OSCAR User Management**: Web app will not manage OSCAR user accounts or permissions

## Technical Considerations

### Architecture Integration
- **OAuth Library**: Install and configure `oauth-1.0a` NPM package for OSCAR API authentication
- **HTTP Client**: Utilize existing `axios` or similar for OSCAR API calls
- **Database Schema**: Extend existing PatientIntake and Appointment models with OSCAR reference fields
- **API Routes**: Create new Next.js API routes under `/api/oscar/` for integration operations
- **Background Jobs**: Implement queue system for retry logic and async operations
- **Webhook Handling**: Add OSCAR webhook endpoints for receiving appointment updates

### Data Mapping Strategy
- **Field Mapping**: Create comprehensive mapping between intake form fields and OSCAR demographics API
- **Data Transformation**: Implement data formatting/validation to match OSCAR requirements
- **Conflict Resolution**: Define business rules for handling data discrepancies
- **Audit Trail**: Extend existing audit logging to track OSCAR operations

### Performance & Scalability
- **Rate Limiting**: Implement proper rate limiting to respect OSCAR API constraints
- **Caching**: Cache OSCAR provider lists and appointment types for performance
- **Async Processing**: Process OSCAR operations asynchronously to avoid blocking user experience
- **Connection Pooling**: Optimize API connection management for high-volume usage

### Security Implementation
- **Environment Variables**: Secure storage of OSCAR credentials using existing patterns
- **Network Security**: Ensure OSCAR communication occurs over secure channels
- **Access Control**: Implement role-based access for OSCAR management features
- **Data Encryption**: Maintain existing encryption standards for OSCAR-related data

## Success Metrics

### Primary Metrics
1. **Integration Success Rate**: >95% successful patient creation in OSCAR within 1 minute of intake submission
2. **Appointment Booking Rate**: >90% successful appointment bookings in OSCAR when requested
3. **Data Accuracy**: <1% data discrepancies between web app and OSCAR records
4. **System Availability**: <2 minutes average downtime for OSCAR integration issues

### Secondary Metrics  
5. **Admin Efficiency**: 50% reduction in manual data entry time for patient registration
6. **Patient Satisfaction**: <3 clicks from intake completion to appointment confirmation
7. **Error Recovery**: <5 minutes average time to resolve failed integrations
8. **API Performance**: <2 seconds average response time for OSCAR operations

### Compliance Metrics
9. **Audit Coverage**: 100% of OSCAR operations logged in compliance audit trail
10. **Security Incidents**: Zero unauthorized access to OSCAR systems
11. **Data Retention**: 100% compliance with retention policies for OSCAR sync data

## Open Questions

1. **OSCAR Version Compatibility**: What version of OSCAR is currently running? Are there any known API limitations?
2. **Provider Configuration**: How many healthcare providers need to be configured in the appointment booking system?
3. **Appointment Types**: What appointment types and duration options should be available for patient booking?
4. **Business Hours**: What are the clinic's operating hours for appointment availability?
5. **Emergency Procedures**: What is the fallback process when OSCAR is completely unavailable?
6. **Data Retention**: How long should failed integration attempts be retained for retry/review?
7. **Notification Preferences**: Should patients receive notifications from both systems or only the web app?
8. **Testing Environment**: Is there a test/staging OSCAR instance available for integration development?
9. **Go-Live Strategy**: Should the integration be deployed gradually or all at once?
10. **Performance Requirements**: What is the expected patient volume and concurrent appointment booking load? 