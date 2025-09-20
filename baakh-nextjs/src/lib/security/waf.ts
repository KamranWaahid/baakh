import { NextRequest, NextResponse } from 'next/server';
import { createSecurityAlert } from './alerts';
import { getClientIP } from './ip-whitelist';

interface WAFRule {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'block' | 'log' | 'challenge';
  description: string;
  enabled: boolean;
}

interface WAFConfig {
  enabled: boolean;
  blockThreshold: number; // Number of violations before blocking
  timeWindow: number; // Time window in minutes
  challengeThreshold: number; // Number of violations before challenge
  whitelist: string[]; // IP addresses to whitelist
  blacklist: string[]; // IP addresses to blacklist
}

class WebApplicationFirewall {
  private rules: Map<string, WAFRule> = new Map();
  private violationCounts: Map<string, { count: number; lastViolation: Date }> = new Map();
  private config: WAFConfig;

  constructor() {
    this.config = {
      enabled: process.env.WAF_ENABLED === 'true',
      blockThreshold: parseInt(process.env.WAF_BLOCK_THRESHOLD || '10'),
      timeWindow: parseInt(process.env.WAF_TIME_WINDOW || '15'),
      challengeThreshold: parseInt(process.env.WAF_CHALLENGE_THRESHOLD || '5'),
      whitelist: (process.env.WAF_WHITELIST || '').split(',').filter(Boolean),
      blacklist: (process.env.WAF_BLACKLIST || '').split(',').filter(Boolean)
    };

    this.initializeRules();
  }

  /**
   * Initialize WAF rules
   */
  private initializeRules(): void {
    const rules: WAFRule[] = [
      // SQL Injection Rules
      {
        id: 'sql_injection_1',
        name: 'SQL Injection - Basic',
        pattern: /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(from|into|where|set|values)\b)/i,
        severity: 'critical',
        action: 'block',
        description: 'Basic SQL injection pattern detected',
        enabled: true
      },
      {
        id: 'sql_injection_2',
        name: 'SQL Injection - Comments',
        pattern: /(--|\/\*|\*\/|#)/i,
        severity: 'high',
        action: 'block',
        description: 'SQL comment injection pattern detected',
        enabled: true
      },
      {
        id: 'sql_injection_3',
        name: 'SQL Injection - Quotes',
        pattern: /('|"|`).*(\bor\b|\band\b).*('|"|`)/i,
        severity: 'high',
        action: 'block',
        description: 'SQL quote injection pattern detected',
        enabled: true
      },

      // XSS Rules
      {
        id: 'xss_1',
        name: 'XSS - Script Tags',
        pattern: /<script[^>]*>.*?<\/script>/i,
        severity: 'critical',
        action: 'block',
        description: 'Script tag injection detected',
        enabled: true
      },
      {
        id: 'xss_2',
        name: 'XSS - Event Handlers',
        pattern: /on\w+\s*=/i,
        severity: 'high',
        action: 'block',
        description: 'Event handler injection detected',
        enabled: true
      },
      {
        id: 'xss_3',
        name: 'XSS - JavaScript Protocol',
        pattern: /javascript\s*:/i,
        severity: 'high',
        action: 'block',
        description: 'JavaScript protocol injection detected',
        enabled: true
      },
      {
        id: 'xss_4',
        name: 'XSS - Data URI',
        pattern: /data\s*:\s*text\/html/i,
        severity: 'medium',
        action: 'log',
        description: 'Data URI with HTML content detected',
        enabled: true
      },

      // Command Injection Rules
      {
        id: 'command_injection_1',
        name: 'Command Injection - Basic',
        pattern: /[;&|`$(){}[\]]/,
        severity: 'high',
        action: 'block',
        description: 'Command injection characters detected',
        enabled: true
      },
      {
        id: 'command_injection_2',
        name: 'Command Injection - System Commands',
        pattern: /\b(ls|cat|pwd|whoami|id|uname|ps|netstat|ifconfig|ping|nslookup)\b/i,
        severity: 'critical',
        action: 'block',
        description: 'System command injection detected',
        enabled: true
      },

      // Path Traversal Rules
      {
        id: 'path_traversal_1',
        name: 'Path Traversal - Basic',
        pattern: /\.\.\//,
        severity: 'high',
        action: 'block',
        description: 'Path traversal pattern detected',
        enabled: true
      },
      {
        id: 'path_traversal_2',
        name: 'Path Traversal - Encoded',
        pattern: /%2e%2e%2f|%2e%2e%5c/i,
        severity: 'high',
        action: 'block',
        description: 'Encoded path traversal pattern detected',
        enabled: true
      },

      // File Upload Rules
      {
        id: 'file_upload_1',
        name: 'File Upload - Executable',
        pattern: /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp)$/i,
        severity: 'critical',
        action: 'block',
        description: 'Executable file upload detected',
        enabled: true
      },
      {
        id: 'file_upload_2',
        name: 'File Upload - Script',
        pattern: /\.(php|asp|aspx|jsp|cgi|pl|py|rb|sh)$/i,
        severity: 'high',
        action: 'block',
        description: 'Script file upload detected',
        enabled: true
      },

      // LDAP Injection Rules
      {
        id: 'ldap_injection_1',
        name: 'LDAP Injection - Basic',
        pattern: /[()=*!&|]/,
        severity: 'medium',
        action: 'log',
        description: 'LDAP injection characters detected',
        enabled: true
      },

      // NoSQL Injection Rules
      {
        id: 'nosql_injection_1',
        name: 'NoSQL Injection - MongoDB',
        pattern: /\$where|\$ne|\$gt|\$lt|\$regex|\$exists/i,
        severity: 'high',
        action: 'block',
        description: 'MongoDB injection pattern detected',
        enabled: true
      },

      // SSRF Rules
      {
        id: 'ssrf_1',
        name: 'SSRF - Internal IPs',
        pattern: /(127\.0\.0\.1|localhost|0\.0\.0\.0|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/i,
        severity: 'high',
        action: 'log',
        description: 'Internal IP access attempt detected',
        enabled: true
      },

      // Sensitive Data Exposure
      {
        id: 'sensitive_data_1',
        name: 'Sensitive Data - Credit Card',
        pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
        severity: 'medium',
        action: 'log',
        description: 'Credit card number pattern detected',
        enabled: true
      },
      {
        id: 'sensitive_data_2',
        name: 'Sensitive Data - SSN',
        pattern: /\b\d{3}-\d{2}-\d{4}\b/,
        severity: 'medium',
        action: 'log',
        description: 'SSN pattern detected',
        enabled: true
      }
    ];

    rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Process a request through the WAF
   */
  async processRequest(request: NextRequest): Promise<NextResponse | null> {
    if (!this.config.enabled) {
      return null; // WAF disabled
    }

    const clientIP = getClientIP(request);
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';

    // Check blacklist
    if (this.config.blacklist.includes(clientIP)) {
      await this.logViolation('blacklisted_ip', 'critical', `Blacklisted IP: ${clientIP}`, {
        ip: clientIP,
        url: request.url,
        userAgent
      });
      return this.createBlockResponse('Access denied');
    }

    // Check whitelist
    if (this.config.whitelist.includes(clientIP)) {
      return null; // Whitelisted IP, skip WAF
    }

    // Check for violations
    const violations = await this.checkViolations(request);
    
    if (violations.length > 0) {
      await this.handleViolations(clientIP, violations, request);
      
      // Check if IP should be blocked
      const violationCount = this.getViolationCount(clientIP);
      
      if (violationCount >= this.config.blockThreshold) {
        return this.createBlockResponse('Too many security violations');
      }
      
      if (violationCount >= this.config.challengeThreshold) {
        return this.createChallengeResponse();
      }
    }

    return null; // No violations, allow request
  }

  /**
   * Check for WAF rule violations
   */
  private async checkViolations(request: NextRequest): Promise<Array<{ rule: WAFRule; match: string; location: string }>> {
    const violations: Array<{ rule: WAFRule; match: string; location: string }> = [];
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    const body = await this.getRequestBody(request);

    // Check URL
    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) continue;

      const urlMatch = rule.pattern.exec(url.toString());
      if (urlMatch) {
        violations.push({
          rule,
          match: urlMatch[0],
          location: 'URL'
        });
      }

      // Check query parameters
      for (const [key, value] of url.searchParams.entries()) {
        const paramMatch = rule.pattern.exec(`${key}=${value}`);
        if (paramMatch) {
          violations.push({
            rule,
            match: paramMatch[0],
            location: `Query Parameter: ${key}`
          });
        }
      }

      // Check User-Agent
      const uaMatch = rule.pattern.exec(userAgent);
      if (uaMatch) {
        violations.push({
          rule,
          match: uaMatch[0],
          location: 'User-Agent'
        });
      }

      // Check request body
      if (body) {
        const bodyMatch = rule.pattern.exec(body);
        if (bodyMatch) {
          violations.push({
            rule,
            match: bodyMatch[0],
            location: 'Request Body'
          });
        }
      }
    }

    return violations;
  }

  /**
   * Get request body for inspection
   */
  private async getRequestBody(request: NextRequest): Promise<string | null> {
    try {
      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json') || contentType.includes('text/')) {
          const body = await request.text();
          return body.length > 10000 ? body.substring(0, 10000) : body; // Limit body size
        }
      }
    } catch (error) {
      console.error('Error reading request body:', error);
    }
    
    return null;
  }

  /**
   * Handle WAF violations
   */
  private async handleViolations(
    clientIP: string, 
    violations: Array<{ rule: WAFRule; match: string; location: string }>,
    request: NextRequest
  ): Promise<void> {
    for (const violation of violations) {
      await this.logViolation(
        violation.rule.id,
        violation.rule.severity,
        `${violation.rule.name}: ${violation.match} in ${violation.location}`,
        {
          rule: violation.rule.name,
          match: violation.match,
          location: violation.location,
          ip: clientIP,
          url: request.url,
          method: request.method,
          userAgent: request.headers.get('user-agent')
        }
      );

      this.incrementViolationCount(clientIP);
    }
  }

  /**
   * Log a WAF violation
   */
  private async logViolation(
    ruleId: string,
    severity: string,
    description: string,
    details: Record<string, any>
  ): Promise<void> {
    await createSecurityAlert(
      'waf_violation',
      severity,
      `WAF Violation: ${ruleId}`,
      description,
      details
    );
  }

  /**
   * Increment violation count for an IP
   */
  private incrementViolationCount(clientIP: string): void {
    const now = new Date();
    const existing = this.violationCounts.get(clientIP);
    
    if (existing) {
      // Reset count if time window has passed
      const timeDiff = now.getTime() - existing.lastViolation.getTime();
      if (timeDiff > this.config.timeWindow * 60 * 1000) {
        this.violationCounts.set(clientIP, { count: 1, lastViolation: now });
      } else {
        existing.count++;
        existing.lastViolation = now;
      }
    } else {
      this.violationCounts.set(clientIP, { count: 1, lastViolation: now });
    }
  }

  /**
   * Get violation count for an IP
   */
  private getViolationCount(clientIP: string): number {
    const existing = this.violationCounts.get(clientIP);
    if (!existing) return 0;

    const now = new Date();
    const timeDiff = now.getTime() - existing.lastViolation.getTime();
    
    // Reset count if time window has passed
    if (timeDiff > this.config.timeWindow * 60 * 1000) {
      this.violationCounts.delete(clientIP);
      return 0;
    }

    return existing.count;
  }

  /**
   * Create a block response
   */
  private createBlockResponse(message: string): NextResponse {
    return NextResponse.json(
      { 
        error: 'Access Denied',
        message,
        code: 'WAF_BLOCKED'
      },
      { 
        status: 403,
        headers: {
          'X-WAF-Status': 'BLOCKED',
          'X-WAF-Message': message
        }
      }
    );
  }

  /**
   * Create a challenge response
   */
  private createChallengeResponse(): NextResponse {
    return NextResponse.json(
      { 
        error: 'Security Challenge Required',
        message: 'Please complete the security challenge to continue',
        code: 'WAF_CHALLENGE'
      },
      { 
        status: 429,
        headers: {
          'X-WAF-Status': 'CHALLENGE',
          'Retry-After': '60'
        }
      }
    );
  }

  /**
   * Get WAF statistics
   */
  getStatistics(): {
    totalRules: number;
    enabledRules: number;
    violationCounts: Record<string, number>;
    config: WAFConfig;
  } {
    const enabledRules = Array.from(this.rules.values()).filter(rule => rule.enabled).length;
    const violationCounts: Record<string, number> = {};
    
    for (const [ip, data] of this.violationCounts.entries()) {
      violationCounts[ip] = data.count;
    }

    return {
      totalRules: this.rules.size,
      enabledRules,
      violationCounts,
      config: this.config
    };
  }
}

// Export singleton instance
export const waf = new WebApplicationFirewall();

/**
 * WAF Middleware
 */
export function withWAF(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const wafResponse = await waf.processRequest(req);
    
    if (wafResponse) {
      return wafResponse; // WAF blocked the request
    }

    return handler(req);
  };
}
