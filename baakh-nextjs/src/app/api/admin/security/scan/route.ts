import { NextRequest, NextResponse } from 'next/server';
import { runSecurityScan, scheduleSecurityScan } from '@/lib/security/security-scanner';
import { withSecurity } from '@/lib/security/middleware';

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'run') {
      const results = await runSecurityScan();
      return NextResponse.json({ 
        success: true, 
        results,
        message: `Security scan completed. Found ${results.length} issues.`
      });
    } else if (action === 'schedule') {
      await scheduleSecurityScan();
      return NextResponse.json({ 
        success: true, 
        message: 'Security scan scheduled successfully.'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "run" or "schedule"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error running security scan:', error);
    return NextResponse.json(
      { error: 'Failed to run security scan' },
      { status: 500 }
    );
  }
}

export const POST = withSecurity('admin')(postHandler);



