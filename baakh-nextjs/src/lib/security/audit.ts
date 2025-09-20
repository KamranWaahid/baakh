import { createAdminClient } from '@/lib/supabase/admin';

export interface AuditLogEntry {
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    const auditEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('audit_log')
      .insert([auditEntry]);
    
    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

/**
 * Log admin action
 */
export async function logAdminAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    ip_address: ipAddress,
    user_agent: userAgent
  });
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    action: event,
    resource_type: 'security',
    details,
    ip_address: ipAddress,
    user_agent: userAgent
  });
}

/**
 * Log API access
 */
export async function logApiAccess(
  endpoint: string,
  method: string,
  statusCode: number,
  ipAddress?: string,
  userAgent?: string,
  userId?: string
): Promise<void> {
  await logAuditEvent({
    user_id: userId,
    action: 'api_access',
    resource_type: 'api',
    resource_id: `${method} ${endpoint}`,
    details: {
      endpoint,
      method,
      status_code: statusCode
    },
    ip_address: ipAddress,
    user_agent: userAgent
  });
}

/**
 * Get client IP from request
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('X-Forwarded-For');
  const realIP = req.headers.get('X-Real-IP');
  const cfConnectingIP = req.headers.get('CF-Connecting-IP');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(req: Request): string {
  return req.headers.get('User-Agent') || 'unknown';
}
