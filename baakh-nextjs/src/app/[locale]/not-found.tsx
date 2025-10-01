import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function LocaleNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6 text-base leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Button asChild className="px-6">
          <Link href="/en">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
