import { NextRequest, NextResponse } from 'next/server';
import { isIPWhitelisted, getClientIP } from './ip-whitelist';
import { logSecurityEvent } from './audit';

/**
 * IP Whitelist Middleware
 */
export function withIPWhitelist(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('User-Agent') || 'unknown';
    
    try {
      const whitelistCheck = await isIPWhitelisted(clientIP);
      
      if (!whitelistCheck.allowed) {
        // Log unauthorized access attempt
        await logSecurityEvent('unauthorized_ip_access', {
          ip_address: clientIP,
          user_agent: userAgent,
          reason: whitelistCheck.reason,
          endpoint: req.url
        }, clientIP, userAgent);
        
        return NextResponse.json(
          { 
            error: 'Access denied',
            message: 'Your IP address is not authorized to access this resource',
            code: 'IP_NOT_WHITELISTED'
          },
          { 
            status: 403,
            headers: {
              'X-IP-Status': 'blocked',
              'X-IP-Reason': whitelistCheck.reason || 'not_whitelisted'
            }
          }
        );
      }
      
      // Add IP info to response headers for debugging
      const response = await handler(req);
      response.headers.set('X-IP-Status', 'allowed');
      response.headers.set('X-IP-Address', clientIP);
      
      return response;
      
    } catch (error) {
      console.error('IP whitelist check failed:', error);
      
      // Log the error
      await logSecurityEvent('ip_whitelist_error', {
        ip_address: clientIP,
        user_agent: userAgent,
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: req.url
      }, clientIP, userAgent);
      
      // For now, allow access if whitelist check fails
      // In production, you might want to be more restrictive
      return handler(req);
    }
  };
}

/**
 * Enhanced IP tracking with geolocation
 */
export async function getIPInfo(ip: string): Promise<{
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  threat_level: 'low' | 'medium' | 'high';
  is_vpn: boolean;
  is_proxy: boolean;
}> {
  try {
    // In a real implementation, you'd use a service like:
    // - IPGeolocation API
    // - MaxMind GeoIP2
    // - AbuseIPDB
    // - IPQualityScore
    
    // For now, return basic info
    return {
      ip,
      threat_level: 'low',
      is_vpn: false,
      is_proxy: false
    };
  } catch (error) {
    console.error('Error getting IP info:', error);
    return {
      ip,
      threat_level: 'medium', // Default to medium if we can't determine
      is_vpn: false,
      is_proxy: false
    };
  }
}

/**
 * Check for suspicious IP patterns
 */
export async function checkSuspiciousIP(ip: string): Promise<{
  is_suspicious: boolean;
  reasons: string[];
  threat_score: number;
}> {
  const reasons: string[] = [];
  let threatScore = 0;
  
  try {
    const ipInfo = await getIPInfo(ip);
    
    // Check for VPN/Proxy
    if (ipInfo.is_vpn) {
      reasons.push('VPN detected');
      threatScore += 30;
    }
    
    if (ipInfo.is_proxy) {
      reasons.push('Proxy detected');
      threatScore += 40;
    }
    
    // Check for known malicious IPs (in real implementation, use threat intelligence)
    // This is a placeholder - you'd integrate with threat feeds
    const maliciousIPs = [
      // Add known malicious IPs here
    ];
    
    if (maliciousIPs.includes(ip)) {
      reasons.push('Known malicious IP');
      threatScore += 100;
    }
    
    // Check for suspicious patterns
    const ipParts = ip.split('.');
    if (ipParts.length === 4) {
      // Check for private IPs accessing from public context
      const firstOctet = parseInt(ipParts[0]);
      if (firstOctet === 192 || firstOctet === 10 || firstOctet === 172) {
        reasons.push('Private IP in public context');
        threatScore += 20;
      }
    }
    
    return {
      is_suspicious: threatScore > 50,
      reasons,
      threat_score: Math.min(threatScore, 100)
    };
    
  } catch (error) {
    console.error('Error checking suspicious IP:', error);
    return {
      is_suspicious: false,
      reasons: [],
      threat_score: 0
    };
  }
}



