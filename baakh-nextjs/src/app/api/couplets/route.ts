import { NextRequest, NextResponse } from 'next/server';
import { apiRequest, BACKEND_CONFIG } from '@/lib/config';

export async function GET(request: NextRequest) {
  console.log('=== COUPLETS API ROUTE STARTED ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    console.log('Query parameters:', queryString);
    
    // Proxy request to backend
    const backendUrl = `${BACKEND_CONFIG.ENDPOINTS.COUPLETS}${queryString ? `?${queryString}` : ''}`;
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
      total: data.total || 0
    });
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Unexpected error in couplets API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('=== COUPLETS POST API ROUTE STARTED ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    // Proxy request to backend
    const response = await apiRequest(BACKEND_CONFIG.ENDPOINTS.COUPLETS, {
      method: 'POST',
      body: JSON.stringify(body)
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
    console.log('Backend response received:', data);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Unexpected error in couplets POST API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}