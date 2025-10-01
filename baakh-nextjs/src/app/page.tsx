import { redirect } from 'next/navigation';

export default function RootPage() {
  // Default to Sindhi for this Sindhi poetry site
  // Middleware should handle this, but keeping as fallback
  redirect('/sd');
}
