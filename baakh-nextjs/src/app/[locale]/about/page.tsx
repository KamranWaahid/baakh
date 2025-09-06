"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getSmartFontClass } from "@/lib/font-detection-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  BookOpen,
  Heart,
  Globe,
  Lightbulb,
  Shield,
  Users,
  Eye,
  Award,
  ArrowRight,
  Calendar,
  MapPin,
  Star
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function AboutPage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  const locale = isSindhi ? 'sd' : 'en';
  
  // Modern font system - Clean & Minimal
  const fontClass = isSindhi ? 'font-sindhi' : 'font-inter';

  // Multi-lingual content
  const content = {
    // Hero section
    about: {
      en: "About",
      sd: "اسان بابت"
    },
    tagline: {
      en: "An academic yet playful space to read, research, and reflect on Sindhi poetry.",
      sd: "سنڌي شاعري کي پڙهڻ، تحقيق ڪرڻ ۽ غور ڪرڻ لاءِ هڪ تعليمي ۽ دلچسپ جڳھہ"
    },
    
    // Mission section
    ourMission: {
      en: "Our Mission",
      sd: "اسان جو مقصد"
    },
    missionDescription: {
      en: "Baakh is dedicated to preserving, digitizing, and making accessible the rich heritage of Sindhi poetry. We believe in the power of poetry to transcend time and connect generations through shared wisdom and beauty.",
      sd: "باک سنڌي شاعريءَ جي عظيم ورثي کي محفوظ ڪرڻ، ڊجيٽلائيز ڪرڻ ۽ قابل رسائي بڻائڻ لاءِ وقف آهي. اسان شاعريءَ جي طاقت تي يقين رکون ٿا جو وقت کي پار ڪري ۽ مشترڪ دانش ۽ خوبصورتي ذريعي نسلن کي ڳنڍي."
    },
    
    // Mission cards
    preserve: {
      title: { en: "Preserve", sd: "محفوظ ڪرڻ" },
      desc: { en: "Digitally archive classical Sindhi poetry for future generations.", sd: "مستقبل جي نسلن لاءِ سنڌي شاعري کي ڊجيٽل طور تي محفوظ ڪرڻ" }
    },
    share: {
      title: { en: "Share", sd: "ونڊ ڪرڻ" },
      desc: { en: "Make the canon accessible to everyone, everywhere.", sd: "ھن ورثي کي هر ماڻهو لاءِ، هر هنڌ قابل رسائي بڻائڻ" }
    },
    inspire: {
      title: { en: "Inspire", sd: "متاثر ڪرڻ" },
      desc: { en: "Encourage research, translation, and new creative work.", sd: "تحقيق، ترجمو ۽ نئين تخليقي ڪم کي ترغيب ڏيڻ" }
    },
    
    // How we work section
    howWeWork: {
      en: "How We Work",
      sd: "اسان ڪيئن ڪم ڪريون ٿا"
    },
    workDescription: {
      en: "A simple, rigorous flow to keep things scholarly yet inviting.",
      sd: "شيءَ کي علمي ۽ دعوتي رکڻ لاءِ هڪ سادو، سخت عمل"
    },
    
    // Work steps
    collectVerify: {
      title: { en: "Collect & Verify", sd: "جمع ڪرڻ ۽ تصديق" },
      desc: { en: "Gather texts from trusted sources and verify authorship.", sd: "قابل اعتماد ذريعن کان متن جمع ڪرڻ ۽ مصنفيت جي تصديق" }
    },
    digitizeAnnotate: {
      title: { en: "Digitize & Annotate", sd: "ڊجيٽلائيز ۽ تشريح" },
      desc: { en: "Transliterate, translate, and add context and tags.", sd: "ترجمي، تشريح ۽ سياق و سباق ۽ ٽيگ شامل ڪرڻ" }
    },
    curatePublish: {
      title: { en: "Curate & Publish", sd: "ترتيب ۽ اشاعت" },
      desc: { en: "Present in clean formats with references and links.", sd: "صاف فارميٽ ۾ حوالن ۽ لنڪن سان پيش ڪرڻ" }
    },
    engageEvolve: {
      title: { en: "Engage & Evolve", sd: "شامل ٿيڻ ۽ ترقي" },
      desc: { en: "Learn from readers and improve continuously.", sd: "پڙهندڙن کان سکڻ ۽ مسلسل بہتر ٿيڻ" }
    },
    
    // Heritage section
    sindhiPoetryHeritage: {
      en: "Sindhi Poetry Heritage",
      sd: "سنڌي شاعريءَ جو ورثو"
    },
    heritageDescription: {
      en: "Sindhi poetry has a rich history spanning over 300 years, with legendary poets like Shah Abdul Latif Bhittai and Sachal Sarmast creating timeless works that continue to inspire millions.",
      sd: "سنڌي شاعريءَ کي 300 سالن کان وڌيڪ جي امير تاريخ آهي، جن ۾ شاهه عبداللطيف ڀٽائي ۽ سچل سرمست جهڙا افسانوي شاعر شامل آهن جنھن کي ابدي ڪم ٺاھيو آهي جيڪو اڄ تائين لکين کي متاثر ڪري رهيو آهي"
    },
    
    // Heritage details
    historicalSignificance: {
      en: "Historical Significance",
      sd: "تاريخي اهميت"
    },
    culturalImpact: {
      en: "Cultural Impact",
      sd: "ثقافتي اثر"
    },
    
    // Heritage stats
    threeHundredYears: {
      en: "300+ years of literary tradition",
      sd: "300+ سالن جي ادبي روايت"
    },
    fiftyPoets: {
      en: "50+ legendary poets",
      sd: "50+ عظيم شاعر"
    },
    fiveHundredCouplets: {
      en: "500+ classical couplets",
      sd: "500+ ڪلاسيڪي شعر"
    },
    unescoHeritage: {
      en: "UNESCO recognized heritage",
      sd: "يونيسڪو طرفان تسليم ڪيل ورثو"
    },
    
    // Cultural impact items
    spiritualWisdom: {
      en: "Spiritual and philosophical wisdom",
      sd: "روحاني ۽ فلسفي دانش"
    },
    modernLiterature: {
      en: "Influence on modern literature",
      sd: "جديد ادب تي اثر"
    },
    crossCultural: {
      en: "Cross-cultural appreciation",
      sd: "ڪراس ثقافتي تعريفي"
    },
    globalRecognition: {
      en: "Global recognition and study",
      sd: "عالمي تسليم ۽ مطالعو"
    },
    
    // Team section
    ourTeam: {
      en: "Our Team",
      sd: "اسان جو ٽيم"
    },
    teamDescription: {
      en: "Meet the passionate individuals behind Baakh, dedicated to preserving and sharing Sindhi poetry.",
      sd: "باک جي پٺيان پڙهندڙ افراد سان مليو، سنڌي شاعري کي محفوظ ڪرڻ ۽ شيئر ڪرڻ لاءِ وقف"
    },
    
    // Team member roles
    softwareEngineer: {
      en: "Software Engineer",
      sd: "سافٽويئر انجنيئر"
    },
    contentManager: {
      en: "Content Manager",
      sd: "مواد جو منتظم"
    },
    designDevelopment: {
      en: "Responsible for design and development of the platform.",
      sd: "پليٽ فارم جي ڊيزائن ۽ ترقي لاءِ ذميوار"
    },
    contentCollection: {
      en: "Responsible for content collection and curation of the platform.",
      sd: "پليٽ فارم جي مواد جي جمع ڪرڻ ۽ ترتيب لاءِ ذميوار"
    },
    
    // CTA section
    startExploring: {
      en: "Start Exploring",
      sd: "ڳولڻ شروع ڪريو"
    },
    ctaDescription: {
      en: "Discover the timeless wisdom and beauty of classical Sindhi poetry. Begin your journey through centuries of spiritual and literary tradition.",
      sd: "ڪلاسيڪي سنڌي شاعريءَ جي ابدي دانش ۽ خوبصورتي کي ڳولي. صدين جي روحاني ۽ ادبي روايت ذريعي پنهنجو سفر شروع ڪريو"
    },
    meetPoets: {
      en: "Meet Poets",
      sd: "شاعرن سان مليو"
    },
    browseCouplets: {
      en: "Browse Couplets",
      sd: "شعر ڏسو"
    }
  };

  // Apply Sindhi font only if text contains Arabic/Sindhi characters
  const sd = (text?: string | null) => (text && /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text) ? 'auto-sindhi-font' : '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          
          {/* Hero Section */}
          <section className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
                <BookOpen className="h-4 w-4 text-gray-600" />
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                  {content.about[locale]}
                </Badge>
              </div>
              
              <h1 className={`text-5xl md:text-6xl font-bold tracking-tight text-gray-900 ${isRTL ? 'auto-sindhi-font' : 'font-extrabold'}`}>
                {isRTL ? 'باک' : 'Baakh'}
              </h1>
              
              <p className={`text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${getSmartFontClass(content.tagline[locale])} ${!isRTL ? 'font-light' : ''}`}>
                {content.tagline[locale]}
              </p>
            </motion.div>
          </section>

          {/* Mission Section */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className={`text-4xl font-bold text-gray-900 mb-6 ${getSmartFontClass(content.ourMission[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                  {content.ourMission[locale]}
                </h2>
                <p className={`text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed ${getSmartFontClass(content.missionDescription[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.missionDescription[locale]}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                 <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                   <CardHeader className="text-center pb-6">
                     <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-6">
                       <BookOpen className="w-8 h-8 text-gray-700" />
                     </div>
                     <CardTitle className={`text-xl font-semibold ${getSmartFontClass(content.preserve.title[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                       {content.preserve.title[locale]}
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="text-center text-gray-600 leading-relaxed">
                     <p className={`${getSmartFontClass(content.preserve.desc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                       {content.preserve.desc[locale]}
                     </p>
                   </CardContent>
                 </Card>

                                 <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                   <CardHeader className="text-center pb-6">
                     <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-6">
                       <Globe className="w-8 h-8 text-gray-700" />
                     </div>
                     <CardTitle className={`text-xl font-semibold ${getSmartFontClass(content.share.title[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                       {content.share.title[locale]}
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="text-center text-gray-600 leading-relaxed">
                     <p className={`${getSmartFontClass(content.share.desc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                       {content.share.desc[locale]}
                     </p>
                   </CardContent>
                 </Card>

                                 <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                   <CardHeader className="text-center pb-6">
                     <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-6">
                       <Heart className="w-8 h-8 text-gray-700" />
                     </div>
                     <CardTitle className={`text-xl font-semibold ${getSmartFontClass(content.inspire.title[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                       {content.inspire.title[locale]}
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="text-center text-gray-600 leading-relaxed">
                     <p className={`${getSmartFontClass(content.inspire.desc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                       {content.inspire.desc[locale]}
                     </p>
                   </CardContent>
                 </Card>
              </div>
            </motion.div>
          </section>

          {/* How We Work Section */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className={`text-4xl font-bold text-gray-900 mb-6 ${getSmartFontClass(content.howWeWork[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                  {content.howWeWork[locale]}
                </h2>
                <p className={`text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${getSmartFontClass(content.workDescription[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.workDescription[locale]}
                </p>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300" />
                <div className="space-y-8">
                  {[
                    {
                      title: content.collectVerify.title[locale],
                      desc: content.collectVerify.desc[locale],
                      icon: Lightbulb
                    },
                    {
                      title: content.digitizeAnnotate.title[locale],
                      desc: content.digitizeAnnotate.desc[locale],
                      icon: Shield
                    },
                    {
                      title: content.curatePublish.title[locale],
                      desc: content.curatePublish.desc[locale],
                      icon: Eye
                    },
                    {
                      title: content.engageEvolve.title[locale],
                      desc: content.engageEvolve.desc[locale],
                      icon: Award
                    }
                  ].map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="relative"
                      >
                        <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-white border-4 border-gray-400 shadow-sm" />
                                                 <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                           <CardContent className="p-6">
                             <div className="flex items-start gap-4">
                               <div className="p-3 rounded-xl bg-gray-100 border border-gray-200">
                                 <Icon className="w-6 h-6 text-gray-700" />
                               </div>
                               <div className="flex-1">
                                 <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${getSmartFontClass(step.title)} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                                   {step.title}
                                 </h3>
                                 <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(step.desc)} ${!isRTL ? 'font-medium' : ''}`}>
                                   {step.desc}
                                 </p>
                               </div>
                             </div>
                           </CardContent>
                         </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </section>

          {/* Heritage Section */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className={`text-4xl font-bold text-gray-900 mb-6 ${getSmartFontClass(content.sindhiPoetryHeritage[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                  {content.sindhiPoetryHeritage[locale]}
                </h2>
                <p className={`text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed ${getSmartFontClass(content.heritageDescription[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.heritageDescription[locale]}
                </p>
              </div>

              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h3 className={`text-2xl font-semibold text-gray-900 mb-6 ${getSmartFontClass(content.historicalSignificance[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      {content.historicalSignificance[locale]}
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                          <Calendar className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className={`text-gray-700 ${getSmartFontClass(content.threeHundredYears[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.threeHundredYears[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                          <Users className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className={`text-gray-700 ${getSmartFontClass(content.fiftyPoets[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.fiftyPoets[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                          <BookOpen className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className={`text-gray-700 ${getSmartFontClass(content.fiveHundredCouplets[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.fiveHundredCouplets[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                          <Star className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className={`text-gray-700 ${getSmartFontClass(content.unescoHeritage[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.unescoHeritage[locale]}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={`text-2xl font-semibold text-gray-900 mb-6 ${getSmartFontClass(content.culturalImpact[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      {content.culturalImpact[locale]}
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                          <Heart className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className={`text-gray-700 ${getSmartFontClass(content.spiritualWisdom[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.spiritualWisdom[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                            <Lightbulb className="w-3 h-3 text-gray-600" />
                          </div>
                          <span className={`text-gray-700 ${getSmartFontClass(content.modernLiterature[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                            {content.modernLiterature[locale]}
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                          <Shield className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className={`text-gray-700 ${getSmartFontClass(content.crossCultural[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.crossCultural[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                          <Globe className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className={`text-gray-700 ${getSmartFontClass(content.globalRecognition[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.globalRecognition[locale]}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* Team Section */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className={`text-4xl font-bold text-gray-900 mb-6 ${getSmartFontClass(content.ourTeam[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                  {content.ourTeam[locale]}
                </h2>
                <p className={`text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${getSmartFontClass(content.teamDescription[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.teamDescription[locale]}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Kamran Wahid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                                     <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm text-center">
                     <CardContent className="p-8">
                       <Avatar className="w-24 h-24 mx-auto mb-6 ring-4 ring-gray-100 border-2 border-gray-200">
                         <AvatarFallback className="text-xl font-bold bg-gray-100 text-gray-700">KW</AvatarFallback>
                       </Avatar>
                       <h3 className={`text-2xl font-semibold text-gray-900 mb-3 ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                         Kamran Wahid
                       </h3>
                       <p className={`text-gray-600 mb-4 text-lg ${isRTL ? 'auto-sindhi-font' : 'font-medium'}`} dir="rtl">
                         ڪامران واحد
                       </p>
                       <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                         <Lightbulb className="w-4 h-4" />
                         <span className={`${!isRTL ? 'font-medium' : ''}`}>
                           {content.softwareEngineer[locale]}
                         </span>
                       </div>
                       <p className={`text-sm text-gray-600 leading-relaxed ${!isRTL ? 'font-medium' : ''}`}>
                         {content.designDevelopment[locale]}
                       </p>
                     </CardContent>
                   </Card>
                </motion.div>

                {/* Ubaid Thaheem */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                                     <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm text-center">
                     <CardContent className="p-8">
                       <Avatar className="w-24 h-24 mx-auto mb-6 ring-4 ring-gray-100 border-2 border-gray-200">
                         <AvatarFallback className="text-xl font-bold bg-gray-100 text-gray-700">UT</AvatarFallback>
                       </Avatar>
                       <h3 className={`text-2xl font-semibold text-gray-900 mb-3 ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                         Ubaid Thaheem
                       </h3>
                       <p className={`text-gray-600 mb-4 text-lg ${isRTL ? 'auto-sindhi-font' : 'font-medium'}`} dir="rtl">
                         عبيد ٿھيم
                       </p>
                       <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                         <Lightbulb className="w-4 h-4" />
                         <span className={`${!isRTL ? 'font-medium' : ''}`}>
                           {content.softwareEngineer[locale]}
                         </span>
                       </div>
                       <p className={`text-sm text-gray-600 leading-relaxed ${!isRTL ? 'font-medium' : ''}`}>
                         {content.designDevelopment[locale]}
                       </p>
                     </CardContent>
                   </Card>
                </motion.div>

                {/* Charan Jamali */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                                     <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm text-center">
                     <CardContent className="p-8">
                       <Avatar className="w-24 h-24 mx-auto mb-6 ring-4 ring-gray-100 border-2 border-gray-200">
                         <AvatarFallback className="text-xl font-bold bg-gray-100 text-gray-700">CJ</AvatarFallback>
                       </Avatar>
                       <h3 className={`text-2xl font-semibold text-gray-900 mb-3 ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                         Charan Jamali
                       </h3>
                       <p className={`text-gray-600 mb-4 text-lg ${isRTL ? 'auto-sindhi-font' : 'font-medium'}`} dir="rtl">
                         چارو
                       </p>
                       <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                         <Shield className="w-4 h-4" />
                         <span className={`${!isRTL ? 'font-medium' : ''}`}>
                           {content.contentManager[locale]}
                         </span>
                       </div>
                       <p className={`text-sm text-gray-600 leading-relaxed ${!isRTL ? 'font-medium' : ''}`}>
                         {content.contentCollection[locale]}
                       </p>
                     </CardContent>
                   </Card>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* CTA Section */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-12">
                <h2 className={`text-3xl font-bold text-gray-900 mb-6 ${getSmartFontClass(content.startExploring[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                  {content.startExploring[locale]}
                </h2>
                <p className={`text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed ${getSmartFontClass(content.ctaDescription[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.ctaDescription[locale]}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={locale === 'sd' ? "/sd/poets" : "/en/poets"}>
                    <Button size="lg" className="h-12 px-8 text-base rounded-xl border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200">
                      <Users className="w-5 h-5 mr-2" />
                      {content.meetPoets[locale]}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href={locale === 'sd' ? "/sd/couplets" : "/en/couplets"}>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-xl border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      {content.browseCouplets[locale]}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
} 