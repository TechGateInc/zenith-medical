# Implementation Tasks: OSCAR REST API Integration

## Relevant Files

- `src/lib/integrations/oscar-api.ts` - Core OSCAR API client with OAuth 1.0a authentication
- `src/lib/integrations/oscar-api.test.ts` - Unit tests for OSCAR API client
- `src/lib/integrations/oscar-patient-service.ts` - Patient registration and demographic mapping service
- `src/lib/integrations/oscar-patient-service.test.ts` - Unit tests for patient service
- `src/lib/integrations/oscar-appointment-service.ts` - Appointment scheduling and management service
- `src/lib/integrations/oscar-appointment-service.test.ts` - Unit tests for appointment service
- `src/lib/integrations/oscar-sync-queue.ts` - Background job queue for OSCAR operations with retry logic
- `src/lib/integrations/oscar-sync-queue.test.ts` - Unit tests for sync queue
- `src/app/api/oscar/patients/route.ts` - API endpoints for OSCAR patient operations
- `src/app/api/oscar/appointments/route.ts` - API endpoints for OSCAR appointment operations
- `src/app/api/oscar/sync/route.ts` - API endpoints for manual sync operations
- `src/app/api/oscar/webhooks/route.ts` - Webhook handler for OSCAR appointment updates
- `src/app/admin/oscar/page.tsx` - Admin interface for OSCAR integration management
- `src/components/Admin/OscarIntegration.tsx` - OSCAR integration dashboard component
- `src/components/Admin/OscarIntegration.test.tsx` - Unit tests for OSCAR integration component
- `prisma/migrations/add_oscar_fields/migration.sql` - Database migration for OSCAR reference fields
- `src/types/oscar.d.ts` - TypeScript type definitions for OSCAR API responses
- `src/lib/integrations/oscar-oauth-setup.ts` - OAuth token exchange flow service for initial authentication setup
- `src/lib/integrations/oscar-token-manager.ts` - Token refresh mechanism and health monitoring for long-lived integration access
- `env.template` - Environment template updated with OSCAR credentials configuration

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npx jest [optional/path/to/test/file]` to run tests
- Database migrations will extend existing PatientIntake and Appointment models
- Environment variables for OSCAR credentials should be added to `env.template`

## Tasks

- [x] 1.0 OSCAR API Setup & Authentication
  - [x] 1.1 Install and configure oauth-1.0a NPM package for OAuth 1.0a authentication
  - [x] 1.2 Add OSCAR environment variables to env.template (OSCAR_BASE_URL, OSCAR_CONSUMER_KEY, OSCAR_CONSUMER_SECRET, OSCAR_TOKEN, OSCAR_TOKEN_SECRET)
  - [x] 1.3 Create core OSCAR API client class with OAuth 1.0a signature generation
  - [x] 1.4 Implement OAuth token exchange flow for initial authentication setup
  - [x] 1.5 Add token refresh mechanism for long-lived integration access
  - [x] 1.6 Create OSCAR API connection testing functionality
  - [x] 1.7 Add comprehensive error handling for authentication failures
  - [x] 1.8 Write unit tests for OSCAR API client authentication methods
- [x] 2.0 Patient Registration Integration
  - [x] 2.1 Create database migration to add oscarDemographicNo field to PatientIntake model
  - [x] 2.2 Create field mapping service between intake form data and OSCAR demographics API
  - [x] 2.3 Implement patient search functionality using OSCAR quickSearch API by health number
  - [x] 2.4 Build patient creation service that posts to /oscar/ws/services/demographics
  - [x] 2.5 Add duplicate patient detection and handling logic (exact match, similar match, no match scenarios)
  - [x] 2.6 Integrate OSCAR patient creation into existing intake form submission workflow
  - [x] 2.7 Add data validation and sanitization before sending to OSCAR
  - [x] 2.8 Implement audit logging for all OSCAR patient operations
  - [x] 2.9 Write comprehensive unit tests for patient registration service
- [x] 3.0 Appointment Scheduling Integration
  - [x] 3.1 Create service to retrieve OSCAR providers and appointment types from API
  - [x] 3.2 Add database migration to include oscarAppointmentId field in Appointment model
  - [x] 3.3 Implement appointment availability checking against OSCAR schedule
  - [x] 3.4 Build appointment creation service using /oscar/ws/services/schedule/add
  - [x] 3.5 Create data mapping between booking form and OSCAR appointment fields
  - [x] 3.6 Integrate OSCAR appointment booking into existing appointment workflow
  - [x] 3.7 Add appointment status synchronization between systems
  - [x] 3.8 Implement provider caching for performance optimization
  - [x] 3.9 Write unit tests for appointment scheduling service
- [ ] 4.0 Error Handling & Queue Management
  - [ ] 4.1 Create background job queue system for OSCAR operations with Redis/database backing
  - [ ] 4.2 Implement exponential backoff retry logic for failed OSCAR API calls
  - [ ] 4.3 Add comprehensive error classification (network, auth, validation, rate limit)
  - [ ] 4.4 Create admin notification system for integration failures via email/dashboard
  - [ ] 4.5 Build manual processing interface for failed OSCAR operations
  - [ ] 4.6 Implement fallback appointment booking when OSCAR scheduling fails
  - [ ] 4.7 Add queue monitoring and management APIs for administrators
  - [ ] 4.8 Create data integrity checks to ensure local records remain consistent
  - [ ] 4.9 Write unit tests for queue management and error handling logic
- [ ] 5.0 Data Synchronization & Admin Dashboard
  - [ ] 5.1 Create webhook endpoint to receive OSCAR appointment updates
  - [ ] 5.2 Implement bidirectional sync logic to update local records from OSCAR changes
  - [ ] 5.3 Build admin dashboard component for OSCAR integration status monitoring
  - [ ] 5.4 Add manual sync trigger functionality for administrators
  - [ ] 5.5 Create sync status indicators throughout existing admin interface
  - [ ] 5.6 Implement conflict resolution logic for data discrepancies
  - [ ] 5.7 Add OSCAR integration management page with provider configuration
  - [ ] 5.8 Create comprehensive admin APIs for OSCAR operations management
  - [ ] 5.9 Write unit tests for synchronization logic and admin components 