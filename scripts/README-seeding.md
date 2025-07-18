# Database Seeding Guide

This guide explains how to populate the Zenith Medical Centre database with initial data extracted from the existing codebase.

## Overview

The seeding script (`seed-database.js`) populates the database with:

- **Admin User** - System administrator account for accessing the admin panel
- **Team Members** - 4 medical professionals from the About page
- **Blog Posts** - 5 comprehensive health articles 
- **FAQ Items** - 17 frequently asked questions with answers

## Prerequisites

Before running the seeding script, ensure:

1. **Database is set up** - PostgreSQL database is running and accessible
2. **Environment variables** - `.env` file is configured with database connection
3. **Prisma is configured** - Database schema is migrated
4. **Dependencies installed** - `npm install` has been run

## Running the Seed Script

### Step 1: Prepare the Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### Step 2: Run the Seeding Script

```bash
# Execute the seeding script
node scripts/seed-database.js
```

### Step 3: Verify the Results

The script will output progress and a summary:

```
🎉 Database seeding completed successfully!

📊 Summary:
👤 Admin users: 1
👥 Team members: 4
📝 Blog posts: 5
❓ FAQ items: 17
```

## Admin Access

After seeding, you can access the admin panel with:

- **Email:** `admin@zenithmedical.ca`
- **Password:** `Admin123!`

⚠️ **IMPORTANT:** Change the admin password immediately after first login!

## Seeded Data Details

### Team Members

| Name | Role | Specialties |
|------|------|-------------|
| Dr. Sarah Mitchell | Chief Medical Officer & Family Physician | Family Medicine, Preventive Care, Women's Health |
| Dr. Michael Chen | Family Physician | Family Medicine, Chronic Care, Geriatrics |
| Dr. Emily Rodriguez | Family Physician | Family Medicine, Pediatrics, Mental Health |
| Jennifer Thompson | Nurse Practitioner | Primary Care, Health Promotion, Patient Education |

### Blog Posts

1. **Understanding Annual Physical Exams: What to Expect** - Comprehensive guide to physical exams
2. **Managing Chronic Conditions: A Comprehensive Guide** - Practical chronic disease management
3. **Mental Health Awareness: Breaking the Stigma** - Mental health education and resources
4. **Flu Season Preparation: Vaccination and Prevention Tips** - Seasonal health guidance
5. **Women's Health: Essential Screenings by Age** - Age-appropriate women's health screenings

### FAQ Categories

- **Appointments & Scheduling** - 4 questions about booking and appointments
- **Insurance & Billing** - 3 questions about insurance and payment
- **Services & Treatments** - 4 questions about medical services
- **Patient Information** - 4 questions about records and policies
- **COVID & Safety** - 2 questions about safety measures and telehealth

## Re-running the Script

The seeding script is **idempotent** - it can be run multiple times safely:

- **Existing records** are updated with new data
- **New records** are created if they don't exist
- **No duplicates** will be created

## Customizing the Data

To modify the seeded data:

1. Edit the data arrays in `scripts/seed-database.js`:
   - `adminUser` - Admin account details
   - `teamMembers` - Team member information
   - `blogPosts` - Blog content and metadata
   - `faqItems` - FAQ questions and answers

2. Re-run the seeding script to apply changes

## Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check database is running
pg_ctl status

# Verify environment variables
cat .env | grep DATABASE_URL
```

**Prisma Client Not Generated**
```bash
# Regenerate Prisma client
npx prisma generate
```

**Migration Issues**
```bash
# Reset and re-run migrations
npx prisma migrate reset
npx prisma migrate dev
```

**Permission Errors**
```bash
# Check database permissions
psql $DATABASE_URL -c "\du"
```

### Recovery

If seeding fails partially:

1. **Check the error message** - Most errors indicate specific validation issues
2. **Fix the data** - Update the problematic records in the script
3. **Re-run the script** - The idempotent design allows safe re-execution
4. **Manual cleanup** (if needed) - Use Prisma Studio or SQL commands

## Production Considerations

### Security

- **Change default password** immediately in production
- **Use environment variables** for sensitive configuration
- **Generate secure passwords** for admin accounts
- **Review user permissions** and roles

### Data Migration

For production deployment:

1. **Backup existing data** before seeding
2. **Test seeding** in staging environment first
3. **Use production-appropriate** admin credentials
4. **Verify all data** after seeding completion

### Maintenance

- **Regular backups** of seeded data
- **Version control** for seed script changes
- **Documentation updates** when modifying content
- **Testing** seed script with each major update

## Next Steps

After successful seeding:

1. **Login to admin panel** at `/admin/login`
2. **Change admin password** in user settings
3. **Review seeded content** in admin interfaces
4. **Customize content** as needed for your practice
5. **Test public pages** to ensure data displays correctly

## Support

For issues or questions:

- Check the main project README for general setup
- Review Prisma documentation for database issues
- Consult Next.js documentation for application problems 