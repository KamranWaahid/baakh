"use client";
import { getSmartFontClass } from "@/lib/font-detection-utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Database, Users, AlertCircle, FileText, CheckCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PrivacyPolicyPage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  const locale = isSindhi ? 'sd' : 'en';

  const content = {
    privacy: { en: "Privacy", sd: "رازداري" },
    privacyPolicy: { en: "Privacy Policy", sd: "رازداري جي پاليسي" },
    heroDescription: {
      en: "At Baakh, your privacy isn’t just a policy—it’s a promise.",
      sd: "باڪ وٽ، رازداري رڳو پاليسي نه—وعدو آهي"
    },
    lastUpdated: { en: "Last updated:", sd: "آخري اپڊيٽ:" },
    introLead: {
      en: "As a non-profit, community-driven platform, we believe cultural preservation and personal dignity go hand in hand. Protecting your data is central to our mission.",
      sd: "غير منافعي، ڪميونٽي منصوبي طور ثقافتي ورثو ۽ ذاتي وقار گڏ هلن ٿا— تنهنڪري رازداري اسان جي مرڪزي ذميواري آهي"
    },
    introE2EE: {
      en: "This Privacy Policy explains what we collect, why we collect it, and how we safeguard it using end‑to‑end encryption (E2EE) and modern cryptographic protections.",
      sd: "هي پاليسي ٻڌائي ٿي ته اسان ڇا گڏ ڪريون ٿا، ڇو ۽ ڪيئن E2EE ۽ جديد ڪرپٽو ذريعي محفوظ رکون ٿا"
    },
    collectHeader: { en: "What We Collect", sd: "اسان ڇا گڏ ڪريون ٿا" },
    collectDesc: { en: "We keep data collection minimal and transparent:", sd: "اسان گهٽ ۽ شفاف ڊيٽا گڏ ڪريون ٿا:" },
    collectUsage: { en: "Usage data: pages viewed, basic interaction logs, technical info (e.g., browser or session duration).", sd: "استعمال جي ڊيٽا: صفحا، لاگز، فني ڄاڻ (برائوزر، سيشن وغيره)" },
    collectVoluntary: { en: "Voluntary contributions: feedback, suggestions, or content you choose to share.", sd: "رضاڪارانه شيون: فيڊ بيڪ، تجويزون يا جيڪو مواد توهان شيئر ڪريو" },
    noTracking: { en: "We do not track you across the web, build advertising profiles, or collect unnecessary personal identifiers.", sd: "نه ويب تي ٽريڪ ڪيون ٿا، نه اشتهاري پروفائل ٺاهيون ٿا، نه غير ضروري سڃاڻپ گڏ ڪيون ٿا" },
    useHeader: { en: "How We Use Data", sd: "ڊيٽا جو استعمال" },
    useImprove: { en: "Improve Baakh’s performance and accessibility.", sd: "ڪارڪردگي ۽ رسائي بهتر ڪرڻ" },
    usePersonalize: { en: "Provide simple, non‑invasive personalization.", sd: "غير مداخلتي ذاتي ترتيب فراهم ڪرڻ" },
    useSecurity: { en: "Strengthen security and platform stability.", sd: "پليٽ فارم جي سيڪيورٽي ۽ استحڪام وڌائڻ" },
    useResearch: { en: "Support education, cultural research, and literary preservation.", sd: "تعليم، تحقيق ۽ ادبي ورثي جي حفاظت ۾ مدد" },
    neverAds: { en: "We never use your data for surveillance, advertising, or profit.", sd: "نه نگراني لاءِ، نه اشتهارن لاءِ، نه نفعي لاءِ ڊيٽا استعمال ڪيون ٿا" },
    securityHeader: { en: "Security and Encryption", sd: "حفاظت ۽ انڪريپشن" },
    securityIntro: { en: "We preserve privacy as we preserve poetry: securely and with integrity.", sd: "جيئن شعر سنڀالون ٿا، تيئن رازداري: محفوظ ۽ باوقار" },
    secE2EE: { en: "End‑to‑end encryption (E2EE) for certain sensitive items so only you (and intended recipients) can access them.", sd: "حساس شين لاءِ E2EE ته جيئن رڳو توهان يا مقرر وصول ڪندڙ رسائي رکن" },
    secCrypto: { en: "Strong, industry‑standard cryptography in transit and at rest.", sd: "تحويل ۽ ذخيري دوران مضبوط صنعتي معيار واري ڪرپٽو" },
    secRetention: { en: "Minimal retention: we store only what’s necessary and delete when no longer needed.", sd: "گهٽ ذخيرو: رڳو لازمي شيون محفوظ، پوءِ ختم" },
    secAccess: { en: "Restricted access: only essential operators under strict confidentiality.", sd: "محدود رسائي: سخت رازداري سان رڳو ضروري عملدار" },
    sharingHeader: { en: "Sharing", sd: "شيئر ڪرڻ" },
    sharingNoSell: { en: "We do not sell, trade, or monetize your data, nor provide it to corporations, organizations, or governments.", sd: "نه وڪرو، نه واپار، نه منافعي لاءِ استعمال؛ نه ادارن يا حڪومتن کي فراهمي" },
    sharingLaw: { en: "Only if legally compelled by due process—and we design Baakh to minimize what we hold.", sd: "صرف قانوني تقاضن هيٺ؛ باڪ ايترو ئي محفوظ ڪري ٿو جيترو لازمي" },
    sharingVendors: { en: "For basic operations we may use trusted providers who must meet our security and privacy standards.", sd: "بنيادي آپريشن لاءِ ڀروسي لائق فراهم ڪندڙ، جن تي ساڳيا اصول لاڳو" },
    rightsHeader: { en: "Your Rights and Control", sd: "توهان جا حق" },
    rightsAccess: { en: "Request access to your data.", sd: "پنهنجي ڊيٽا تائين رسائي گهريو" },
    rightsCorrect: { en: "Ask for corrections or deletions.", sd: "درستي يا ختم ڪرڻ جي درخواست" },
    rightsWithdraw: { en: "Withdraw consent where applicable.", sd: "جتي لاڳو هجي، رضا ختم ڪريو" },
    rightsCommit: { en: "We honor requests promptly and respectfully.", sd: "درخواستن جو جلد ۽ باادب جواب" },
    childrenHeader: { en: "Children and Young People", sd: "ٻار ۽ نوجوان" },
    childrenText: { en: "Baakh is for individuals 13+ and does not knowingly collect data from children under 13.", sd: "باڪ 13+ لاءِ آهي؛ 13 کان گهٽ عمر وارن کان ڄاڻ نه گڏ ڪري ٿو" },
    updatesHeader: { en: "Updates to This Policy", sd: "پاليسي ۾ تبديليون" },
    updatesText: { en: "If we make meaningful changes, we’ll notify you on our website or by email.", sd: "مهم تبديليون ویب سائيٽ يا اي ميل ذريعي ٻڌائبيون" },
    questionsHeader: { en: "Questions or Requests?", sd: "سوال يا درخواستون؟" },
    questionsText: { en: "If you have privacy questions or requests, please contact us.", sd: "رازداري بابت سوال يا درخواست هجي ته رابطو ڪريو" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="py-10">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Hero */}
          <section className="text-center py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
                <Shield className="h-4 w-4 text-gray-600" />
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                  {content.privacy[locale]}
                </Badge>
              </div>
              <h1 className={`text-5xl md:text-6xl font-bold tracking-tight text-gray-900 ${isRTL ? 'auto-sindhi-font' : 'font-extrabold'}`}>
                {content.privacyPolicy[locale]}
              </h1>
              <p className={`text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${getSmartFontClass(content.heroDescription[locale])} ${!isRTL ? 'font-light' : ''}`}>
                {content.heroDescription[locale]}
              </p>
            </motion.div>
          </section>

          {/* Last Updated */}
          <section className="py-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center">
              <p className={`text-gray-600 ${getSmartFontClass(content.lastUpdated[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                {content.lastUpdated[locale]} {new Date().toLocaleDateString()}
              </p>
            </motion.div>
          </section>

          {/* Intro */}
          <section className="py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
              <div className="text-center">
                <p className={`text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed ${getSmartFontClass(content.introLead[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.introLead[locale]}
                </p>
                <p className={`text-lg text-gray-600 max-w-4xl mx-auto mt-4 leading-relaxed ${getSmartFontClass(content.introE2EE[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.introE2EE[locale]}
                </p>
              </div>
            </motion.div>
          </section>

          {/* What We Collect */}
          <section className="py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
              <Card className="rounded-2xl border border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-xl font-semibold ${getSmartFontClass(content.collectHeader[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <Database className="w-6 h-6 text-gray-700" />
                    <span>{content.collectHeader[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className={`text-gray-600 leading-7 mb-4 ${getSmartFontClass(content.collectDesc[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.collectDesc[locale]}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className={`${getSmartFontClass(content.collectUsage[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.collectUsage[locale]}</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className={`${getSmartFontClass(content.collectVoluntary[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.collectVoluntary[locale]}</span>
                    </div>
                  </div>
                  <p className={`text-gray-600 leading-7 mt-4 ${getSmartFontClass(content.noTracking[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.noTracking[locale]}</p>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* How We Use Data */}
          <section className="py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
              <Card className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur">
                <CardHeader className="bg-white/80">
                  <CardTitle className={`flex items-center gap-2 text-xl font-semibold ${getSmartFontClass(content.useHeader[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <FileText className="w-6 h-6 text-gray-700" />
                    <span>{content.useHeader[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className={`${getSmartFontClass(content.useImprove[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.useImprove[locale]}</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className={`${getSmartFontClass(content.usePersonalize[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.usePersonalize[locale]}</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className={`${getSmartFontClass(content.useSecurity[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.useSecurity[locale]}</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className={`${getSmartFontClass(content.useResearch[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.useResearch[locale]}</span>
                    </div>
                  </div>
                  <p className={`text-gray-600 leading-7 mt-4 ${getSmartFontClass(content.neverAds[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.neverAds[locale]}</p>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Security and Encryption */}
          <section className="py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
              <Card className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50">
                <CardHeader className="bg-white">
                  <CardTitle className={`flex items-center gap-2 text-xl font-semibold ${getSmartFontClass(content.securityHeader[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <Lock className="w-6 h-6 text-gray-700" />
                    <span>{content.securityHeader[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className={`text-gray-600 leading-7 mb-4 ${getSmartFontClass(content.securityIntro[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.securityIntro[locale]}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className={`${getSmartFontClass(content.secE2EE[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.secE2EE[locale]}</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className={`${getSmartFontClass(content.secCrypto[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.secCrypto[locale]}</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className={`${getSmartFontClass(content.secRetention[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.secRetention[locale]}</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className={`${getSmartFontClass(content.secAccess[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.secAccess[locale]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Sharing */}
          <section className="py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
              <Card className="rounded-2xl border border-gray-200 bg-white">
                <CardHeader className="bg-white">
                  <CardTitle className={`flex items-center gap-2 text-xl font-semibold ${getSmartFontClass(content.sharingHeader[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <Users className="w-6 h-6 text-gray-700" />
                    <span>{content.sharingHeader[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <p className={`text-gray-600 leading-7 ${getSmartFontClass(content.sharingNoSell[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.sharingNoSell[locale]}</p>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <p className={`text-gray-600 leading-7 ${getSmartFontClass(content.sharingLaw[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.sharingLaw[locale]}</p>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <p className={`text-gray-600 leading-7 ${getSmartFontClass(content.sharingVendors[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.sharingVendors[locale]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Your Rights and Control */}
          <section className="py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className={`flex items-center gap-2 text-xl font-semibold ${getSmartFontClass(content.rightsHeader[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <Shield className="w-6 h-6 text-gray-700" />
                    <span>{content.rightsHeader[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" /><span className={`${getSmartFontClass(content.rightsAccess[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.rightsAccess[locale]}</span></li>
                    <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" /><span className={`${getSmartFontClass(content.rightsCorrect[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.rightsCorrect[locale]}</span></li>
                    <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-gray-500 mt-0.5" /><span className={`${getSmartFontClass(content.rightsWithdraw[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.rightsWithdraw[locale]}</span></li>
                  </ul>
                  <p className={`text-gray-600 leading-7 mt-4 ${getSmartFontClass(content.rightsCommit[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.rightsCommit[locale]}</p>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Children */}
          <section className="py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className={`flex items-center gap-2 text-xl font-semibold ${getSmartFontClass(content.childrenHeader[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <AlertCircle className="w-6 h-6 text-gray-700" />
                    <span>{content.childrenHeader[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className={`text-gray-600 leading-7 ${getSmartFontClass(content.childrenText[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.childrenText[locale]}</p>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Updates */}
          <section className="py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className={`flex items-center gap-2 text-xl font-semibold ${getSmartFontClass(content.updatesHeader[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <FileText className="w-6 h-6 text-gray-700" />
                    <span>{content.updatesHeader[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className={`text-gray-600 leading-7 ${getSmartFontClass(content.updatesText[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.updatesText[locale]}</p>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          

          {/* Questions / Contact */}
          <section className="py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className={`flex items-center gap-2 text-xl font-semibold ${getSmartFontClass(content.questionsHeader[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <AlertCircle className="w-6 h-6 text-gray-700" />
                    <span>{content.questionsHeader[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className={`text-gray-600 leading-7 mb-4 ${getSmartFontClass(content.questionsText[locale])} ${!isRTL ? 'font-medium' : ''}`}>{content.questionsText[locale]}</p>
                  <Link href={`/${locale}/contact`} className="text-gray-700 hover:text-gray-900 font-semibold underline">
                    {locale === 'sd' ? 'اسان سان رابطو ڪريو' : 'Contact us'}
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
}


