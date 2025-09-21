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
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      const wrappedListener = (event: any) => {
        try {
          if (typeof listener === 'function') {
            listener(event);
          } else if (listener && typeof listener.handleEvent === 'function') {
            listener.handleEvent(event);
          }
        } catch (error) {
          // Don't re-throw Event objects as they can't be properly handled
          if (error && typeof error === 'object' && error instanceof Event) {
            console.error('Event listener error with Event object:', {
              type: error.type,
              constructor: error.constructor.name,
              isTrusted: error.isTrusted
            });
            return;
          }
          throw toError(error);
        }
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    };
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent infinite loops by checking if this is already being handled
      if (event.defaultPrevented) {
        return;
      }
      
      // Mark as handled to prevent infinite loops
      event.preventDefault();
      
      // Check if the reason is an Event object and handle it specially
      if (event.reason && typeof event.reason === 'object' && event.reason instanceof Event) {
        console.error('Unhandled Promise Rejection with Event:', {
          type: event.reason.type,
          constructor: event.reason.constructor.name,
          isTrusted: event.reason.isTrusted,
          target: event.reason.target?.constructor?.name || 'unknown',
          currentTarget: event.reason.currentTarget?.constructor?.name || 'unknown'
        });
        
        // Log the stack trace to help identify the source
        console.error('Stack trace:', new Error().stack);
        return;
      }
      
      const err = toError(event.reason);
      console.error('Unhandled Promise Rejection:', err);
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

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      // Restore original methods
      Promise.reject = originalReject;
      EventTarget.prototype.addEventListener = originalAddEventListener;
      
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
