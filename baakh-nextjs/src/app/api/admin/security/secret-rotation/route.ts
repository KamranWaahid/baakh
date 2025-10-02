export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { secretRotationManager } from '@/lib/security/secret-rotation';
import { withErrorHandling, AuthorizationError, ValidationError } from '@/lib/security/error-handler';

async function getSecretStatusHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secretName = searchParams.get('name');

  if (secretName) {
    const status = secretRotationManager.getSecretStatus(secretName);
    if (!status) {
      throw new ValidationError(`Secret ${secretName} not found`);
    }
    return NextResponse.json({ success: true, secret: status });
  }

  const allSecrets = secretRotationManager.getAllSecretsStatus();
  return NextResponse.json({ success: true, secrets: allSecrets });
}

async function rotateSecretHandler(request: NextRequest) {
  const body = await request.json();
  const { secretName } = body;

  if (!secretName) {
    throw new ValidationError('Secret name is required');
  }

  const success = await secretRotationManager.rotateSecret(secretName);
  
  if (!success) {
    throw new ValidationError(`Failed to rotate secret ${secretName}`);
  }

  return NextResponse.json({ 
    success: true, 
    message: `Secret ${secretName} rotated successfully` 
  });
}

async function checkRotationHandler(request: NextRequest) {
  const secretsNeedingRotation = await secretRotationManager.checkRotationNeeded();
  
  return NextResponse.json({ 
    success: true, 
    secretsNeedingRotation,
    count: secretsNeedingRotation.length
  });
}

async function createTableHandler(request: NextRequest) {
  await secretRotationManager.createSecretRotationTable();
  
  return NextResponse.json({ 
    success: true, 
    message: 'Secret rotation table created successfully' 
  });
}

export const GET = withErrorHandling(getSecretStatusHandler);
export const POST = withErrorHandling(rotateSecretHandler);
export const PUT = withErrorHandling(checkRotationHandler);
export const PATCH = withErrorHandling(createTableHandler);
