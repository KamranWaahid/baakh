# 🔒 Security Implementation Guide

This document outlines the comprehensive security measures implemented in the Baakh Admin Panel.

## 🛡️ Security Features Implemented

### 1. XSS Protection
- **Fixed**: Removed all `innerHTML` usage with user-controlled data
- **Fixed**: Sanitized `dangerouslySetInnerHTML` content in SEO component
- **Added**: HTML sanitization functions for all user inputs
- **Added**: Content Security Policy (CSP) headers

### 2. CSRF Protection
- **Added**: CSRF token generation and validation system
- **Added**: Signed CSRF tokens for additional security
- **Added**: CSRF middleware for all API endpoints
- **Added**: Client-side CSRF hook for secure requests

### 3. Input Validation & Sanitization
- **Added**: Comprehensive Zod schemas for all data types
- **Added**: Server-side input validation on all API endpoints
- **Added**: HTML entity escaping and sanitization
- **Added**: File upload validation with type and size checks

### 4. Server-Side Security
- **Fixed**: Moved lockout mechanism from client-side to server-side
- **Added**: Rate limiting middleware (100 requests per 15 minutes)
- **Added**: IP-based tracking for security events
- **Added**: Comprehensive audit logging system

### 5. Security Headers
- **Added**: X-Content-Type-Options: nosniff
- **Added**: X-Frame-Options: DENY
- **Added**: X-XSS-Protection: 1; mode=block
- **Added**: Referrer-Policy: strict-origin-when-cross-origin
- **Added**: Content Security Policy (CSP)
- **Added**: Permissions Policy

### 6. Authentication & Authorization
- **Enhanced**: Multi-layer authentication verification
- **Added**: Server-side session validation
- **Added**: Role-based access control (RBAC)
- **Added**: Admin privilege verification

### 7. Database Security
- **Added**: Row Level Security (RLS) policies
- **Added**: Parameterized queries (prevents SQL injection)
- **Added**: Service role isolation
- **Added**: Audit logging tables

## 🔧 Security Configuration

### Environment Variables Required
```bash
# CSRF Secret (generate a strong random string)
CSRF_SECRET=your-strong-csrf-secret-here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Configuration
ADMIN_EMAIL_ALLOWLIST=admin1@example.com,admin2@example.com
AUTO_ELEVATE_ADMINS=false
```

### Database Setup
Run the SQL migration in `migrations/security_tables.sql` to create:
- `login_attempts` table for server-side lockout
- `audit_log` table for comprehensive logging
- `csrf_tokens` table for CSRF token management
- RLS policies for data protection

## 🚀 Usage Examples

### Using CSRF Protection
```typescript
import { useCSRF } from '@/hooks/useCSRF';

function MyComponent() {
  const { makeSecureRequest, csrfToken } = useCSRF();
  
  const handleSubmit = async (data) => {
    const response = await makeSecureRequest('/api/admin/poets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };
}
```

### Using Input Validation
```typescript
import { validateApiInput, poetCreateSchema } from '@/lib/security/validation';

// In API route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateApiInput(body, poetCreateSchema);
    // Use validatedData safely
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

### Using Audit Logging
```typescript
import { logAdminAction } from '@/lib/security/audit';

// Log admin actions
await logAdminAction(
  userId,
  'create_poet',
  'poet',
  newPoet.id,
  { poet_name: newPoet.english_name },
  ipAddress,
  userAgent
);
```

## 🔍 Security Monitoring

### Audit Log Queries
```sql
-- View recent admin actions
SELECT * FROM audit_log 
WHERE action = 'create_poet' 
ORDER BY timestamp DESC 
LIMIT 10;

-- Check failed login attempts
SELECT * FROM login_attempts 
WHERE attempts >= 3 
ORDER BY last_attempt DESC;

-- View security events
SELECT * FROM audit_log 
WHERE resource_type = 'security' 
ORDER BY timestamp DESC;
```

### Rate Limiting Monitoring
The system automatically tracks and limits requests per IP address. Check the `login_attempts` table for rate limiting data.

## 🛠️ Security Maintenance

### Regular Tasks
1. **Clean up expired records** (automated via database function)
2. **Monitor audit logs** for suspicious activity
3. **Review failed login attempts** regularly
4. **Update CSRF secrets** periodically
5. **Review and update RLS policies** as needed

### Security Checklist
- [ ] All API endpoints use CSRF protection
- [ ] All inputs are validated and sanitized
- [ ] Security headers are properly configured
- [ ] Audit logging is working correctly
- [ ] Rate limiting is active
- [ ] Database RLS policies are enforced
- [ ] Environment variables are secure

## 🚨 Incident Response

### If Security Breach Suspected
1. Check audit logs for suspicious activity
2. Review failed login attempts
3. Check for unusual API access patterns
4. Verify CSRF token integrity
5. Review user permissions and roles

### Emergency Procedures
1. **Disable admin access**: Update RLS policies
2. **Reset CSRF secrets**: Update CSRF_SECRET
3. **Clear sessions**: Force re-authentication
4. **Review logs**: Analyze audit trail
5. **Update security**: Patch vulnerabilities

## 📊 Security Metrics

### Key Performance Indicators
- **Failed login attempts per hour**
- **CSRF token validation success rate**
- **Rate limiting triggers per day**
- **Audit log entries per day**
- **Average response time with security middleware**

### Monitoring Alerts
Set up alerts for:
- Multiple failed login attempts from same IP
- High rate of CSRF token failures
- Unusual API access patterns
- Database connection errors
- Security middleware failures

## 🔐 Security Best Practices

### Development
1. Always validate and sanitize user inputs
2. Use CSRF tokens for all state-changing requests
3. Implement proper error handling without information leakage
4. Log all security-relevant events
5. Use parameterized queries for database operations

### Deployment
1. Use HTTPS in production
2. Set secure environment variables
3. Enable database RLS policies
4. Monitor security logs regularly
5. Keep dependencies updated

### Maintenance
1. Regular security audits
2. Penetration testing
3. Code security reviews
4. Dependency vulnerability scanning
5. Security training for developers

---

## 📞 Security Contact

For security-related issues or questions, please contact the development team or create a security issue in the project repository.

**Remember**: Security is an ongoing process, not a one-time implementation. Regular reviews and updates are essential for maintaining a secure application.
