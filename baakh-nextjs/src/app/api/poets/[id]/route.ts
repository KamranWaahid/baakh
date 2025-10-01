import { NextRequest, NextResponse } from 'next/server';
import { apiRequest, BACKEND_CONFIG } from '@/lib/config';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('=== POET BY ID API ROUTE STARTED ===');
  const { id } = await context.params;
  console.log('Poet ID:', id);
  console.log('Request URL:', request.url);
  
  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    console.log('Query parameters:', queryString);
    
    // Proxy request to backend
    const backendUrl = `${BACKEND_CONFIG.ENDPOINTS.POETS}/${id}${queryString ? `?${queryString}` : ''}`;
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
      poet: data.poet ? 'Found' : 'Not found',
      categories: data.categories?.length || 0
    });
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Unexpected error in poet by ID API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('=== POET UPDATE API ROUTE STARTED ===');
  const { id } = await context.params;
  console.log('Poet ID:', id);
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    // Proxy request to backend
    const backendUrl = `${BACKEND_CONFIG.ENDPOINTS.POETS}/${id}`;
    const response = await apiRequest(backendUrl, {
      method: 'PUT',
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
    console.error('Unexpected error in poet update API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('=== POET DELETE API ROUTE STARTED ===');
  const { id } = await context.params;
  console.log('Poet ID:', id);
  
  try {
    // Proxy request to backend
    const backendUrl = `${BACKEND_CONFIG.ENDPOINTS.POETS}/${id}`;
    const response = await apiRequest(backendUrl, {
      method: 'DELETE'
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
    console.error('Unexpected error in poet delete API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
