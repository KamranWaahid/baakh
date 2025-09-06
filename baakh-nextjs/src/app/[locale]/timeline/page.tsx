"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ui/logo";
import { 
  ArrowLeft,
  Clock,
  Users,
  Quote,
  Heart,
  BookOpen,
  Sparkles,
  Star,
  TrendingUp,
  Award,
  Eye,
  Bookmark,
  Globe,
  Palette,
  ChevronRight,
  Calendar,
  FileText,
  History,
  User,
  Languages,
  Search,
  Filter,
  ChevronDown
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface TimelinePeriod {
  id: string;
  name: string;
  sindhiName: string;
  description: string;
  sindhiDescription: string;
  years: string;
  poets: number;
  works: number;
  icon: any;
  color: string;
  tags: string[];
  sindhiTags: string[];
  poetsList: string[];
  sindhiPoetsList: string[];
  significance: string;
  sindhiSignificance: string;
}

export default function TimelinePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("All");
  const router = useRouter();
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;

  // Multi-lingual content
  const content = {
    title: isSindhi ? 'سنڌي شاعري جي تاريخي ٽائيم لائين' : 'Historical Timeline of Sindhi Poetry',
    subtitle: isSindhi ? 'سنڌي ادب جي ارتقا کي مختلف دورن ۾ ڏسو. هر دور جي شاعرن، شاعري، ۽ اهميت کي سمجھو.' : 'Explore the evolution of Sindhi literature through different eras. Understand the poets, poetry, and significance of each period.',
    chronologicalNote: isSindhi 
      ? 'ٽائيم لائين کي تاريخ موجب ترتيب ڏنو ويو آهي — قديم دور کان جديد دور تائين'
      : 'Timeline is arranged chronologically — from early eras to the modern period',
    back: isSindhi ? 'واپس' : 'Back',
    filters: isSindhi ? 'فلٽر' : 'Filters',
    allPeriods: isSindhi ? 'سڀ دور' : 'All Periods',
    exploreEra: isSindhi ? 'دور ڳوليو' : 'Explore Era',
    viewDetails: isSindhi ? 'تفصيل ڏسو' : 'View Details',
    totalPeriods: isSindhi ? 'سڀئي دور' : 'Total Periods',
    poets: isSindhi ? 'شاعر' : 'Poets',
    works: isSindhi ? 'ڪم' : 'Works',
    years: isSindhi ? 'سال' : 'Years',
    significance: isSindhi ? 'اهميت' : 'Significance',
    tags: isSindhi ? 'ٽڪليون' : 'Tags',
    notablePoets: isSindhi ? 'مشهور شاعر' : 'Notable Poets',
    eraOverview: isSindhi ? 'دور جو جائزو' : 'Era Overview',
    culturalImpact: isSindhi ? 'ثقافتي اثر' : 'Cultural Impact',
    literaryEvolution: isSindhi ? 'ادبي ارتقا' : 'Literary Evolution'
  };

  // Comprehensive timeline data
  const timelinePeriods: TimelinePeriod[] = [
    {
      id: "17th-century",
      name: "17th Century",
      sindhiName: "سترھين صدي",
      description: "The early period of classical Sindhi poetry, marked by the emergence of Sufi traditions and mystical themes. This era laid the foundation for the rich poetic heritage that would follow.",
      sindhiDescription: "سنڌي شاعري جو ابتدائي دور، جيڪو صوفي رويتن ۽ روحاني موضوعن سان شروع ٿيو. ھيءَ دور ايندڙ امير شاعري جي بنياد رکي ٿو.",
      years: "1600-1699",
      poets: 12,
      works: 85,
      icon: History,
      color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
      tags: ["Sufi", "Mysticism", "Devotional", "Classical"],
      sindhiTags: ["صوفي", "روحاني", "عبادتي", "ڪلاسيڪل"],
      poetsList: ["Makhdoom Nooh", "Shah Inayat", "Mir Masoom", "Qazi Qadan"],
      sindhiPoetsList: ["مخدوم نوح", "شاھ عنايت", "مير معصوم", "قاضي قادان"],
      significance: "Foundation of classical Sindhi poetry tradition",
      sindhiSignificance: "سنڌي شاعري جي ڪلاسيڪل رويت جي بنياد"
    },
    {
      id: "18th-century",
      name: "18th Century",
      sindhiName: "ارڙھين صدي",
      description: "The golden age of Sindhi poetry, featuring legendary poets like Shah Abdul Latif Bhittai. This period represents the pinnacle of classical Sindhi literature with profound spiritual and philosophical themes.",
      sindhiDescription: "سنڌي شاعري جو سنھري دور، جيڪو شاھ عبداللطيف ڀٽائي جھڙا افسانوي شاعر رکي ٿو. ھيءَ دور سنڌي ادب جي چوٽي کي ظاھر ڪري ٿو، جيڪو گھوڙي روحاني ۽ فلسفي موضوعن سان ڀرپور آھي.",
      years: "1700-1799",
      poets: 25,
      works: 320,
      icon: Star,
      color: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
      tags: ["Sufi", "Classical", "Folk", "Spiritual", "Golden Age"],
      sindhiTags: ["صوفي", "ڪلاسيڪل", "لوڪ", "روحاني", "سنھري دور"],
      poetsList: ["Shah Abdul Latif", "Sachal Sarmast", "Sami", "Shah Inayat", "Makhdoom Bilawal"],
      sindhiPoetsList: ["شاھ عبداللطيف", "سچل سرمست", "سامي", "شاھ عنايت", "مخدوم بيلاول"],
      significance: "Golden age and peak of classical Sindhi poetry",
      sindhiSignificance: "سنڌي شاعري جو سنھري دور ۽ چوٽي"
    },
    {
      id: "19th-century",
      name: "19th Century",
      sindhiName: "اوڻويھين صدي",
      description: "A period of cultural renaissance and the emergence of new poetic forms and themes. This era saw the expansion of Sindhi poetry beyond traditional boundaries, incorporating social commentary and modern perspectives.",
      sindhiDescription: "ثقافتي نشاۃ ثاني جو دور ۽ نئين شاعري جي صنفن ۽ موضوعن جو ظھور. ھيءَ دور سنڌي شاعري کي روائتي حدن کان وڌيڪ وسعت ڏني، جيڪا سماجي تبصرن ۽ عصري نقطہ نظر کي شامل ڪري ٿي.",
      years: "1800-1899",
      poets: 18,
      works: 245,
      icon: Sparkles,
      color: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      tags: ["Romantic", "Social", "Nature", "Renaissance", "Modern Forms"],
      sindhiTags: ["رومانوي", "سماجي", "قدرت", "نشاۃ ثاني", "عصري صنفون"],
      poetsList: ["Bedil", "Rohal Faqir", "Mirza Qaleech", "Shah Lutfullah", "Makhdoom Muhammad Hashim"],
      sindhiPoetsList: ["بيڊل", "روحل فقير", "ميرزا قليچ", "شاھ لطف اللہ", "مخدوم محمد ھاشم"],
      significance: "Cultural renaissance and modern poetic forms",
      sindhiSignificance: "ثقافتي نشاۃ ثاني ۽ عصري شاعري جي صنفون"
    },
    {
      id: "20th-century",
      name: "20th Century",
      sindhiName: "ويھين صدي",
      description: "Modern era of Sindhi poetry with contemporary themes and experimental forms. This period witnessed the democratization of poetry, with diverse voices and perspectives emerging in the literary landscape.",
      sindhiDescription: "سنڌي شاعري جو عصري دور، جيڪو عصري موضوعن ۽ تجرباتي صنفن سان ڀرپور آھي. ھيءَ دور شاعري جي جمھوريت کي ڏٺو، جيڪو مختلف آوازن ۽ نقطہ نظرن سان ادبي منظرنامي ۾ ظاھر ٿيو.",
      years: "1900-1999",
      poets: 35,
      works: 450,
      icon: TrendingUp,
      color: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      tags: ["Modern", "Experimental", "Philosophical", "Contemporary", "Diverse"],
      sindhiTags: ["عصري", "تجرباتي", "فلسفي", "عصري", "مختلف"],
      poetsList: ["Shaikh Ayaz", "Taj Joyo", "Hameed Sindhi", "Imdad Hussaini", "Abdul Karim Gadai"],
      sindhiPoetsList: ["شيخ اياز", "تاج جويو", "حميد سنڌي", "امداد حسيني", "عبدالڪريم گدائي"],
      significance: "Modernization and democratization of Sindhi poetry",
      sindhiSignificance: "سنڌي شاعري جي عصريڪرن ۽ جمھوريت"
    },
    {
      id: "21st-century",
      name: "21st Century",
      sindhiName: "ايڪھين صدي",
      description: "Contemporary era marked by digital transformation and global influences. Modern Sindhi poets explore new themes, experiment with forms, and address current social and political issues while preserving traditional values.",
      sindhiDescription: "عصري دور، جيڪو ڊجيٽل تبديلي ۽ عالمي اثرن سان نشاني آھي. عصري سنڌي شاعر نئين موضوعن کي ڳولي ٿا، صنفن سان تجربا ڪري ٿا، ۽ موجوده سماجي ۽ سياسي مسائل کي حل ڪري ٿا، جيئن ته روائتي قدرن کي محفوظ رکي ٿا.",
      years: "2000-Present",
      poets: 42,
      works: 380,
      icon: Globe,
      color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      tags: ["Contemporary", "Digital", "Global", "Experimental", "Social Issues"],
      sindhiTags: ["عصري", "ڊجيٽل", "عالمي", "تجرباتي", "سماجي مسائل"],
      poetsList: ["Niaz Humayuni", "Ustad Bukhari", "Ibrahim Munshi", "Sarwech Sujawali", "Abdul Hakeem Arshad"],
      sindhiPoetsList: ["نياز ھمايوني", "استاد بخاري", "ابراهيم منشي", "سرويچ سجاولي", "عبدالحڪيم ارشد"],
      significance: "Digital age and global contemporary themes",
      sindhiSignificance: "ڊجيٽل دور ۽ عالمي عصري موضوع"
    }
  ];

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredPeriods = useMemo(() => {
    let filtered = timelinePeriods;
    
    // Filter by selected period
    if (selectedPeriod !== "All") {
      filtered = filtered.filter(period => 
        period.name.includes(selectedPeriod) || 
        period.sindhiName.includes(selectedPeriod)
      );
    }
    
    // Sort by name
    filtered = [...filtered].sort((a, b) => {
      const aName = (isSindhi ? a.sindhiName : a.name).toLowerCase();
      const bName = (isSindhi ? b.sindhiName : b.name).toLowerCase();
      if (aName < bName) return sortOrder === 'asc' ? -1 : 1;
      if (aName > bName) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [selectedPeriod, sortOrder, isSindhi]);

  return (
    <div key={`timeline-${isSindhi ? 'sd' : 'en'}`} className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section (copied from poetry page style) */}
          <motion.section
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {content.title}
            </h1>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-6 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
              {content.subtitle}
            </p>

            {/* Feature Badge (from poetry hero) */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className={`text-sm text-blue-700 font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                  {content.chronologicalNote}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Filters - styled like previous pages */}
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Period Filter */}
                <div>
                  <label className={`block text-xs font-semibold text-gray-700 mb-1 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {content.allPeriods}
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="All" className={isSindhi ? 'auto-sindhi-font' : ''}>{content.allPeriods}</option>
                      <option value="17th">17th</option>
                      <option value="18th">18th</option>
                      <option value="19th">19th</option>
                      <option value="20th">20th</option>
                      <option value="21st">21st</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                    </div>
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">A-Z</label>
                  <div className="relative group">
                    <select 
                      className="w-full p-2 pr-8 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 appearance-none cursor-pointer"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    >
                      <option value="asc">A-Z</option>
                      <option value="desc">Z-A</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <Button 
                    onClick={() => { setSelectedPeriod('All'); setSortOrder('asc'); }}
                    variant="outline" 
                    className="w-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-2 h-10 text-sm"
                  >
                    <span className={`font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                      {isSindhi ? 'فلٽر صاف ڪريو' : 'Clear Filters'}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Timeline Vertical */}
          <section>
            <div className="relative">
              <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gray-200/60" aria-hidden="true" />
              <div className="space-y-8">
                {filteredPeriods.map((period, index) => (
                  <motion.div 
                    key={`${period.id}-${period.name}`} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: index * 0.06 }}
                    className="relative pl-12 sm:pl-16"
                  >
                    {/* Dot */}
                    <div className="absolute left-4 sm:left-8 mt-3 -translate-x-1/2">
                      <div className="h-3 w-3 rounded-full bg-foreground ring-4 ring-background" />
                    </div>

                    <Card className="group cursor-pointer rounded-xl border border-gray-200/50 hover:border-gray-300 shadow-sm transition-all bg-white hover:bg-gray-50">
                      <CardHeader className="pt-6 pb-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-4 rounded-xl ${period.color}`}>
                            <period.icon className="h-8 w-8" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <CardTitle className={`text-xl font-semibold leading-tight group-hover:opacity-90 transition-opacity ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                {isSindhi ? period.sindhiName : period.name}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs px-3 py-1 rounded-full">
                                {period.years}
                              </Badge>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{period.poets} {content.poets}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                <span>{period.works} {content.works}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 pb-6">
                        <p className={`text-sm text-muted-foreground mb-4 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? period.sindhiDescription : period.description}
                        </p>

                        <div className="mb-4">
                          <h4 className={`text-sm font-medium mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {content.tags}:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {(isSindhi ? period.sindhiTags : period.tags).map((tag, tagIndex) => (
                              <Badge 
                                key={tagIndex} 
                                variant="secondary" 
                                className="text-xs px-2 py-1 rounded-full"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className={`text-sm font-medium mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {content.notablePoets}:
                          </h4>
                          <p className={`text-xs text-muted-foreground ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                            {(isSindhi ? period.sindhiPoetsList : period.poetsList).slice(0, 3).join(', ')}
                            {(isSindhi ? period.sindhiPoetsList : period.poetsList).length > 3 && '...'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200/40 dark:border-white/10">
                          <div className="text-sm text-muted-foreground">
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>
                              {content.significance}: {isSindhi ? period.sindhiSignificance : period.significance}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          
        </div>
      </main>
    </div>
  );
}
