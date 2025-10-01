'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6 text-base leading-relaxed">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={reset} className="px-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
