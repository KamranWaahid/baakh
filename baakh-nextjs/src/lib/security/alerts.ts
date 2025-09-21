import { createAdminClient } from '@/lib/supabase/admin';
import { securityMonitor } from './security-monitor';

export interface SecurityAlert {
  id?: number;
  alert_type: 'threat_detected' | 'brute_force' | 'suspicious_activity' | 'vulnerability_found' | 'access_denied' | 'system_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  ip_address?: string;
  user_id?: string;
  details: Record<string, any>;
  created_at: string;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
  resolved_at?: string;
  resolved_by?: string;
  notification_sent: boolean;
}

export interface AlertRule {
  id?: number;
  name: string;
  alert_type: string;
  conditions: AlertCondition[];
  severity: string;
  is_active: boolean;
  notification_channels: string[];
  created_at: string;
}

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range' | 'regex';
  value: any;
  weight: number;
}

export interface AlertSummary {
  total_alerts: number;
  alerts_by_severity: Record<string, number>;
  alerts_by_type: Record<string, number>;
  unread_alerts: number;
  critical_alerts: SecurityAlert[];
  recent_alerts: SecurityAlert[];
}

/**
 * Create a new security alert
 */
export async function createSecurityAlert(
  alertType: string,
  severity: string,
  title: string,
  description: string,
  details: Record<string, any> = {},
  ipAddress?: string,
  userId?: string
): Promise<SecurityAlert> {
  try {
    // Use the new security monitor
    await securityMonitor.logSecurityEvent({
      event_type: alertType,
      severity: severity as any,
      title,
      description,
      metadata: details,
      ip_address: ipAddress || 'unknown',
      user_id: userId
    });

    // Also create the legacy alert for backward compatibility
    const supabase = createAdminClient();
    
    const alert: SecurityAlert = {
      alert_type: alertType as any,
      severity: severity as any,
      title,
      description,
      ip_address: ipAddress,
      user_id: userId,
      details,
      created_at: new Date().toISOString(),
      status: 'new',
      notification_sent: false
    };
    
    const { data, error } = await supabase
      .from('security_alerts')
      .insert([alert])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create security alert: ${error.message}`);
    }
    
    // Send notifications
    await sendAlertNotifications(data);
    
    return data;
    
  } catch (error) {
    console.error('Error creating security alert:', error);
    throw error;
  }
}

/**
 * Send alert notifications
 */
async function sendAlertNotifications(alert: SecurityAlert): Promise<void> {
  try {
    // Send email notification for critical alerts
    if (alert.severity === 'critical') {
      await sendEmailNotification(alert);
    }
    
    // Send Slack notification for high and critical alerts
    if (alert.severity === 'high' || alert.severity === 'critical') {
      await sendSlackNotification(alert);
    }
    
    // Send webhook notification
    await sendWebhookNotification(alert);
    
    // Mark notification as sent
    const supabase = createAdminClient();
    await supabase
      .from('security_alerts')
      .update({ notification_sent: true })
      .eq('id', alert.id);
    
  } catch (error) {
    console.error('Error sending alert notifications:', error);
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(alert: SecurityAlert): Promise<void> {
  try {
    // In a real implementation, you'd use an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer
    
    console.log(`Email notification sent for alert: ${alert.title}`);
    
    // Simulate email sending
    const emailData = {
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: `[${alert.severity.toUpperCase()}] Security Alert: ${alert.title}`,
      body: `
        Security Alert Details:
        
        Type: ${alert.alert_type}
        Severity: ${alert.severity}
        Title: ${alert.title}
        Description: ${alert.description}
        IP Address: ${alert.ip_address || 'N/A'}
        User ID: ${alert.user_id || 'N/A'}
        Time: ${new Date(alert.created_at).toLocaleString()}
        
        Details: ${JSON.stringify(alert.details, null, 2)}
      `
    };
    
    // Here you would actually send the email
    console.log('Email data:', emailData);
    
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

/**
 * Send Slack notification
 */
async function sendSlackNotification(alert: SecurityAlert): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log('Slack webhook URL not configured');
      return;
    }
    
    const severityColors = {
      low: '#36a64f',
      medium: '#ffaa00',
      high: '#ff6b35',
      critical: '#ff0000'
    };
    
    const payload = {
      text: `Security Alert: ${alert.title}`,
      attachments: [
        {
          color: severityColors[alert.severity as keyof typeof severityColors],
          fields: [
            {
              title: 'Type',
              value: alert.alert_type,
              short: true
            },
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Description',
              value: alert.description,
              short: false
            },
            {
              title: 'IP Address',
              value: alert.ip_address || 'N/A',
              short: true
            },
            {
              title: 'Time',
              value: new Date(alert.created_at).toLocaleString(),
              short: true
            }
          ]
        }
      ]
    };
    
    // In a real implementation, you'd send this to Slack
    console.log('Slack notification payload:', payload);
    
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
}

/**
 * Send webhook notification
 */
async function sendWebhookNotification(alert: SecurityAlert): Promise<void> {
  try {
    const webhookUrl = process.env.SECURITY_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log('Security webhook URL not configured');
      return;
    }
    
    const payload = {
      alert_id: alert.id,
      alert_type: alert.alert_type,
      severity: alert.severity,
      title: alert.title,
      description: alert.description,
      ip_address: alert.ip_address,
      user_id: alert.user_id,
      details: alert.details,
      created_at: alert.created_at,
      status: alert.status
    };
    
    // In a real implementation, you'd send this webhook
    console.log('Webhook notification payload:', payload);
    
  } catch (error) {
    console.error('Error sending webhook notification:', error);
  }
}

/**
 * Get alert summary
 */
export async function getAlertSummary(): Promise<AlertSummary> {
  try {
    const supabase = createAdminClient();
    
    // Get all alerts from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: alerts } = await supabase
      .from('security_alerts')
      .select('*')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false });
    
    const totalAlerts = alerts?.length || 0;
    
    const alertsBySeverity = alerts?.reduce((acc: any, alert: any) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const alertsByType = alerts?.reduce((acc: any, alert: any) => {
      acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const unreadAlerts = alerts?.filter((alert: any) => alert.status === 'new').length || 0;
    const criticalAlerts = alerts?.filter((alert: any) => alert.severity === 'critical') || [];
    const recentAlerts = alerts?.slice(0, 10) || [];
    
    return {
      total_alerts: totalAlerts,
      alerts_by_severity: alertsBySeverity,
      alerts_by_type: alertsByType,
      unread_alerts: unreadAlerts,
      critical_alerts: criticalAlerts,
      recent_alerts: recentAlerts
    };
    
  } catch (error) {
    console.error('Error getting alert summary:', error);
    return {
      total_alerts: 0,
      alerts_by_severity: {},
      alerts_by_type: {},
      unread_alerts: 0,
      critical_alerts: [],
      recent_alerts: []
    };
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: number, acknowledgedBy: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('security_alerts')
      .update({
        status: 'acknowledged',
        resolved_by: acknowledgedBy
      })
      .eq('id', alertId);
    
    if (error) {
      throw new Error(`Failed to acknowledge alert: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    throw error;
  }
}

/**
 * Resolve an alert
 */
export async function resolveAlert(alertId: number, resolvedBy: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('security_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy
      })
      .eq('id', alertId);
    
    if (error) {
      throw new Error(`Failed to resolve alert: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Error resolving alert:', error);
    throw error;
  }
}

/**
 * Create alert rule
 */
export async function createAlertRule(
  name: string,
  alertType: string,
  conditions: AlertCondition[],
  severity: string,
  notificationChannels: string[]
): Promise<AlertRule> {
  try {
    const supabase = createAdminClient();
    
    const rule: AlertRule = {
      name,
      alert_type: alertType,
      conditions,
      severity,
      is_active: true,
      notification_channels: notificationChannels,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('alert_rules')
      .insert([rule])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create alert rule: ${error.message}`);
    }
    
    return data;
    
  } catch (error) {
    console.error('Error creating alert rule:', error);
    throw error;
  }
}

/**
 * Check alert rules and create alerts if conditions are met
 */
export async function checkAlertRules(eventData: Record<string, any>): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    const { data: rules } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('is_active', true);
    
    for (const rule of rules || []) {
      const shouldTrigger = await evaluateAlertRule(rule, eventData);
      
      if (shouldTrigger) {
        await createSecurityAlert(
          rule.alert_type,
          rule.severity,
          `Alert: ${rule.name}`,
          `Alert rule triggered: ${rule.name}`,
          eventData
        );
      }
    }
    
  } catch (error) {
    console.error('Error checking alert rules:', error);
  }
}

/**
 * Evaluate an alert rule against event data
 */
async function evaluateAlertRule(rule: AlertRule, eventData: Record<string, any>): Promise<boolean> {
  let totalScore = 0;
  let matchedConditions = 0;
  
  for (const condition of rule.conditions) {
    const fieldValue = getNestedValue(eventData, condition.field);
    const conditionMet = evaluateCondition(fieldValue, condition);
    
    if (conditionMet) {
      totalScore += condition.weight;
      matchedConditions++;
    }
  }
  
  // Trigger if enough conditions are met
  return matchedConditions > 0 && totalScore >= 50;
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(value: any, condition: AlertCondition): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  
  switch (condition.operator) {
    case 'equals':
      return value === condition.value;
    case 'contains':
      return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
    case 'greater_than':
      return Number(value) > Number(condition.value);
    case 'less_than':
      return Number(value) < Number(condition.value);
    case 'in_range':
      const [min, max] = condition.value;
      return Number(value) >= min && Number(value) <= max;
    case 'regex':
      try {
        const regex = new RegExp(condition.value, 'i');
        return regex.test(String(value));
      } catch {
        return false;
      }
    default:
      return false;
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}



