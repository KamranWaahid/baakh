"use client";
import { getSmartFontClass } from "@/lib/font-detection-utils";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText,
  Shield,
  Users,
  Globe,
  Heart,
  BookOpen,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function TermsPage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  const locale = isSindhi ? 'sd' : 'en';

  // Multi-lingual content
  const content = {
    // Hero section
    terms: {
      en: "Terms",
      sd: "شرطون"
    },
    termsOfService: {
      en: "Terms of Service",
      sd: "خدمت جون شرطون"
    },
    heroDescription: {
      en: "Please read these terms carefully before using our service.",
      sd: "مهرباني ڪري اسان جي پليٽفارم کي استعمال ڪرڻ کان اڳ هي شرطون احتياط سان پڙهو"
    },
    
    // Last updated
    lastUpdated: {
      en: "Last updated:",
      sd: "آخري اپڊيٽ:"
    },
    
    // Overview
    welcomeToBaakh: {
      en: "Welcome to Baakh",
      sd: "باک ۾ ڀليڪار"
    },
    overview: {
      en: "By accessing and using Baakh, you agree to be bound by these Terms of Service. These terms govern your use of our poetry platform and services.",
      sd: "باک تي رسائي ۽ استعمال ڪرڻ سان توهان انهن خدمت جي شرطن کي مڃڻ لاءِ راضي ٿي رهيا آهيو. هي شرطون اسان جي شاعريءَ جي پليٽ فارم ۽ خدمتن جي توهان جي استعمال کي کنٽرول ڪريون ٿيون"
    },
    
    // Overview cards
    access: {
      title: {
        en: "Access",
        sd: "رسائي"
      },
      desc: {
        en: "Free access to Sindhi poetry.",
        sd: "سنڌي شاعريءَ تي مفت رسائي"
      }
    },
    respect: {
      title: {
        en: "Respect",
        sd: "احترام"
      },
      desc: {
        en: "Honor cultural heritage and intellectual property.",
        sd: "ثقافتي ورثي ۽ دانشورانه ملڪيت جو احترام"
      }
    },
    safe: {
      title: {
        en: "Safe",
        sd: "محفوظ"
      },
      desc: {
        en: "A secure, welcoming environment for all.",
        sd: "سڀني لاءِ هڪ محفوظ، خوش آمديد ماحول"
      }
    },
    
    // Acceptance of terms
    acceptanceOfTerms: {
      en: "Acceptance of Terms",
      sd: "شرطن جي قبوليت"
    },
    byUsingOurService: {
      en: "By Using Our Service",
      sd: "اسان جي خدمت استعمال ڪرڻ سان"
    },
    acceptanceDescription: {
      en: "By accessing or using Baakh, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.",
      sd: "باک تي رسائي يا استعمال ڪرڻ سان توهان تسليم ڪري رهيا آهيو ته توهان پڙهيو، سمجهيو، ۽ انهن خدمت جي شرطن کي مڃڻ لاءِ راضي آهيو. جيڪڏهن توهان انهن شرطن سان متفق نه آهيو ته مهرباني ڪري اسان جي خدمت استعمال نه ڪريو"
    },
    
    // Acceptance items
    ageRequirement: {
      en: "You must be at least 13 years old to use this service",
      sd: "هي خدمت استعمال ڪرڻ لاءِ توهان کي گهٽ ۾ گهٽ 13 سال جو هجڻ گهرجي"
    },
    accountConfidentiality: {
      en: "You are responsible for maintaining the confidentiality of your account",
      sd: "توهان پنهنجي اڪائونٽ جي رازداري برقرار رکڻ لاءِ ذميوار آهيو"
    },
    lawfulPurposes: {
      en: "You agree to use the service only for lawful purposes",
      sd: "توهان صرف قانوني مقصدن لاءِ خدمت استعمال ڪرڻ لاءِ راضي آهيو"
    },
    unauthorizedAccess: {
      en: "You will not attempt to gain unauthorized access to our systems",
      sd: "توهان اسان جي سسٽمن تي غير مجاز رسائي حاصل ڪرڻ جي ڪوشش نه ڪريو گه"
    },
    
    // Use of service
    useOfService: {
      en: "Use of Service",
      sd: "خدمت جو استعمال"
    },
    permittedUses: {
      en: "Permitted Uses",
      sd: "اجازت يافتہ استعمال"
    },
    prohibitedUses: {
      en: "Prohibited Uses",
      sd: "ممنوع استعمال"
    },
    
    // Permitted uses items
    readingPoetry: {
      en: "Reading and studying poetry",
      sd: "شاعري پڙهڻ ۽ مطالعو ڪرڻ"
    },
    academicResearch: {
      en: "Academic research and education",
      sd: "علمي تحقيق ۽ تعليم"
    },
    personalEnjoyment: {
      en: "Personal enjoyment and appreciation",
      sd: "ذاتي لطف ۽ تعري"
    },
    sharingContent: {
      en: "Sharing content with proper attribution",
      sd: "مناسب حوالن سان مواد شيئر ڪرڻ"
    },
    contributingFeedback: {
      en: "Contributing feedback and suggestions",
      sd: "رايا ۽ تجويزون ڏيڻ"
    },
    
    // Prohibited uses items
    commercialUse: {
      en: "Commercial use without permission",
      sd: "اجازت کان سواءِ تجارتي استعمال"
    },
    modifyingContent: {
      en: "Modifying or altering content",
      sd: "مواد کي تبديل يا تبديل ڪرڻ"
    },
    removingAttribution: {
      en: "Removing attribution or credits",
      sd: "حوالو يا ڪريڊٽس هٽائڻ"
    },
    harassment: {
      en: "Harassment or abusive behavior",
      sd: "ستائين يا غلط رويو"
    },
    disruptingService: {
      en: "Attempting to disrupt the service",
      sd: "خدمت کي رڪاوٽ ڪرڻ جي ڪوشش"
    },
    
    // Intellectual property
    intellectualProperty: {
      en: "Intellectual Property",
      sd: "دانشورانه ملڪيت"
    },
    contentOwnership: {
      en: "Content Ownership",
      sd: "مواد جي ملڪيت"
    },
    userContributions: {
      en: "User Contributions",
      sd: "صارف جو تعاون"
    },
    attribution: {
      en: "Attribution",
      sd: "حوالو"
    },
    
    // Content ownership description
    contentOwnershipDesc: {
      en: "The classical poetry content on Baakh is in the public domain or used with proper permissions. Our platform design, code, and original content are protected by copyright.",
      sd: "باک تي ڪلاسيڪل شاعريءَ جو مواد عوامي ميدان ۾ آهي يا مناسب اجازتن سان استعمال ڪيو ويو آهي. اسان جي پليٽ فارم جو ڊيزائن، ڪوڊ، ۽ اصل مواد ڪاپي رائيٽ سان محفوظ آهي"
    },
    
    // User contributions description
    userContributionsDesc: {
      en: "When you contribute content, you grant us a license to use, display, and distribute your contributions while maintaining your ownership rights.",
      sd: "جڏهن توهان مواد جو تعاون ڪريو ٿا ته توهان اسان کي اجازت ڏي رهيا آهيو ته اسان توهان جي تعاون کي استعمال، ڏيکاري، ۽ تقسيم ڪريون ته جيئن توهان جي ملڪيت جي حق کي برقرار رکي سگهجي"
    },
    
    // Attribution description
    attributionDesc: {
      en: "When using our content, you must provide proper attribution to the original poets and our platform. This helps preserve the cultural heritage and supports our mission.",
      sd: "اسان جو مواد استعمال ڪرڻ وقت توهان کي اصل شاعرن ۽ اسان جي پليٽ فارم کي مناسب حوالو ڏيڻ گهرجي. هي ثقافتي ورثي کي محفوظ رکڻ ۽ اسان جي مشن کي سپورٽ ڪرڻ ۾ مدد ڪري ٿو"
    },
    
    // Privacy and data
    privacyAndData: {
      en: "Privacy and Data",
      sd: "رازداري ۽ ڊيٽا"
    },
    dataProtection: {
      en: "Data Protection",
      sd: "ڊيٽا جي حفاظت"
    },
    privacyPolicy: {
      en: "Privacy Policy",
      sd: "رازداري جي پاليسي"
    },
    
    // Data protection description
    dataProtectionDesc: {
      en: "We are committed to protecting your privacy. Our data collection and usage practices are detailed in our",
      sd: "اسان توهان جي رازداري کي محفوظ ڪرڻ لاءِ پابند آهيون. اسان جي ڊيٽا جي جمع ڪرڻ ۽ استعمال جي عملن کي تفصيل سان بيان ڪيو ويو آهي اسان جي"
    },
    
    // Data protection items
    minimalData: {
      en: "We collect minimal data necessary for service operation",
      sd: "اسان خدمت جي آپريشن لاءِ گهٽ ۾ گهٽ ضروري ڊيٽا جمع ڪريون ٿا"
    },
    noDataSale: {
      en: "Your personal information is never sold to third parties",
      sd: "توهان جي ذاتي معلومات کي ڪڏهن به ٽيون پارٽي کي وڪرو نه ڪيو ويندو"
    },
    securityMeasures: {
      en: "We use industry-standard security measures",
      sd: "اسان صنعتي معيار جي حفاظتي اقدامات استعمال ڪريون ٿا"
    },
    dataControl: {
      en: "You have control over your data and can request deletion",
      sd: "توهان کي توهان جي ڊيٽا تي ڪنٽرول آهي ۽ توهان ڊيليشن جي درخواست ڪري سگهو ٿا"
    },
    
    // Disclaimers
    disclaimers: {
      en: "Disclaimers",
      sd: "انڪار"
    },
    serviceAvailability: {
      en: "Service Availability",
      sd: "خدمت جي دستيابي"
    },
    contentAccuracy: {
      en: "Content Accuracy",
      sd: "مواد جي درستي"
    },
    limitationOfLiability: {
      en: "Limitation of Liability",
      sd: "ذميوار جي حد"
    },
    
    // Service availability description
    serviceAvailabilityDesc: {
      en: "We strive to maintain high availability but cannot guarantee uninterrupted service. We may need to perform maintenance or updates that temporarily affect availability.",
      sd: "اسان اعليٰ دستيابي برقرار رکڻ جي ڪوشش ڪريون ٿا پر مسلسل خدمت کي يقيني بڻائي نٿو سگهون. اسان کي صفائي يا اپڊيٽس ڪرڻ جي ضرورت پوي سگهي ٿي جيڪي عارضي طور تي دستيابي کي متاثر ڪن"
    },
    
    // Content accuracy description
    contentAccuracyDesc: {
      en: "While we strive for accuracy, translations and interpretations may vary. We encourage users to consult multiple sources for academic or research purposes.",
      sd: "جيتوڻيڪ اسان درستي لاءِ ڪوشش ڪريون ٿا پر ترجمي ۽ تشريح مختلف هون سگهي ٿي. اسان صارفين کي علمي يا تحقيق مقصدن لاءِ ڪيترين ئي ذريعن کان صلاح وٺڻ لاءِ اڳواٽ ڪريون ٿا"
    },
    
    // Limitation of liability description
    limitationOfLiabilityDesc: {
      en: "Baakh is provided \"as is\" without warranties. We are not liable for any damages arising from the use of our service or content.",
      sd: "باک \"جيئن آهي\" جيئن وارنٽي کان سواءِ فراهم ڪيو ويو آهي. اسان اسان جي خدمت يا مواد جي استعمال کان پيدا ٿيندڙ ڪنهن به نقصان لاءِ ذميوار نه آهيون"
    },
    
    // Changes to terms
    changesToTerms: {
      en: "Changes to Terms",
      sd: "شرطن ۾ تبديليون"
    },
    updatesAndModifications: {
      en: "Updates and Modifications",
      sd: "اپڊيٽس ۽ تبديليون"
    },
    
    // Updates description
    updatesDesc: {
      en: "We may update these terms from time to time. We will notify users of significant changes through our website or email. Continued use of the service after changes constitutes acceptance of the new terms.",
      sd: "اسان انهن شرطن کي وقت بوقت اپڊيٽ ڪري سگهون ٿا. اسان اهم تبديليون باري ۾ صارفين کي اسان جي ويب سائيٽ يا اي ميل ذريعي اطلاع ڏينداسين. تبديليون کان پوءِ خدمت جو مسلسل استعمال نين شرطن جي قبوليت کي ظاهر ڪري ٿو"
    },
    
    // Contact section
    questionsAboutTerms: {
      en: "Questions About Terms?",
      sd: "شرطن باري ۾ سوال؟"
    },
    termsQuestionsDesc: {
      en: "If you have any questions about these Terms of Service or need clarification on any point, please don't hesitate to contact us.",
      sd: "جيڪڏهن توهان کي انهن خدمت جي شرطن باري ۾ ڪو سوال آهي يا ڪنهن نقطي تي واضحيت جي ضرورت آهي ته مهرباني ڪري اسان سان رابطو ڪرڻ ۾ هچڪي نه ڪريو"
    },
    contactUs: {
      en: "Contact Us",
      sd: "اسان سان رابطو ڪريو"
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
                <FileText className="h-4 w-4 text-gray-600" />
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                  {content.terms[locale]}
                </Badge>
              </div>
              
              <h1 className={`text-5xl md:text-6xl font-bold tracking-tight text-gray-900 ${isRTL ? 'auto-sindhi-font' : 'font-extrabold'}`}>
                {content.termsOfService[locale]}
              </h1>
              
              <p className={`text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${getSmartFontClass(content.heroDescription[locale])} ${!isRTL ? 'font-light' : ''}`}>
                {content.heroDescription[locale]}
              </p>
            </motion.div>
          </section>

          {/* Last Updated */}
          <section className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className={`text-gray-600 ${getSmartFontClass(content.lastUpdated[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                {content.lastUpdated[locale]} {new Date().toLocaleDateString()}
              </p>
            </motion.div>
          </section>

          {/* Overview */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className={`text-3xl font-bold text-gray-900 mb-6 ${getSmartFontClass(content.welcomeToBaakh[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                  {content.welcomeToBaakh[locale]}
                </h2>
                <p className={`text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed ${getSmartFontClass(content.overview[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.overview[locale]}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { 
                    title: content.access.title[locale], 
                    Icon: BookOpen, 
                    desc: content.access.desc[locale] 
                  }, 
                  { 
                    title: content.respect.title[locale], 
                    Icon: Heart, 
                    desc: content.respect.desc[locale] 
                  }, 
                  { 
                    title: content.safe.title[locale], 
                    Icon: Shield, 
                    desc: content.safe.desc[locale] 
                  }
                ].map(({ title, Icon, desc }) => (
                  <Card key={title} className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-6">
                        <Icon className="w-8 h-8 text-gray-700" />
                      </div>
                      <CardTitle className={`text-xl font-semibold ${getSmartFontClass(title)} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                        {title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(desc)} ${!isRTL ? 'font-medium' : ''}`}>
                        {desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Acceptance of Terms */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className={`text-3xl font-bold text-gray-900 text-center mb-12 ${getSmartFontClass(content.acceptanceOfTerms[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                {content.acceptanceOfTerms[locale]}
              </h2>

              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.byUsingOurService[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <CheckCircle className="w-6 h-6 text-gray-700" />
                    <span>{content.byUsingOurService[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.acceptanceDescription[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                    {content.acceptanceDescription[locale]}
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className={`${getSmartFontClass(content.ageRequirement[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                        {content.ageRequirement[locale]}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className={`${getSmartFontClass(content.accountConfidentiality[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                        {content.accountConfidentiality[locale]}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className={`${getSmartFontClass(content.lawfulPurposes[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                        {content.lawfulPurposes[locale]}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className={`${getSmartFontClass(content.unauthorizedAccess[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                        {content.unauthorizedAccess[locale]}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Use of Service */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className={`text-3xl font-bold text-gray-900 text-center mb-12 ${getSmartFontClass(content.useOfService[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                {content.useOfService[locale]}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.permittedUses[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      <CheckCircle className="w-6 h-6 text-gray-700" />
                      <span>{content.permittedUses[locale]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.readingPoetry[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.readingPoetry[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.academicResearch[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.academicResearch[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.personalEnjoyment[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.personalEnjoyment[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.sharingContent[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.sharingContent[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.contributingFeedback[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.contributingFeedback[locale]}
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.prohibitedUses[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      <AlertCircle className="w-6 h-6 text-gray-700" />
                      <span>{content.prohibitedUses[locale]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.commercialUse[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.commercialUse[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.modifyingContent[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.modifyingContent[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.removingAttribution[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.removingAttribution[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.harassment[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.harassment[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.disruptingService[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.disruptingService[locale]}
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </section>

          {/* Intellectual Property */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className={`text-3xl font-bold text-gray-900 text-center mb-12 ${getSmartFontClass(content.intellectualProperty[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                {content.intellectualProperty[locale]}
              </h2>

              <div className="space-y-8">
                <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.contentOwnership[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      <FileText className="w-6 h-6 text-gray-700" />
                      <span>{content.contentOwnership[locale]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.contentOwnershipDesc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                      {content.contentOwnershipDesc[locale]}
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.userContributions[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      <Users className="w-6 h-6 text-gray-700" />
                      <span>{content.userContributions[locale]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.userContributionsDesc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                      {content.userContributionsDesc[locale]}
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.attribution[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      <Globe className="w-6 h-6 text-gray-700" />
                      <span>{content.attribution[locale]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.attributionDesc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                      {content.attributionDesc[locale]}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </section>

          {/* Privacy and Data */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className={`text-3xl font-bold text-gray-900 text-center mb-12 ${getSmartFontClass(content.privacyAndData[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                {content.privacyAndData[locale]}
              </h2>

              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.dataProtection[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <Shield className="w-6 h-6 text-gray-700" />
                    <span>{content.dataProtection[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.dataProtectionDesc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                    {content.dataProtectionDesc[locale]}
                    <Link href="/privacy" className="text-gray-700 hover:text-gray-900 font-semibold ml-1">
                      {content.privacyPolicy[locale]}
                    </Link>.
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className={`${getSmartFontClass(content.minimalData[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                        {content.minimalData[locale]}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className={`${getSmartFontClass(content.noDataSale[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                        {content.noDataSale[locale]}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className={`${getSmartFontClass(content.securityMeasures[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                        {content.securityMeasures[locale]}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className={`${getSmartFontClass(content.dataControl[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                        {content.dataControl[locale]}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Disclaimers */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className={`text-3xl font-bold text-gray-900 text-center mb-12 ${getSmartFontClass(content.disclaimers[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                {content.disclaimers[locale]}
              </h2>

              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8">
                <div className="space-y-8">
                  <div>
                    <h3 className={`text-2xl font-semibold text-gray-900 mb-4 ${getSmartFontClass(content.serviceAvailability[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      {content.serviceAvailability[locale]}
                    </h3>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.serviceAvailabilityDesc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                      {content.serviceAvailabilityDesc[locale]}
                    </p>
                  </div>

                  <div>
                    <h3 className={`text-2xl font-semibold text-gray-900 mb-4 ${getSmartFontClass(content.contentAccuracy[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      {content.contentAccuracy[locale]}
                    </h3>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.contentAccuracyDesc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                      {content.contentAccuracyDesc[locale]}
                    </p>
                  </div>

                  <div>
                    <h3 className={`text-2xl font-semibold text-gray-900 mb-4 ${getSmartFontClass(content.limitationOfLiability[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      {content.limitationOfLiability[locale]}
                    </h3>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.limitationOfLiabilityDesc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                      {content.limitationOfLiabilityDesc[locale]}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* Changes to Terms */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className={`text-3xl font-bold text-gray-900 text-center mb-12 ${getSmartFontClass(content.changesToTerms[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                {content.changesToTerms[locale]}
              </h2>

              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.updatesAndModifications[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <Calendar className="w-6 h-6 text-gray-700" />
                    <span>{content.updatesAndModifications[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.updatesDesc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                    {content.updatesDesc[locale]}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Contact Information */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8">
                <h2 className={`text-3xl font-bold text-gray-900 mb-6 ${getSmartFontClass(content.questionsAboutTerms[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                  {content.questionsAboutTerms[locale]}
                </h2>
                <p className={`text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed ${getSmartFontClass(content.termsQuestionsDesc[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.termsQuestionsDesc[locale]}
                </p>
                <Link href="/contact">
                  <Button className="h-12 px-8 text-base rounded-xl border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200">
                    <Mail className="w-5 h-5 mr-2" />
                    {content.contactUs[locale]}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
} 