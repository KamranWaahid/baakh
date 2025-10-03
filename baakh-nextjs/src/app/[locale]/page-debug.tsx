'use client';

import { 
  Users, BookOpen, ChevronDown, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DebugHomePage() {
  const pathname = usePathname();
  const router = useRouter();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  
  // Stats data
  const [stats, setStats] = useState({
    totalPoetry: 0,
    totalPoets: 0,
    totalCategories: 0,
    totalTopics: 0,
    loading: true
  });
  
  // Fetch stats data
  useEffect(() => {
    const controller = new AbortController();
    async function loadStats() {
      try {
        const response = await fetch('/api/poetry/count/', {
          signal: controller.signal
        });
        const data = await response.json();
        setStats({
          totalPoetry: data.totalPoetry || 0,
          totalPoets: data.totalPoets || 0,
          totalCategories: data.totalCategories || 0,
          totalTopics: data.totalTopics || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    loadStats();
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        id="hero" 
        className="pt-16 pb-20 bg-white border-b border-gray-200/50"
      >
        <div className="max-w-4xl mx-auto space-y-10 text-center">
          <div className="space-y-6">
            <h1 className={`text-5xl md:text-6xl font-bold text-gray-900 leading-tight ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {isSindhi ? 'سنڌي شاعري جو آرڪائيو' : 'Sindhi Poetry Archive'}
            </h1>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {isSindhi 
                ? 'سنڌي ادب ۽ ثقافت جي حفاظت ۽ فروغ لاءِ' 
                : 'Preserving and promoting Sindhi literature and culture'
              }
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="bg-blue-50 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.loading ? '...' : stats.totalPoetry}
              </div>
              <div className="text-sm text-blue-800 font-medium">
                {isSindhi ? 'شاعري' : 'Poetry'}
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.loading ? '...' : stats.totalPoets}
              </div>
              <div className="text-sm text-green-800 font-medium">
                {isSindhi ? 'شاعر' : 'Poets'}
              </div>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.loading ? '...' : stats.totalCategories}
              </div>
              <div className="text-sm text-purple-800 font-medium">
                {isSindhi ? 'صنفون' : 'Categories'}
              </div>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.loading ? '...' : stats.totalTopics}
              </div>
              <div className="text-sm text-orange-800 font-medium">
                {isSindhi ? 'موضوع' : 'Topics'}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/poets">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Users className="w-5 h-5 mr-2" />
                {isSindhi ? 'شاعر ڏسو' : 'View Poets'}
              </Button>
            </Link>
            <Link href="/poetry">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
                <BookOpen className="w-5 h-5 mr-2" />
                {isSindhi ? 'شاعري ڏسو' : 'View Poetry'}
              </Button>
            </Link>
            <Link href="/couplets">
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3">
                <FileText className="w-5 h-5 mr-2" />
                {isSindhi ? 'شعر ڏسو' : 'View Couplets'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
            {isSindhi ? 'جلدي لنڪس' : 'Quick Links'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'شاعر' : 'Poets'}
                </h3>
                <p className={`text-gray-600 mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'سنڌي شاعرن جي تفصيلي فهرست' : 'Detailed list of Sindhi poets'}
                </p>
                <Link href="/poets">
                  <Button variant="outline" className="w-full">
                    {isSindhi ? 'ڏسو' : 'Explore'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'شاعري' : 'Poetry'}
                </h3>
                <p className={`text-gray-600 mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'سنڌي شاعري جو وڏو ذخيرو' : 'Vast collection of Sindhi poetry'}
                </p>
                <Link href="/poetry">
                  <Button variant="outline" className="w-full">
                    {isSindhi ? 'ڏسو' : 'Explore'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'شعر' : 'Couplets'}
                </h3>
                <p className={`text-gray-600 mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {isSindhi ? 'سنڌي شعرن جو مجموعو' : 'Collection of Sindhi couplets'}
                </p>
                <Link href="/couplets">
                  <Button variant="outline" className="w-full">
                    {isSindhi ? 'ڏسو' : 'Explore'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
