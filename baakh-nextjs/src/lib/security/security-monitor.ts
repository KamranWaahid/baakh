import { createClient } from '@supabase/supabase-js';

interface SecurityEvent {
  id?: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metadata: Record<string, any>;
  ip_address: string;
  user_id?: string;
  timestamp: Date;
  resolved: boolean;
  resolved_at?: Date;
  resolved_by?: string;
}

interface SecurityMetrics {
  totalEvents: number;
  eventsBySeverity: Record<string, number>;
  eventsByType: Record<string, number>;
  recentEvents: SecurityEvent[];
  topThreats: Array<{ type: string; count: number }>;
  securityScore: number;
}

interface AlertRule {
  id: string;
  name: string;
  eventType: string;
  severity: string;
  threshold: number;
  timeWindow: number; // in minutes
  enabled: boolean;
  actions: string[]; // webhook, email, slack, etc.
}

// Create a safe no-op Supabase mock to avoid crashes when env vars are missing
function createSupabaseMock() {
  const noData = { data: null, error: null } as any;
  const emptyList = { data: [], error: null } as any;
  const countZero = { count: 0, error: null } as any;

  const chain = () => ({
    select: () => ({ gte: () => ({ order: () => ({ limit: () => emptyList }) }), eq: () => ({ single: () => noData }) }),
    eq: () => chain(),
    gte: () => chain(),
    order: () => chain(),
    limit: () => emptyList,
    insert: () => ({ error: null }),
  });

  return {
    from: () => ({
      select: (_cols?: any, opts?: any) => (opts && opts.count ? countZero : emptyList),
      eq: () => chain(),
      gte: () => chain(),
      order: () => chain(),
      limit: () => emptyList,
      insert: (_rows: any) => ({ error: null }),
    }),
    rpc: () => ({ error: null }),
  } as any;
}

class SecurityMonitor {
  private supabase: any;
  private alertRules: Map<string, AlertRule> = new Map();
  private eventBuffer: SecurityEvent[] = [];
  private bufferSize = 100;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.warn('⚠️ SecurityMonitor: Supabase not configured. Using no-op client.');
      this.supabase = createSupabaseMock();
    } else {
      this.supabase = createClient(url, serviceKey);
    }

    this.initializeAlertRules();
    this.startEventBufferFlush();
  }

  /**
   * Initialize default alert rules
   */
  private initializeAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'multiple_failed_logins',
        name: 'Multiple Failed Login Attempts',
        eventType: 'authentication_failed',
        severity: 'high',
        threshold: 5,
        timeWindow: 15,
        enabled: true,
        actions: ['webhook', 'email']
      },
      {
        id: 'rate_limit_exceeded',
        name: 'Rate Limit Exceeded',
        eventType: 'rate_limit_exceeded',
        severity: 'medium',
        threshold: 3,
        timeWindow: 5,
        enabled: true,
        actions: ['webhook']
      },
      {
        id: 'suspicious_api_usage',
        name: 'Suspicious API Usage',
        eventType: 'suspicious_api_usage',
        severity: 'high',
        threshold: 1,
        timeWindow: 10,
        enabled: true,
        actions: ['webhook', 'email', 'slack']
      },
      {
        id: 'sql_injection_attempt',
        name: 'SQL Injection Attempt',
        eventType: 'sql_injection_attempt',
        severity: 'critical',
        threshold: 1,
        timeWindow: 1,
        enabled: true,
        actions: ['webhook', 'email', 'slack']
      },
      {
        id: 'xss_attempt',
        name: 'XSS Attempt',
        eventType: 'xss_attempt',
        severity: 'critical',
        threshold: 1,
        timeWindow: 1,
        enabled: true,
        actions: ['webhook', 'email', 'slack']
      }
    ];

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      resolved: false
    };

    // Add to buffer
    this.eventBuffer.push(securityEvent);

    // Check if buffer is full
    if (this.eventBuffer.length >= this.bufferSize) {
      await this.flushEventBuffer();
    }

    // Check alert rules
    await this.checkAlertRules(securityEvent);
  }

  /**
   * Flush event buffer to database
   */
  private async flushEventBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    try {
      const eventsToInsert = this.eventBuffer.map(event => ({
        event_type: event.event_type,
        severity: event.severity,
        title: event.title,
        description: event.description,
        metadata: event.metadata,
        ip_address: event.ip_address,
        user_id: event.user_id,
        timestamp: event.timestamp.toISOString(),
        resolved: event.resolved
      }));

      const { error } = await this.supabase
        .from('security_events')
        .insert(eventsToInsert);

      if (error) throw error;

      console.log(`Flushed ${this.eventBuffer.length} security events to database`);
      this.eventBuffer = [];
    } catch (error) {
      console.error('Error flushing security events:', error);
    }
  }

  /**
   * Start periodic buffer flush
   */
  private startEventBufferFlush(): void {
    setInterval(async () => {
      await this.flushEventBuffer();
    }, this.flushInterval);
  }

  /**
   * Check alert rules for a security event
   */
  private async checkAlertRules(event: SecurityEvent): Promise<void> {
    for (const [ruleId, rule] of this.alertRules) {
      if (!rule.enabled || rule.eventType !== event.event_type) continue;

      // Check if threshold is met
      const eventCount = await this.getEventCount(
        rule.eventType,
        rule.timeWindow,
        event.ip_address,
        event.user_id
      );

      if (eventCount >= rule.threshold) {
        await this.triggerAlert(rule, event, eventCount);
      }
    }
  }

  /**
   * Get event count for a specific rule
   */
  private async getEventCount(
    eventType: string,
    timeWindow: number,
    ipAddress: string,
    userId?: string
  ): Promise<number> {
    try {
      const timeAgo = new Date(Date.now() - (timeWindow * 60 * 1000));
      
      let query = this.supabase
        .from('security_events')
        .select('id', { count: 'exact' })
        .eq('event_type', eventType)
        .eq('ip_address', ipAddress)
        .gte('timestamp', timeAgo.toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting event count:', error);
      return 0;
    }
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(rule: AlertRule, event: SecurityEvent, count: number): Promise<void> {
    const alert = {
      ruleId: rule.id,
      ruleName: rule.name,
      eventType: event.event_type,
      severity: event.severity,
      count,
      ipAddress: event.ip_address,
      userId: event.user_id,
      timestamp: new Date().toISOString(),
      metadata: event.metadata
    };

    console.log(`SECURITY ALERT: ${rule.name} - ${count} events detected`);

    // Send alerts based on configured actions
    for (const action of rule.actions) {
      try {
        switch (action) {
          case 'webhook':
            await this.sendWebhookAlert(alert);
            break;
          case 'email':
            await this.sendEmailAlert(alert);
            break;
          case 'slack':
            await this.sendSlackAlert(alert);
            break;
        }
      } catch (error) {
        console.error(`Error sending ${action} alert:`, error);
      }
    }
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: any): Promise<void> {
    if (!process.env.SECURITY_WEBHOOK_URL) return;

    await fetch(process.env.SECURITY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'security_alert',
        ...alert
      })
    });
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(alert: any): Promise<void> {
    if (!process.env.ADMIN_EMAIL) return;

    // This would integrate with your email service
    console.log(`Email alert would be sent to ${process.env.ADMIN_EMAIL}:`, alert);
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(alert: any): Promise<void> {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    const slackMessage = {
      text: `🚨 Security Alert: ${alert.ruleName}`,
      attachments: [
        {
          color: alert.severity === 'critical' ? 'danger' : 
                 alert.severity === 'high' ? 'warning' : 'good',
          fields: [
            { title: 'Event Type', value: alert.eventType, short: true },
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Count', value: alert.count.toString(), short: true },
            { title: 'IP Address', value: alert.ipAddress, short: true },
            { title: 'Timestamp', value: alert.timestamp, short: true }
          ]
        }
      ]
    };

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(hours: number = 24): Promise<SecurityMetrics> {
    try {
      const timeAgo = new Date(Date.now() - (hours * 60 * 60 * 1000));

      // Get total events
      const { count: totalEvents } = await this.supabase
        .from('security_events')
        .select('id', { count: 'exact' })
        .gte('timestamp', timeAgo.toISOString());

      // Get events by severity
      const { data: severityData } = await this.supabase
        .from('security_events')
        .select('severity')
        .gte('timestamp', timeAgo.toISOString());

      const eventsBySeverity = severityData?.reduce((acc: any, event: any) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get events by type
      const { data: typeData } = await this.supabase
        .from('security_events')
        .select('event_type')
        .gte('timestamp', timeAgo.toISOString());

      const eventsByType = typeData?.reduce((acc: any, event: any) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get recent events
      const { data: recentEvents } = await this.supabase
        .from('security_events')
        .select('*')
        .gte('timestamp', timeAgo.toISOString())
        .order('timestamp', { ascending: false })
        .limit(10);

      // Calculate top threats
      const topThreats = Object.entries(eventsByType)
        .map(([type, count]) => ({ type, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate security score (0-100)
      const criticalEvents = eventsBySeverity.critical || 0;
      const highEvents = eventsBySeverity.high || 0;
      const mediumEvents = eventsBySeverity.medium || 0;
      const lowEvents = eventsBySeverity.low || 0;

      const securityScore = Math.max(0, 100 - 
        (criticalEvents * 20) - 
        (highEvents * 10) - 
        (mediumEvents * 5) - 
        (lowEvents * 1)
      );

      return {
        totalEvents: totalEvents || 0,
        eventsBySeverity,
        eventsByType,
        recentEvents: recentEvents || [],
        topThreats,
        securityScore: Math.round(securityScore)
      };

    } catch (error) {
      console.error('Error getting security metrics:', error);
      return {
        totalEvents: 0,
        eventsBySeverity: {},
        eventsByType: {},
        recentEvents: [],
        topThreats: [],
        securityScore: 0
      };
    }
  }

  /**
   * Create security events table
   */
  async createSecurityEventsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS security_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(255) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        metadata JSONB,
        ip_address INET NOT NULL,
        user_id UUID,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolved_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
      CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);
      CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
    `;

    try {
      const { error } = await this.supabase.rpc('exec_sql', { sql: createTableSQL });
      if (error) throw error;
      console.log('Security events table created successfully');
    } catch (error) {
      console.error('Error creating security events table:', error);
    }
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor();

// Note: Table initialization moved to API routes to avoid build-time errors
