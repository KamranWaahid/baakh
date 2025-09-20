import { createAdminClient } from '@/lib/supabase/admin';

export interface IPWhitelistEntry {
  id: number;
  ip_address: string;
  description: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
  expires_at?: string;
}

export interface IPWhitelistRule {
  id: number;
  ip_pattern: string;
  description: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  created_by: string;
}

/**
 * Check if an IP address is whitelisted
 */
export async function isIPWhitelisted(ipAddress: string): Promise<{
  allowed: boolean;
  reason?: string;
  rule?: IPWhitelistEntry | IPWhitelistRule;
}> {
  try {
    const supabase = createAdminClient();
    
    // Check exact IP matches first
    const { data: exactMatch } = await supabase
      .from('ip_whitelist')
      .select('*')
      .eq('ip_address', ipAddress)
      .eq('is_active', true)
      .single();
    
    if (exactMatch) {
      return {
        allowed: true,
        reason: 'IP whitelisted',
        rule: exactMatch
      };
    }
    
    // Check pattern matches
    const { data: patternMatches } = await supabase
      .from('ip_whitelist_patterns')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });
    
    for (const pattern of patternMatches || []) {
      if (matchesIPPattern(ipAddress, pattern.ip_pattern)) {
        return {
          allowed: true,
          reason: 'IP pattern matched',
          rule: pattern
        };
      }
    }
    
    return { allowed: false, reason: 'IP not whitelisted' };
    
  } catch (error) {
    console.error('Error checking IP whitelist:', error);
    // Fail open for now, but log the error
    return { allowed: true, reason: 'Whitelist check failed - allowing access' };
  }
}

/**
 * Check if IP matches a pattern (supports CIDR, wildcards, ranges)
 */
function matchesIPPattern(ip: string, pattern: string): boolean {
  // Handle CIDR notation (e.g., 192.168.1.0/24)
  if (pattern.includes('/')) {
    return matchesCIDR(ip, pattern);
  }
  
  // Handle wildcard patterns (e.g., 192.168.*.*)
  if (pattern.includes('*')) {
    const regex = pattern.replace(/\*/g, '\\d+').replace(/\./g, '\\.');
    return new RegExp(`^${regex}$`).test(ip);
  }
  
  // Handle IP ranges (e.g., 192.168.1.1-192.168.1.100)
  if (pattern.includes('-')) {
    return matchesIPRange(ip, pattern);
  }
  
  // Exact match
  return ip === pattern;
}

/**
 * Check if IP matches CIDR notation
 */
function matchesCIDR(ip: string, cidr: string): boolean {
  try {
    const [network, prefixLength] = cidr.split('/');
    const mask = -1 << (32 - parseInt(prefixLength));
    
    const ipNum = ipToNumber(ip);
    const networkNum = ipToNumber(network);
    
    return (ipNum & mask) === (networkNum & mask);
  } catch {
    return false;
  }
}

/**
 * Check if IP is within a range
 */
function matchesIPRange(ip: string, range: string): boolean {
  try {
    const [start, end] = range.split('-');
    const ipNum = ipToNumber(ip);
    const startNum = ipToNumber(start.trim());
    const endNum = ipToNumber(end.trim());
    
    return ipNum >= startNum && ipNum <= endNum;
  } catch {
    return false;
  }
}

/**
 * Convert IP address to number
 */
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

/**
 * Add IP to whitelist
 */
export async function addIPToWhitelist(
  ipAddress: string,
  description: string,
  createdBy: string,
  expiresAt?: string
): Promise<IPWhitelistEntry> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('ip_whitelist')
    .insert({
      ip_address: ipAddress,
      description,
      is_active: true,
      created_by: createdBy,
      expires_at: expiresAt
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to add IP to whitelist: ${error.message}`);
  }
  
  return data;
}

/**
 * Add IP pattern to whitelist
 */
export async function addIPPatternToWhitelist(
  ipPattern: string,
  description: string,
  createdBy: string,
  priority: number = 1
): Promise<IPWhitelistRule> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('ip_whitelist_patterns')
    .insert({
      ip_pattern: ipPattern,
      description,
      is_active: true,
      priority,
      created_by: createdBy
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to add IP pattern to whitelist: ${error.message}`);
  }
  
  return data;
}

/**
 * Remove IP from whitelist
 */
export async function removeIPFromWhitelist(ipAddress: string): Promise<void> {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('ip_whitelist')
    .delete()
    .eq('ip_address', ipAddress);
  
  if (error) {
    throw new Error(`Failed to remove IP from whitelist: ${error.message}`);
  }
}

/**
 * Get all whitelisted IPs
 */
export async function getWhitelistedIPs(): Promise<IPWhitelistEntry[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('ip_whitelist')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get whitelisted IPs: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('X-Forwarded-For');
  const realIP = request.headers.get('X-Real-IP');
  const cfConnectingIP = request.headers.get('CF-Connecting-IP');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  // Fallback to a default IP if none found
  return '127.0.0.1';
}

/**
 * Get all IP patterns
 */
export async function getIPPatterns(): Promise<IPWhitelistRule[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('ip_whitelist_patterns')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get IP patterns: ${error.message}`);
  }
  
  return data || [];
}
