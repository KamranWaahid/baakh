export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing
const mockThreatPatterns = [
  {
    id: 1,
    name: 'Brute Force Attack',
    pattern_type: 'behavioral',
    description: 'Detects multiple failed login attempts from the same IP',
    rules: [
      {
        field: 'attempt_count',
        operator: 'greater_than',
        value: 10,
        weight: 100
      }
    ],
    severity: 'high',
    is_active: true,
    created_at: new Date().toISOString(),
    created_by: 'admin'
  },
  {
    id: 2,
    name: 'Suspicious API Usage',
    pattern_type: 'behavioral',
    description: 'Detects unusual API usage patterns',
    rules: [
      {
        field: 'api_call_count',
        operator: 'greater_than',
        value: 1000,
        weight: 80
      }
    ],
    severity: 'medium',
    is_active: true,
    created_at: new Date().toISOString(),
    created_by: 'admin'
  },
  {
    id: 3,
    name: 'Data Exfiltration',
    pattern_type: 'data',
    description: 'Detects large data requests',
    rules: [
      {
        field: 'data_size',
        operator: 'greater_than',
        value: 1000000,
        weight: 90
      }
    ],
    severity: 'high',
    is_active: true,
    created_at: new Date().toISOString(),
    created_by: 'admin'
  }
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockThreatPatterns);
    
  } catch (error) {
    console.error('Error getting threat patterns:', error);
    return NextResponse.json(
      { error: 'Failed to get threat patterns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      pattern_type, 
      rules, 
      severity, 
      created_by 
    } = body;
    
    if (!name || !description || !pattern_type || !rules || !severity || !created_by) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const newPattern = {
      id: Date.now(),
      name,
      description,
      pattern_type,
      rules,
      severity,
      is_active: true,
      created_at: new Date().toISOString(),
      created_by
    };
    
    mockThreatPatterns.push(newPattern);
    return NextResponse.json({ success: true, data: newPattern });
    
  } catch (error) {
    console.error('Error creating threat pattern:', error);
    return NextResponse.json(
      { error: 'Failed to create threat pattern' },
      { status: 500 }
    );
  }
}