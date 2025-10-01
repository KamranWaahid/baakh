import PoetProfileLegacyBySlug from '@/components/poets/legacy/PoetProfileBySlugPage';

export default async function PoetProfilePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  return <PoetProfileLegacyBySlug params={{ locale, slug: id }} />;
}
