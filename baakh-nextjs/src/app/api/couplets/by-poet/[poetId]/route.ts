export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { apiRequest, BACKEND_CONFIG } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ poetId: string }> }
) {
  console.log('=== COUPLETS BY POET API ROUTE STARTED ===');
  const { poetId } = await params;
  console.log('Poet ID:', poetId);
  console.log('Request URL:', request.url);
  
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    console.log('Query parameters:', queryString);
    
    // Proxy request to backend
    const backendUrl = `${BACKEND_CONFIG.ENDPOINTS.COUPLETS}/by-poet/${poetId}${queryString ? `?${queryString}` : ''}`;
    console.log('Proxying to backend:', backendUrl);
    
    const response = await apiRequest(backendUrl, {
      method: 'GET'
    });
    
    if (!response.ok) {
      console.error('Backend request failed:', response.status, response.statusText);
      const errorData = await response.text();
      return NextResponse.json(
        { 
          error: 'Backend request failed', 
          details: errorData,
          status: response.status
        }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Backend response received:', {
      success: data.success,
      coupletsCount: data.couplets?.length || 0,
      poet: data.poet ? 'Found' : 'Not found',
      pagination: data.pagination
    });
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Unexpected error in couplets by poet API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}