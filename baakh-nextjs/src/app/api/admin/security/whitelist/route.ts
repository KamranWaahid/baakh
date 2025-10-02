export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing
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

const mockPatterns = [
  {
    id: 1,
    ip_pattern: '10.0.0.0/8',
    description: 'Private network range',
    is_active: true,
    priority: 1,
    created_at: new Date().toISOString(),
    created_by: 'admin'
  }
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      ips: mockWhitelist,
      patterns: mockPatterns,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting whitelist:', error);
    return NextResponse.json(
      { error: 'Failed to get whitelist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ip_address, ip_pattern, description, created_by, expires_at, priority } = body;
    
    if (type === 'ip') {
      if (!ip_address || !description || !created_by) {
        return NextResponse.json(
          { error: 'Missing required fields for IP whitelist' },
          { status: 400 }
        );
      }
      
      const newEntry = {
        id: Date.now(),
        ip_address,
        description,
        is_active: true,
        created_at: new Date().toISOString(),
        created_by,
        expires_at
      };
      
      mockWhitelist.push(newEntry);
      return NextResponse.json({ success: true, data: newEntry });
      
    } else if (type === 'pattern') {
      if (!ip_pattern || !description || !created_by) {
        return NextResponse.json(
          { error: 'Missing required fields for IP pattern' },
          { status: 400 }
        );
      }
      
      const newPattern = {
        id: Date.now(),
        ip_pattern,
        description,
        is_active: true,
        priority: priority || 1,
        created_at: new Date().toISOString(),
        created_by
      };
      
      mockPatterns.push(newPattern);
      return NextResponse.json({ success: true, data: newPattern });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "ip" or "pattern"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    return NextResponse.json(
      { error: 'Failed to add to whitelist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ipAddress = searchParams.get('ip_address');
    
    if (!ipAddress) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }
    
    const index = mockWhitelist.findIndex(entry => entry.ip_address === ipAddress);
    if (index > -1) {
      mockWhitelist.splice(index, 1);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error removing from whitelist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from whitelist' },
      { status: 500 }
    );
  }
}