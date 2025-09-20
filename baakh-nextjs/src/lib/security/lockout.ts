import { createAdminClient } from '@/lib/supabase/admin';

const MAX_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface LockoutStatus {
  isLocked: boolean;
  attemptsRemaining: number;
  lockedUntil?: number;
  resetTime?: number;
}

/**
 * Check if an IP or email is locked out
 */
export async function checkLockoutStatus(identifier: string): Promise<LockoutStatus> {
  try {
    const supabase = createAdminClient();
    
    // If using fallback client, return default status
    if (supabase.supabaseUrl === 'https://dummy.supabase.co') {
      return { isLocked: false, attemptsRemaining: MAX_ATTEMPTS };
    }
    
    const { data: lockoutData, error } = await supabase
      .from('login_attempts')
      .select('attempts, locked_until, last_attempt')
      .eq('identifier', identifier)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking lockout status:', error);
      return { isLocked: false, attemptsRemaining: MAX_ATTEMPTS };
    }
    
    if (!lockoutData) {
      return { isLocked: false, attemptsRemaining: MAX_ATTEMPTS };
    }
    
    const now = Date.now();
    
    // Check if currently locked
    if (lockoutData.locked_until && now < lockoutData.locked_until) {
      return {
        isLocked: true,
        attemptsRemaining: 0,
        lockedUntil: lockoutData.locked_until
      };
    }
    
    // Check if lockout period has expired
    if (lockoutData.locked_until && now >= lockoutData.locked_until) {
      // Reset the lockout
      await supabase
        .from('login_attempts')
        .delete()
        .eq('identifier', identifier);
      
      return { isLocked: false, attemptsRemaining: MAX_ATTEMPTS };
    }
    
    // Check if we're in the rate limit window
    const timeSinceLastAttempt = now - new Date(lockoutData.last_attempt).getTime();
    if (timeSinceLastAttempt < LOCK_WINDOW_MS) {
      const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - lockoutData.attempts);
      return {
        isLocked: false,
        attemptsRemaining,
        resetTime: new Date(lockoutData.last_attempt).getTime() + LOCK_WINDOW_MS
      };
    }
    
    // Reset if outside the window
    await supabase
      .from('login_attempts')
      .delete()
      .eq('identifier', identifier);
    
    return { isLocked: false, attemptsRemaining: MAX_ATTEMPTS };
    
  } catch (error) {
    console.error('Error checking lockout status:', error);
    return { isLocked: false, attemptsRemaining: MAX_ATTEMPTS };
  }
}

/**
 * Record a failed login attempt
 */
export async function recordFailedAttempt(identifier: string, ipAddress?: string): Promise<LockoutStatus> {
  try {
    const supabase = createAdminClient();
    
    // If using fallback client, return default status
    if (supabase.supabaseUrl === 'https://dummy.supabase.co') {
      return { isLocked: false, attemptsRemaining: MAX_ATTEMPTS };
    }
    
    const now = new Date().toISOString();
    
    // Get current attempt data
    const { data: existingData } = await supabase
      .from('login_attempts')
      .select('attempts, last_attempt')
      .eq('identifier', identifier)
      .single();
    
    const currentAttempts = existingData ? existingData.attempts + 1 : 1;
    const isLocked = currentAttempts >= MAX_ATTEMPTS;
    const lockedUntil = isLocked ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null;
    
    // Upsert the attempt record
    const { error } = await supabase
      .from('login_attempts')
      .upsert({
        identifier,
        attempts: currentAttempts,
        last_attempt: now,
        locked_until: lockedUntil,
        ip_address: ipAddress
      }, {
        onConflict: 'identifier'
      });
    
    if (error) {
      console.error('Error recording failed attempt:', error);
    }
    
    return {
      isLocked,
      attemptsRemaining: Math.max(0, MAX_ATTEMPTS - currentAttempts),
      lockedUntil: lockedUntil ? new Date(lockedUntil).getTime() : undefined
    };
    
  } catch (error) {
    console.error('Error recording failed attempt:', error);
    return { isLocked: false, attemptsRemaining: MAX_ATTEMPTS };
  }
}

/**
 * Clear lockout for successful login
 */
export async function clearLockout(identifier: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    // If using fallback client, do nothing
    if (supabase.supabaseUrl === 'https://dummy.supabase.co') {
      return;
    }
    
    await supabase
      .from('login_attempts')
      .delete()
      .eq('identifier', identifier);
      
  } catch (error) {
    console.error('Error clearing lockout:', error);
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('X-Forwarded-For');
  const realIP = req.headers.get('X-Real-IP');
  const cfConnectingIP = req.headers.get('CF-Connecting-IP');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}
