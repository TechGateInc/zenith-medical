# Encryption System Troubleshooting Guide

## Common Decryption Errors

If you're getting the error "Unable to decrypt patient data", here are the most common causes and solutions:

### 1. Missing Environment Variables

**Error Type**: `missing_encryption_keys`

**Cause**: The `ENCRYPTION_KEY` or `ENCRYPTION_IV` environment variables are not set.

**Solution**:
1. Check your `.env.local` file contains:
   ```
   ENCRYPTION_KEY=your_64_character_hex_key
   ENCRYPTION_IV=your_32_character_hex_key
   ```
2. If missing, generate new keys using Node.js:
   ```javascript
   const CryptoJS = require('crypto-js')
   
   // Generate ENCRYPTION_KEY (32 bytes = 64 hex characters)
   console.log('ENCRYPTION_KEY=' + CryptoJS.lib.WordArray.random(32).toString())
   
   // Generate ENCRYPTION_IV (16 bytes = 32 hex characters)
   console.log('ENCRYPTION_IV=' + CryptoJS.lib.WordArray.random(16).toString())
   ```

### 2. Invalid Environment Variables

**Error Type**: `invalid_encryption_keys`

**Cause**: The encryption keys are not the correct length.

**Requirements**:
- `ENCRYPTION_KEY`: Must be exactly 64 hex characters (32 bytes)
- `ENCRYPTION_IV`: Must be exactly 32 hex characters (16 bytes)

**Solution**: Generate new keys using the script above.

### 3. Corrupted Data

**Error Type**: `corrupted_data`

**Cause**: The encrypted data in the database is corrupted or was encrypted with different keys.

**Solutions**:
1. If you changed encryption keys after data was encrypted, you'll need to:
   - Restore the original keys, OR
   - Re-encrypt the data with new keys (requires data migration)

2. Check if specific records are corrupted by testing with different patient records.

### 4. Environment Configuration Issues

**Common Issues**:
- Keys contain invalid characters (must be hex only: 0-9, a-f)
- Extra spaces or newlines in environment variables
- Environment variables not loaded properly in production

## Testing Encryption System

### 1. Use the Debug Endpoint

**For Super Admins only**: Visit `/api/admin/debug/encryption` to check system health.

This will show:
- Environment variable status
- Configuration validation
- Encryption/decryption test results

### 2. Manual Testing

Create a test script to verify encryption:

```javascript
// test-encryption.js
require('dotenv').config({ path: '.env.local' })

const { 
  validateEncryptionConfig, 
  testEncryption, 
  encryptPHI, 
  decryptPHI 
} = require('./src/lib/utils/encryption')

console.log('=== Encryption System Test ===')

// 1. Check configuration
const config = validateEncryptionConfig()
console.log('Configuration:', config)

// 2. Test basic encryption
const test = testEncryption()
console.log('Basic test:', test)

// 3. Test with sample data
try {
  const sampleData = 'John Doe'
  const encrypted = encryptPHI(sampleData)
  const decrypted = decryptPHI(encrypted)
  
  console.log('Sample test:')
  console.log('  Original:', sampleData)
  console.log('  Encrypted:', encrypted.substring(0, 50) + '...')
  console.log('  Decrypted:', decrypted)
  console.log('  Match:', sampleData === decrypted)
} catch (error) {
  console.error('Sample test failed:', error.message)
}
```

Run with: `node test-encryption.js`

## Production Deployment Checklist

Before deploying to production:

1. **Environment Variables**: Ensure `ENCRYPTION_KEY` and `ENCRYPTION_IV` are set in production environment
2. **Key Security**: Store keys securely (use secrets manager, not plain text files)
3. **Backup Keys**: Securely backup encryption keys - losing them means losing all encrypted data
4. **Key Rotation**: Plan for periodic key rotation strategy
5. **Monitor**: Set up monitoring for decryption failures

## Emergency Procedures

### If Encryption Keys Are Lost

**⚠️ CRITICAL**: If encryption keys are lost, all encrypted patient data becomes unrecoverable.

**Prevention**:
- Store keys in multiple secure locations
- Use proper secrets management
- Document key recovery procedures

**If keys are lost**:
1. Immediately stop the application to prevent new data corruption
2. Check all possible backup locations for keys
3. If keys cannot be recovered, data may be permanently lost
4. Contact your data protection officer and legal team
5. Follow breach notification procedures if required

### Database Migration

If you need to change encryption keys:

1. **Backup**: Create full database backup
2. **Test**: Test migration process on copy of data
3. **Migrate**: Create migration script to:
   - Decrypt existing data with old keys
   - Re-encrypt with new keys
   - Update environment variables
4. **Verify**: Confirm all data can be decrypted with new keys
5. **Deploy**: Update production environment

## Getting Help

1. Check server logs for detailed error messages
2. Use the debug endpoint to identify specific issues
3. Verify environment configuration
4. Test encryption system with sample data
5. Contact system administrator if issues persist

## Security Notes

- Never log or expose encryption keys
- Always use HTTPS in production
- Implement proper access controls
- Regular security audits
- Follow HIPAA/PIPEDA compliance requirements