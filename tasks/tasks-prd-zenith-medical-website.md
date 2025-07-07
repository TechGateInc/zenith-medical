# Task List: Zenith Medical Centre Website

Based on PRD: `prd-zenith-medical-website.md`

## Relevant Files

- `package.json` - Project dependencies and scripts configuration
- `next.config.js` - Next.js configuration for HIPAA compliance and security settings
- `src/app/layout.tsx` - Root layout component for the Next.js app
- `src/app/page.tsx` - Homepage component
- `src/app/globals.css` - Global styles with Tailwind CSS directives and medical gradient
- `tailwind.config.js` - Tailwind CSS configuration for silver/grey/blue color palette
- `postcss.config.js` - PostCSS configuration for Tailwind CSS v4 processing
- `src/components/UI/Button.tsx` - Reusable button component with medical styling
- `prisma/schema.prisma` - Database schema for patient intake, admin users, and content with HIPAA compliance
- `src/lib/database/connection.ts` - Prisma database connection with health checks and graceful shutdown
- `src/lib/utils/encryption.ts` - AES-256 encryption utilities for PHI data (HIPAA/PIPEDA compliant)
- `scripts/setup-environment.js` - Environment setup script that generates secure encryption keys
- `lib/auth/config.ts` - NextAuth.js configuration for admin authentication
- `lib/utils/validation.ts` - Form validation utilities for intake form
- `lib/notifications/email.ts` - Email notification service integration
- `lib/notifications/sms.ts` - SMS notification service integration
- `src/app/about/page.tsx` - About page with clinic information and team profiles
- `src/app/services/page.tsx` - Services page with comprehensive medical offerings
- `src/app/contact/page.tsx` - Contact page with location, hours, and interactive contact form
- `src/app/faq/page.tsx` - FAQ page with expandable questions organized by category
- `src/app/blog/layout.tsx` - Blog section layout with SEO metadata
- `src/app/blog/page.tsx` - Blog listing page with health articles and category filtering
- `src/app/blog/[slug]/page.tsx` - Dynamic blog post pages with full article content
- `src/app/contact/layout.tsx` - Contact page layout with SEO metadata
- `src/app/faq/layout.tsx` - FAQ page layout with SEO metadata
- `pages/intake/form.tsx` - Patient intake form component
- `pages/intake/success.tsx` - Intake completion and booking redirect page
- `pages/admin/login.tsx` - Admin authentication page
- `pages/admin/dashboard.tsx` - Admin dashboard with intake submissions
- `pages/admin/content/blog.tsx` - Blog post management interface
- `pages/admin/content/faq.tsx` - FAQ management interface
- `pages/admin/content/team.tsx` - Team profile management interface
- `pages/api/intake/submit.ts` - API route for patient intake submission
- `pages/api/admin/intake/[id].ts` - API route for managing intake submissions
- `pages/api/admin/notifications.ts` - API route for sending notifications
- `pages/api/admin/export.ts` - API route for data export functionality
- `src/components/Layout/Header.tsx` - Main navigation with appointment CTAs
- `src/components/Layout/Footer.tsx` - Footer with contact information
- `src/components/Layout/Layout.tsx` - Main layout wrapper component
- `src/lib/utils/seo.ts` - Comprehensive SEO utilities with metadata generation and structured data
- `src/app/robots.txt/route.ts` - Dynamic robots.txt for search engine crawling guidelines
- `src/app/sitemap.xml/route.ts` - Dynamic sitemap.xml for search engine indexing
- `components/UI/Button.tsx` - Reusable button component for CTAs
- `components/Forms/IntakeForm.tsx` - Patient intake form component
- `components/Admin/Dashboard.tsx` - Admin dashboard interface
- `components/Admin/IntakeManager.tsx` - Intake submission management
- `styles/globals.css` - Global styles with medical color palette

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `IntakeForm.tsx` and `IntakeForm.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- All PHI data must be encrypted using AES-256 encryption before storage.
- HIPAA/PIPEDA compliance requires audit logging for all data access.

## Tasks

- [x] 1.0 Project Setup & Infrastructure
  - [x] 1.1 Initialize Next.js project with TypeScript and required dependencies
  - [x] 1.2 Configure Tailwind CSS with silver/grey/blue medical color palette
  - [x] 1.3 Set up PostgreSQL database with encryption configuration
  - [x] 1.4 Create database schema for patient intake, admin users, and content
  - [x] 1.5 Configure NextAuth.js for admin authentication
  - [x] 1.6 Implement AES-256 encryption utilities for PHI data
  - [x] 1.7 Set up environment variables and security configuration
- [x] 2.0 Public Website Pages & Navigation
  - [x] 2.1 Create responsive layout components (Header, Footer, Navigation)
  - [x] 2.2 Build homepage with prominent appointment booking CTAs
  - [x] 2.3 Create About page with clinic information and team profiles
  - [x] 2.4 Develop Services page with medical offerings
  - [x] 2.5 Build Contact page with location, hours, and contact form
  - [x] 2.6 Create FAQ page with expandable question sections
  - [x] 2.7 Implement blog listing and individual post pages
  - [x] 2.8 Add SEO optimization and meta tags for all pages
- [x] 3.0 Patient Intake System
  - [x] 3.1 Create patient intake form with all 14 required fields
  - [x] 3.2 Implement form validation for proper format and completeness
  - [x] 3.3 Add Privacy & Data-Use Policy acknowledgment component
  - [x] 3.4 Build intake form submission API with encryption
  - [x] 3.5 Create success page with third-party appointment booking redirect
  - [x] 3.6 Implement email notifications for new intake submissions
  - [x] 3.7 Add intake form accessibility features (WCAG 2.1 AA)
- [ ] 4.0 Admin Dashboard & Content Management
  - [x] 4.1 Create secure admin login page with authentication
  - [x] 4.2 Build admin dashboard with intake submissions overview
  - [x] 4.3 Implement intake submission management (view, filter, export)
  - [ ] 4.4 Create blog post content management interface
  - [ ] 4.5 Build FAQ management system for admin updates
  - [ ] 4.6 Develop team profile management with photo uploads
  - [ ] 4.7 Add notification system for appointment reminders
  - [x] 4.8 Implement data export functionality (PDF, Excel/CSV)
- [ ] 5.0 Integration, Security & Deployment
  - [ ] 5.1 Integrate third-party appointment booking system
  - [ ] 5.2 Set up email/SMS notification services (Twilio, SendGrid)
  - [ ] 5.3 Implement Google Analytics integration
  - [ ] 5.4 Add comprehensive security measures and audit logging
  - [ ] 5.5 Perform HIPAA/PIPEDA compliance review and testing
  - [ ] 5.6 Configure deployment pipeline with automated backups
  - [ ] 5.7 Conduct full application testing and performance optimization 