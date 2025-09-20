import { NextRequest, NextResponse } from 'next/server';
import { waf } from '@/lib/security/waf';
import { withErrorHandling } from '@/lib/security/error-handler';

async function getWAFStatusHandler(request: NextRequest) {
  const statistics = waf.getStatistics();
  
  return NextResponse.json({ 
    success: true, 
    statistics,
    status: 'active'
  });
}

async function getWAFRulesHandler(request: NextRequest) {
  // This would return the current WAF rules
  // For now, return a placeholder
  return NextResponse.json({ 
    success: true, 
    message: 'WAF rules endpoint - implementation needed'
  });
}

export const GET = withErrorHandling(getWAFStatusHandler);
export const POST = withErrorHandling(getWAFRulesHandler);
