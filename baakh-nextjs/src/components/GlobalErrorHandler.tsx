'use client';

import { useEffect } from 'react';
import { toError } from '@/lib/toError';

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Wrap Promise.reject to catch Event objects before they become unhandled rejections
    const originalReject = Promise.reject;
    Promise.reject = function<T = never>(reason: any): Promise<T> {
      return originalReject.call(this, toError(reason)) as Promise<T>;
    };

    // Add a more targeted approach - wrap specific methods that might create Event objects
    // Avoid globally wrapping addEventListener (can cause cross-realm issues in Next dev)

    function isLikelyEvent(value: unknown): value is Event {
      if (!value || typeof value !== 'object') return false;
      // Cross-realm safe tag check
      const tag = Object.prototype.toString.call(value);
      if (tag === '[object Event]' || tag === '[object ErrorEvent]' || tag === '[object PromiseRejectionEvent]') return true;
      // Heuristic based on common Event props
      const maybe: any = value as any;
      if (typeof maybe.type === 'string' && typeof maybe.isTrusted === 'boolean') return true;
      // Fallback to constructor name check (cross-realm safe-ish)
      const ctorName = String((maybe?.constructor && maybe.constructor.name) || '');
      return /Event$/i.test(ctorName) || /ErrorEvent$/i.test(ctorName);
    }

    function safeLogEvent(prefix: string, evt: any) {
      try {
        const ctor = (() => {
          try { return String(evt?.constructor?.name || 'unknown'); } catch { return 'unknown'; }
        })();
        const info = {
          type: typeof evt?.type === 'string' ? evt.type : 'unknown',
          constructor: ctor,
          isTrusted: typeof evt?.isTrusted === 'boolean' ? evt.isTrusted : undefined,
          target: (() => { try { return evt?.target?.constructor?.name; } catch { return undefined; } })(),
          currentTarget: (() => { try { return evt?.currentTarget?.constructor?.name; } catch { return undefined; } })()
        } as const;
        console.warn(prefix, info);
      } catch {
        // As a last resort, avoid logging the raw Event object to prevent noisy [object Event]
        console.warn(prefix, { note: 'Failed to serialize event safely' });
      }
    }

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent infinite loops by checking if this is already being handled
      if (event.defaultPrevented) {
        return;
      }
      
      // Mark as handled to prevent infinite loops
      event.preventDefault();
      
      // Guard: empty reason
      if (!('reason' in event) || event.reason == null) {
        console.warn('Unhandled Promise Rejection with empty reason');
        return;
      }

      // Check if the reason is an Event object and handle it specially
      if (isLikelyEvent(event.reason)) {
        safeLogEvent('Unhandled Promise Rejection with Event:', event.reason);
        // Include a synthetic stack for breadcrumbing but avoid dumping the Event itself
        try {
          const stack = new Error().stack;
          if (stack) console.debug('Stack trace:', stack);
        } catch {}
        return;
      }
      
      const err = toError(event.reason);
      console.warn('Unhandled Promise Rejection:', { message: err.message, name: err.name, stack: err.stack?.split('\n').slice(0, 3).join('\n') });
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      // Prevent infinite loops
      if (event.defaultPrevented) {
        return;
      }
      
      event.preventDefault();
      
      const err = toError(event.error ?? event);
      console.error('Uncaught Error:', err);
      console.error('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: err
      });
    };

    // Patch console.error to avoid logging raw Event objects as [object Event]
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      try {
        const safeArgs = args.map((a) => (
          a && typeof a === 'object' && isLikelyEvent(a)
            ? { note: 'Event object', type: (a as any)?.type, constructor: (a as any)?.constructor?.name }
            : a
        ));
        originalConsoleError.apply(console, safeArgs);
      } catch {
        originalConsoleError.apply(console, args);
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    // Redundant assignments for broader coverage
    (window as any).onunhandledrejection = handleUnhandledRejection;
    (window as any).onerror = (message: any, source: any, lineno: any, colno: any, error: any) => {
      try {
        const evt = new ErrorEvent('error', { message: String(message), filename: String(source), lineno: Number(lineno), colno: Number(colno), error });
        handleError(evt);
      } catch {
        // fallback
      }
      return true; // prevent default
    };

    // Cleanup function
    return () => {
      // Restore original methods
      Promise.reject = originalReject;
      
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      try { (window as any).onunhandledrejection = null; } catch {}
      try { (window as any).onerror = null; } catch {}
      console.error = originalConsoleError;
    };
  }, []);

  // This component doesn't render anything
  return null;
}
