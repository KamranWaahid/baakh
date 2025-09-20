import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing the security dashboard
const mockMetrics = {
  total_threats: 0,
  threats_by_severity: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  },
  threats_by_type: {
    brute_force_attack: 0,
    suspicious_api_usage: 0,
    data_exfiltration: 0,
    endpoint_enumeration: 0
  },
  top_threat_ips: [],
  recent_threats: []
};

const mockWhitelist = [
  {
    id: 1,
    ip_address: '127.0.0.1',
    description: 'Local development',
    is_active: true,
    created_at: new Date().toISOString(),
    expires_at: null
  },
  {
    id: 2,
    ip_address: '192.168.1.0/24',
    description: 'Office network',
    is_active: true,
    created_at: new Date().toISOString(),
    expires_at: null
  }
];

const mockThreatPatterns = [
  {
    id: 1,
    name: 'Brute Force Attack',
    pattern_type: 'behavioral',
    description: 'Detects multiple failed login attempts from the same IP',
    severity: 'high',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Suspicious API Usage',
    pattern_type: 'behavioral',
    description: 'Detects unusual API usage patterns',
    severity: 'medium',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    
    // Return mock data for now
    return NextResponse.json({
      threat_metrics: mockMetrics,
      alert_summary: {
        total_alerts: 0,
        alerts_by_severity: {},
        alerts_by_type: {},
        unread_alerts: 0,
        critical_alerts: [],
        recent_alerts: []
      },
      scan_summary: {
        total_issues: 0,
        issues_by_severity: {},
        issues_by_type: {},
        critical_issues: [],
        recent_scans: []
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting security metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get security metrics' },
      { status: 500 }
    );
  }
}