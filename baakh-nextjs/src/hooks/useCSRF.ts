import { useState, useEffect } from 'react';

interface CSRFToken {
  csrfToken: string;
  expires: number;
}

export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/csrf', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch CSRF token');
        }
        
        const data: CSRFToken = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        console.error('Error fetching CSRF token:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCSRFToken();
  }, []);

  const refreshToken = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/csrf', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh CSRF token');
      }
      
      const data: CSRFToken = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (err) {
      console.error('Error refreshing CSRF token:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const makeSecureRequest = async (url: string, options: RequestInit = {}) => {
    if (!csrfToken) {
      throw new Error('CSRF token not available');
    }

    const secureOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    const response = await fetch(url, secureOptions);
    
    // If CSRF token is invalid, refresh and retry once
    if (response.status === 403 && response.headers.get('X-CSRF-Error')) {
      await refreshToken();
      if (csrfToken) {
        return fetch(url, {
          ...secureOptions,
          headers: {
            ...secureOptions.headers,
            'X-CSRF-Token': csrfToken,
          },
        });
      }
    }
    
    return response;
  };

  return {
    csrfToken,
    loading,
    error,
    refreshToken,
    makeSecureRequest,
  };
}
