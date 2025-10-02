export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { securityMonitor } from '@/lib/security/security-monitor';
import { withErrorHandling, ValidationError } from '@/lib/security/error-handler';

async function getSecurityMetricsHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get('hours') || '24');

  if (hours < 1 || hours > 168) { // Max 1 week
    throw new ValidationError('Hours must be between 1 and 168');
  }

  const metrics = await securityMonitor.getSecurityMetrics(hours);
  
  return NextResponse.json({ 
    success: true, 
    metrics,
    timeRange: `${hours} hours`
  });
}

async function createSecurityEventsTableHandler(request: NextRequest) {
  await securityMonitor.createSecurityEventsTable();
  
  return NextResponse.json({ 
    success: true, 
    message: 'Security events table created successfully' 
  });
}

export const GET = withErrorHandling(getSecurityMetricsHandler);
export const POST = withErrorHandling(createSecurityEventsTableHandler);
