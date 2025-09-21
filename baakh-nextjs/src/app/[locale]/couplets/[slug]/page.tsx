"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Quote, Heart, Eye, Bookmark, Share2, Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const demoMap: Record<string, unknown> = {
  "dama-dam-mast-qalandar": {
    title: "Dama Dam Mast Qalandar",
    sindhi: "داما دم مست قلندر",
    poet: "Shah Abdul Latif",
    theme: "spiritual",
    excerpt: "In every breath, the divine presence flows, awakening the soul to eternal bliss.",
    likes: 1200,
    views: 5000,
  },
  "truth-is-truth": {
    title: "Truth is Truth",
    sindhi: "سچو آهي سچو",
    poet: "Sachal Sarmast",
    theme: "philosophical",
    excerpt: "Truth is truth, unchanging and eternal, beyond the veils of illusion.",
    likes: 800,
    views: 3200,
  },
  "loves-garden": {
    title: "Love's Garden",
    sindhi: "محبت جو باغ",
    poet: "Sachal Sarmast",
    theme: "romantic",
    excerpt: "In love's garden, every flower blooms with divine fragrance, every thorn teaches patience.",
    likes: 600,
    views: 2800,
  },
};

export default function CoupletPage() {
  const params = useParams();
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  
  const slug = params.slug as string;
  const couplet = demoMap[slug] ?? demoMap["dama-dam-mast-qalandar"];

  // Multi-lingual content
  const content = {
    backToCouplets: isSindhi ? 'شعرن ڏانهن واپس' : 'Back to Couplets',
    by: isSindhi ? 'جي طرفان' : 'By',
    save: isSindhi ? 'محفوظ ڪريو' : 'Save',
    share: isSindhi ? 'ونڊ ڪريو' : 'Share'
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="pt-6 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="shadow-sm">
              <CardHeader>
                <Badge variant="outline" className="w-fit uppercase text-[10px]">{couplet.theme}</Badge>
                <CardTitle className="text-2xl md:text-3xl leading-snug">
                  {couplet.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-muted-foreground text-sm">{content.by} {couplet.poet}</div>
                <div className="py-4 border-y">
                  <h2 className="text-xl md:text-2xl leading-relaxed mb-2 sindhi-text" dir="rtl">{couplet.sindhi}</h2>
                  <p className="text-muted-foreground italic">"{couplet.excerpt}"</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Heart className="w-4 h-4" /> {couplet.likes}</span>
                    <span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" /> {couplet.views}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="inline-flex items-center gap-2"><Bookmark className="w-4 h-4" /> {content.save}</Button>
                    <Button variant="outline" size="sm" className="inline-flex items-center gap-2"><Share2 className="w-4 h-4" /> {content.share}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}


