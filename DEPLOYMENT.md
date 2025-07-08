# Deployment Guide - Zenith Medical Centre

This guide covers the complete deployment process for the Zenith Medical Centre application to Vercel with automated backups and compliance monitoring.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (external provider recommended for production)
- Vercel account
- GitHub repository
- Cloudinary account (for backup storage and file uploads)
- Domain name (optional)

## 1. Database Setup

### External PostgreSQL Database

For production, use a managed PostgreSQL service:
- **Neon** (recommended for Vercel integration)
- **Supabase**
- **PlanetScale**
- **Railway**
- **AWS RDS**

#### Setting up with Neon:

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update your production environment variables

## 2. Cloud Storage Setup

### Cloudinary Configuration

For backup storage and file uploads, set up Cloudinary:

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Go to your dashboard to find your credentials
3. Copy your Cloud Name, API Key, and API Secret
4. Add these to your environment variables

**Cloudinary Features Used:**
- Raw file uploads for database backups
- Secure URLs with encryption
- Organized folder structure by year
- Metadata and tagging for backup identification

## 3. Environment Variables

### Required Vercel Environment Variables

Configure these in your Vercel dashboard or using Vercel CLI:

```bash
# Application
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret

# Encryption (Generate new keys for production)
ENCRYPTION_KEY=32-character-hex-key
ENCRYPTION_IV=16-character-hex-iv

# Email (Choose one provider)
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@your-domain.com

# SMS (Optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM_NUMBER=your-twilio-number

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id

# Cloud Storage (for backups and file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Security
VERCEL_CRON_SECRET=optional-cron-security-token
```

### Setting Environment Variables

#### Using Vercel CLI:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set core environment variables
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production
vercel env add ENCRYPTION_KEY production

# Set Cloudinary environment variables
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production
vercel env add CLOUDINARY_API_SECRET production

# Set notification service variables
vercel env add SENDGRID_API_KEY production
vercel env add TWILIO_ACCOUNT_SID production
vercel env add TWILIO_AUTH_TOKEN production

# ... continue for all other variables
```

#### Using Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for "Production" environment

#### Validating Cloudinary Configuration:
```bash
# Verify Cloudinary environment variables are set
vercel env ls

# Should show:
# CLOUDINARY_CLOUD_NAME (production)
# CLOUDINARY_API_KEY (production)  
# CLOUDINARY_API_SECRET (production)

# Test Cloudinary configuration locally
vercel env pull .env.local
npm run dev
# Check backup functionality at /api/admin/backup/database
```

## 4. GitHub Secrets Setup

Configure these secrets in your GitHub repository settings:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
PRODUCTION_URL=https://your-domain.com
CODECOV_TOKEN=your-codecov-token (optional)
COMPLIANCE_CHECK_TOKEN=your-internal-token
VERCEL_DOMAIN=your-domain.com (optional)
```

### Getting Vercel Credentials:

```bash
# Get your Vercel token
vercel login
cat ~/.vercel/auth.json

# Get project and org IDs
vercel link
cat .vercel/project.json
```

## 5. Database Migration

### Initial Setup:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Create admin user
node scripts/create-admin-user.js
```

### Production Migration Strategy:
1. Always backup database before migrations
2. Test migrations on staging environment first
3. Use `prisma migrate deploy` for production
4. Monitor migration status

## 6. Deployment Process

### Automatic Deployment (Recommended)

1. **Push to Main Branch**: Triggers automatic deployment via GitHub Actions
2. **Quality Checks**: Security scanning, linting, testing
3. **Deploy**: Automatic deployment to Vercel
4. **Health Checks**: Post-deployment verification
5. **Compliance**: Automated HIPAA/PIPEDA checks

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 7. Domain Configuration

### Custom Domain Setup:

1. **Add Domain in Vercel**:
   ```bash
   vercel domains add your-domain.com
   ```

2. **Configure DNS**:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → Vercel IP addresses

3. **SSL Certificate**: Automatically managed by Vercel

## 8. Monitoring and Maintenance

### Automated Tasks

The following tasks run automatically:

- **Database Backup**: Daily at 2 AM UTC
- **Audit Log Cleanup**: Weekly on Sundays at 3 AM UTC
- **Compliance Check**: Weekly on Mondays at 4 AM UTC

### Health Monitoring

Monitor these endpoints:
- `https://your-domain.com/` - Homepage
- `https://your-domain.com/api/health` - API health
- `https://your-domain.com/admin/dashboard` - Admin access

### Log Monitoring

Use Vercel's built-in logging or integrate with:
- **Sentry** for error tracking
- **LogRocket** for user session replay
- **DataDog** for comprehensive monitoring

## 9. Security Considerations

### HIPAA Compliance Checklist

- ✅ Data encryption at rest and in transit
- ✅ Audit logging for all PHI access
- ✅ Role-based access control
- ✅ Automatic session timeout
- ✅ Regular compliance checks
- ✅ Secure backup procedures

### Security Headers

Configured in `vercel.json`:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict Transport Security

### Regular Security Tasks

1. **Monthly**: Review audit logs
2. **Quarterly**: Update dependencies
3. **Annually**: Security penetration testing
4. **As needed**: Compliance assessment

## 10. Backup and Recovery

### Automated Backups

- **Frequency**: Daily at 2 AM UTC
- **Retention**: 30 days (configurable)
- **Storage**: Cloudinary with secure upload and encryption
- **Verification**: Weekly backup integrity checks

### Manual Backup

```bash
# Trigger manual backup
curl -X POST https://your-domain.com/api/admin/backup/database \
  -H "Authorization: Bearer your-admin-token"
```

### Recovery Process

1. **Identify backup**: List available backups in Cloudinary
2. **Download backup**: Retrieve SQL dump from Cloudinary
3. **Stop application**: Temporarily disable during recovery
4. **Restore database**: Execute SQL dump
5. **Verify integrity**: Run data consistency checks
6. **Resume application**: Re-enable production traffic

## 11. Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
vercel logs your-deployment-url

# Local debugging
npm run build
```

#### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Check environment variables
vercel env ls
```

#### Cloudinary Configuration Issues
```bash
# Check if Cloudinary variables are set in Vercel
vercel env ls | grep CLOUDINARY

# Test Cloudinary connection locally
vercel env pull .env.local
node -e "
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log('Cloudinary config:', cloudinary.config());
"

# Verify backup uploads are working
curl -X POST https://your-domain.com/api/admin/backup/database \
  -H "Authorization: Bearer your-admin-token"
```

#### Performance Issues
```bash
# Check function execution time
vercel logs --since=1h

# Monitor database performance
# Use your database provider's monitoring tools
```

### Support Contacts

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Database Provider**: Check your provider's documentation
- **Application Issues**: Check GitHub Issues

## 12. Rollback Procedure

### Immediate Rollback

```bash
# Rollback to previous deployment
vercel rollback

# Or deploy specific commit
vercel --prod --force
```

### Database Rollback

1. **Stop application**: Prevent new data writes
2. **Restore backup**: Use most recent valid backup
3. **Verify data**: Check data integrity
4. **Resume application**: Re-enable production traffic
5. **Post-incident review**: Document lessons learned

## 13. Scaling Considerations

### Traffic Scaling
- Vercel automatically scales serverless functions
- Monitor function execution time and memory usage
- Consider edge caching for static content

### Database Scaling
- Monitor connection pool usage
- Consider read replicas for reporting
- Implement database connection pooling (PgBouncer)

### Storage Scaling
- Monitor Cloudinary backup storage growth
- Implement backup lifecycle policies using Cloudinary auto-upload features
- Consider data archival strategies with Cloudinary transformations

---

## Quick Start Checklist

- [ ] Database setup and migration
- [ ] Environment variables configured
- [ ] GitHub secrets added
- [ ] Domain DNS configured
- [ ] Initial admin user created
- [ ] Health checks passing
- [ ] Backup system verified
- [ ] Compliance checks passing
- [ ] Monitoring alerts configured
- [ ] Team access configured

For additional support, refer to the [PRD document](./tasks/prd-zenith-medical-website.md) or contact the development team. 