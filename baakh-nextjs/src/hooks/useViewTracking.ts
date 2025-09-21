import { useEffect, useRef } from 'react';

interface ViewTrackingOptions {
  contentId: number;
  contentType: 'couplet' | 'poetry' | 'poet';
  enabled?: boolean;
  delay?: number; // Delay in milliseconds before tracking
}

function getOrCreateViewerSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const storageKey = 'viewer_session_id';
    let sessionId = localStorage.getItem(storageKey);

    if (!sessionId) {
      // Prefer crypto.randomUUID if available for a stable, high-entropy id
      const newId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? `vs_${(crypto as any).randomUUID()}`
        : `vs_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

      localStorage.setItem(storageKey, newId);
      sessionId = newId;

      // Also set a cookie for server-side analytics if needed (1 year expiry)
      try {
        document.cookie = `${storageKey}=${sessionId}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      } catch {
        // ignore cookie errors
      }
    }

    return sessionId;
  } catch {
    return null;
  }
}

export function useViewTracking({ 
  contentId, 
  contentType, 
  enabled = true, 
  delay = 1000 
}: ViewTrackingOptions) {
  const hasTracked = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!enabled || hasTracked.current || !contentId) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Track view after delay
    timeoutRef.current = setTimeout(async () => {
      try {
        // Use a persistent viewer session id so reloads don't create new sessions
        const sessionId = getOrCreateViewerSessionId();
        if (!sessionId) {
          return; // cannot reliably de-duplicate; skip
        }

        // Per-content cooldown (e.g., 60 minutes) to avoid re-tracking too frequently
        const cooldownMinutes = 60;
        const cooldownKey = `viewed_${contentType}_${contentId}`;
        try {
          const lastViewedAt = localStorage.getItem(cooldownKey);
          if (lastViewedAt) {
            const last = Number(lastViewedAt);
            const diffMinutes = (Date.now() - last) / (1000 * 60);
            if (diffMinutes < cooldownMinutes) {
              hasTracked.current = true;
              return;
            }
          }
        } catch {}
        
        await fetch('/api/views/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentId,
            contentType,
            sessionId
          })
        });
        
        hasTracked.current = true;

        // Save last viewed time
        try {
          localStorage.setItem(cooldownKey, String(Date.now()));
        } catch {}
      } catch (error) {
        console.warn('Failed to track view:', error);
      }
    }, delay);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [contentId, contentType, enabled, delay]);

  return {
    hasTracked: hasTracked.current
  };
}
