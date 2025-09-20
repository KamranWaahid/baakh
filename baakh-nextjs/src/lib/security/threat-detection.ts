import { createAdminClient } from '@/lib/supabase/admin';

export interface ThreatEvent {
  id?: number;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address: string;
  user_id?: string;
  details: Record<string, any>;
  detected_at: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  resolved_at?: string;
  resolved_by?: string;
}

export interface ThreatPattern {
  id?: number;
  name: string;
  pattern_type: 'behavioral' | 'network' | 'application' | 'data';
  description: string;
  rules: ThreatRule[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  created_at: string;
}

export interface ThreatRule {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than' | 'in_range';
  value: any;
  weight: number;
}

export interface ThreatMetrics {
  total_threats: number;
  threats_by_severity: Record<string, number>;
  threats_by_type: Record<string, number>;
  top_threat_ips: Array<{ ip: string; count: number }>;
  recent_threats: ThreatEvent[];
}

/**
 * Detect threats based on patterns
 */
export async function detectThreats(
  eventType: string,
  ipAddress: string,
  userId?: string,
  eventData: Record<string, any> = {}
): Promise<ThreatEvent[]> {
  try {
    const supabase = createAdminClient();
    
    // Get active threat patterns
    const { data: patterns } = await supabase
      .from('threat_patterns')
      .select('*')
      .eq('is_active', true);
    
    const detectedThreats: ThreatEvent[] = [];
    
    for (const pattern of patterns || []) {
      const threatScore = await evaluateThreatPattern(pattern, {
        event_type: eventType,
        ip_address: ipAddress,
        user_id: userId,
        ...eventData
      });
      
      if (threatScore > 70) { // Threshold for threat detection
        const threat: ThreatEvent = {
          event_type: eventType,
          severity: pattern.severity,
          ip_address: ipAddress,
          user_id: userId,
          details: {
            pattern_name: pattern.name,
            threat_score: threatScore,
            matched_rules: pattern.rules,
            event_data: eventData
          },
          detected_at: new Date().toISOString(),
          status: 'active'
        };
        
        detectedThreats.push(threat);
      }
    }
    
    // Save detected threats
    if (detectedThreats.length > 0) {
      const { error } = await supabase
        .from('threat_events')
        .insert(detectedThreats);
      
      if (error) {
        console.error('Error saving threat events:', error);
      }
    }
    
    return detectedThreats;
    
  } catch (error) {
    console.error('Error detecting threats:', error);
    return [];
  }
}

/**
 * Evaluate a threat pattern against event data
 */
async function evaluateThreatPattern(
  pattern: ThreatPattern,
  eventData: Record<string, any>
): Promise<number> {
  let totalScore = 0;
  let matchedRules = 0;
  
  for (const rule of pattern.rules) {
    const fieldValue = getNestedValue(eventData, rule.field);
    const ruleScore = evaluateRule(fieldValue, rule);
    
    if (ruleScore > 0) {
      totalScore += ruleScore * rule.weight;
      matchedRules++;
    }
  }
  
  // Normalize score based on matched rules
  return matchedRules > 0 ? totalScore / matchedRules : 0;
}

/**
 * Evaluate a single rule
 */
function evaluateRule(value: any, rule: ThreatRule): number {
  if (value === undefined || value === null) {
    return 0;
  }
  
  switch (rule.operator) {
    case 'equals':
      return value === rule.value ? 100 : 0;
    
    case 'contains':
      return String(value).toLowerCase().includes(String(rule.value).toLowerCase()) ? 100 : 0;
    
    case 'regex':
      try {
        const regex = new RegExp(rule.value, 'i');
        return regex.test(String(value)) ? 100 : 0;
      } catch {
        return 0;
      }
    
    case 'greater_than':
      return Number(value) > Number(rule.value) ? 100 : 0;
    
    case 'less_than':
      return Number(value) < Number(rule.value) ? 100 : 0;
    
    case 'in_range':
      const [min, max] = rule.value;
      const numValue = Number(value);
      return numValue >= min && numValue <= max ? 100 : 0;
    
    default:
      return 0;
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Detect brute force attacks
 */
export async function detectBruteForceAttack(
  ipAddress: string,
  identifier: string
): Promise<ThreatEvent[]> {
  try {
    const supabase = createAdminClient();
    
    // Check failed login attempts in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: recentAttempts } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('identifier', identifier)
      .gte('last_attempt', fifteenMinutesAgo);
    
    const attemptCount = recentAttempts?.length || 0;
    
    if (attemptCount >= 10) { // 10+ attempts in 15 minutes
      return await detectThreats('brute_force_attack', ipAddress, undefined, {
        attempt_count: attemptCount,
        identifier,
        time_window: '15_minutes'
      });
    }
    
    return [];
    
  } catch (error) {
    console.error('Error detecting brute force attack:', error);
    return [];
  }
}

/**
 * Detect suspicious API usage patterns
 */
export async function detectSuspiciousAPIUsage(
  ipAddress: string,
  userId: string,
  endpoint: string,
  method: string
): Promise<ThreatEvent[]> {
  try {
    const supabase = createAdminClient();
    
    // Check API usage in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentAPIUsage } = await supabase
      .from('audit_log')
      .select('*')
      .eq('user_id', userId)
      .eq('action', 'api_access')
      .gte('timestamp', oneHourAgo);
    
    const apiCallCount = recentAPIUsage?.length || 0;
    const uniqueEndpoints = new Set(recentAPIUsage?.map(log => log.resource_id) || []).size;
    
    // Detect unusual patterns
    const threats: ThreatEvent[] = [];
    
    if (apiCallCount > 1000) { // More than 1000 API calls in an hour
      threats.push(...await detectThreats('excessive_api_usage', ipAddress, userId, {
        api_call_count: apiCallCount,
        unique_endpoints: uniqueEndpoints,
        time_window: '1_hour'
      }));
    }
    
    if (uniqueEndpoints > 50) { // Accessing too many different endpoints
      threats.push(...await detectThreats('endpoint_enumeration', ipAddress, userId, {
        unique_endpoints: uniqueEndpoints,
        time_window: '1_hour'
      }));
    }
    
    return threats;
    
  } catch (error) {
    console.error('Error detecting suspicious API usage:', error);
    return [];
  }
}

/**
 * Detect data exfiltration attempts
 */
export async function detectDataExfiltration(
  ipAddress: string,
  userId: string,
  dataSize: number,
  endpoint: string
): Promise<ThreatEvent[]> {
  try {
    // Check for large data requests
    if (dataSize > 1000000) { // More than 1MB
      return await detectThreats('large_data_request', ipAddress, userId, {
        data_size: dataSize,
        endpoint,
        threshold: 1000000
      });
    }
    
    // Check for bulk data requests
    const supabase = createAdminClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentRequests } = await supabase
      .from('audit_log')
      .select('*')
      .eq('user_id', userId)
      .eq('action', 'api_access')
      .eq('resource_id', `GET ${endpoint}`)
      .gte('timestamp', oneHourAgo);
    
    if (recentRequests && recentRequests.length > 100) {
      return await detectThreats('bulk_data_request', ipAddress, userId, {
        request_count: recentRequests.length,
        endpoint,
        time_window: '1_hour'
      });
    }
    
    return [];
    
  } catch (error) {
    console.error('Error detecting data exfiltration:', error);
    return [];
  }
}

/**
 * Get threat metrics
 */
export async function getThreatMetrics(hours: number = 24): Promise<ThreatMetrics> {
  try {
    const supabase = createAdminClient();
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    const { data: threats } = await supabase
      .from('threat_events')
      .select('*')
      .gte('detected_at', since);
    
    const threatsBySeverity = threats?.reduce((acc, threat) => {
      acc[threat.severity] = (acc[threat.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const threatsByType = threats?.reduce((acc, threat) => {
      acc[threat.event_type] = (acc[threat.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const topThreatIPs = threats?.reduce((acc, threat) => {
      const existing = acc.find(item => item.ip === threat.ip_address);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ ip: threat.ip_address, count: 1 });
      }
      return acc;
    }, [] as Array<{ ip: string; count: number }>)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) || [];
    
    return {
      total_threats: threats?.length || 0,
      threats_by_severity: threatsBySeverity,
      threats_by_type: threatsByType,
      top_threat_ips: topThreatIPs,
      recent_threats: threats?.slice(0, 10) || []
    };
    
  } catch (error) {
    console.error('Error getting threat metrics:', error);
    return {
      total_threats: 0,
      threats_by_severity: {},
      threats_by_type: {},
      top_threat_ips: [],
      recent_threats: []
    };
  }
}

/**
 * Create a new threat pattern
 */
export async function createThreatPattern(
  name: string,
  description: string,
  patternType: string,
  rules: ThreatRule[],
  severity: string,
  createdBy: string
): Promise<ThreatPattern> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('threat_patterns')
    .insert({
      name,
      description,
      pattern_type: patternType,
      rules,
      severity,
      is_active: true,
      created_by: createdBy
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create threat pattern: ${error.message}`);
  }
  
  return data;
}



