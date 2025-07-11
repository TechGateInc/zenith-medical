# Admin UI Improvements Task List

## Relevant Files

- `src/components/Admin/TeamManager.tsx` - Contains the team member table with overlapping rows and default alert for deletion.
- `src/components/Admin/AdminSidebar.tsx` - Contains the sidebar navigation with hardcoded patient intake badge count.
- `src/app/admin/dashboard/intake/page.tsx` - Contains the patient intake page with API fetch error.
- `src/app/api/admin/intake/route.ts` - API route for fetching patient intake submissions.
- `src/app/api/admin/dashboard/route.ts` - API route for dashboard statistics including patient intake counts.
- `src/components/UI/Modal.tsx` - New component needed for custom delete confirmation modal.
- `src/lib/utils/intake-counter.ts` - New utility for calculating unviewed patient intake counts.
- `src/app/api/admin/intake/count/route.ts` - New API endpoint for getting unviewed patient intake count.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `TeamManager.tsx` and `TeamManager.test.tsx` in the same directory).
- Use `bun test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Fix Team Member Table Layout Issues
  - [x] 1.1 Fix overlapping table rows in TeamManager component by adjusting grid layout and ensuring proper row heights
  - [x] 1.2 Improve responsive design for table columns by adding responsive breakpoints and column hiding
  - [x] 1.3 Add proper spacing and alignment for table content with consistent padding and text alignment
  - [x] 1.4 Ensure consistent row heights and proper text wrapping by setting min-height and overflow handling
  - [x] 1.5 Add hover states and visual feedback for better user interaction
  - [x] 1.6 Implement proper loading skeleton for table rows during data fetching

- [ ] 2.0 Implement Custom Delete Confirmation Modal
  - [ ] 2.1 Create reusable Modal component with proper styling using Tailwind CSS
  - [ ] 2.2 Replace default browser confirm() with custom modal in TeamManager handleDelete function
  - [ ] 2.3 Add proper modal animations and backdrop with fade-in/out effects
  - [ ] 2.4 Implement keyboard navigation (Escape to close, Enter to confirm) and focus management
  - [ ] 2.5 Add loading state during deletion process with spinner and disabled buttons
  - [ ] 2.6 Add confirmation text with team member name and warning message
  - [ ] 2.7 Implement proper error handling for failed deletions with user feedback

- [ ] 3.0 Implement Dynamic Patient Intake Counter
  - [ ] 3.1 Create API endpoint `/api/admin/intake/count` for unviewed patient intake count
  - [ ] 3.2 Add logic to track viewed vs unviewed submissions by adding `viewedAt` field to database
  - [ ] 3.3 Update sidebar to fetch real-time count from API instead of hardcoded value
  - [ ] 3.4 Implement count refresh mechanism with polling or WebSocket updates
  - [ ] 3.5 Add visual indicator for new submissions with pulsing animation
  - [ ] 3.6 Create utility function to mark submissions as viewed when accessed
  - [ ] 3.7 Add database migration for new `viewedAt` field in PatientIntake model

- [ ] 4.0 Fix Patient Intake API Error
  - [ ] 4.1 Debug and fix the API fetch error in intake page by checking network requests and server logs
  - [ ] 4.2 Add proper error handling and user feedback with error boundaries and retry buttons
  - [ ] 4.3 Implement retry mechanism for failed requests with exponential backoff
  - [ ] 4.4 Add loading states and error boundaries with proper fallback UI
  - [ ] 4.5 Verify API route authentication and authorization is working correctly
  - [ ] 4.6 Add proper CORS headers and request validation to API endpoint

- [ ] 5.0 Enhance User Experience
  - [ ] 5.1 Add toast notifications for successful operations using a toast library or custom component
  - [ ] 5.2 Implement optimistic updates for better responsiveness in CRUD operations
  - [ ] 5.3 Add keyboard shortcuts for common actions (Ctrl+S for save, Delete for remove)
  - [ ] 5.4 Improve accessibility with proper ARIA labels, roles, and screen reader support
  - [ ] 5.5 Add confirmation dialogs for destructive actions beyond just deletion
  - [ ] 5.6 Implement auto-save functionality for form inputs to prevent data loss
  - [ ] 5.7 Add search highlighting and result count display for better search UX 