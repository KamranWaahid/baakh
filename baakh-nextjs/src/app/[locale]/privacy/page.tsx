"use client";
import { getSmartFontClass } from "@/lib/font-detection-utils";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Users,
  Globe,
  FileText,
  Calendar,
  Mail,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function PrivacyPage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  const locale = isSindhi ? 'sd' : 'en';

  // Multi-lingual content
  const content = {
    // Hero section
    privacy: {
      en: "Privacy",
      sd: "رازداري"
    },
    privacyPolicy: {
      en: "Privacy Policy",
      sd: "رازداري جي پاليسي"
    },
    heroDescription: {
      en: "How we protect and handle your information.",
      sd: "اسان ڪيئن توهان جي معلومات کي محفوظ ۽ سنڀاليندا آهيون"
    },
    
    // Last updated
    lastUpdated: {
      en: "Last updated:",
      sd: "آخري اپڊيٽ:"
    },
    
    // Privacy overview
    yourPrivacyMatters: {
      en: "Your Privacy Matters",
      sd: "توهان جي رازداري اهم آهي"
    },
    privacyOverview: {
      en: "We are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.",
      sd: "اسان توهان جي رازداري کي محفوظ ڪرڻ ۽ توهان جي ذاتي معلومات جي حفاظت کي يقيني بڻائڻ لاءِ پابند آهيون. هي پاليسي بيان ڪري ٿي ته اسان ڪيئن توهان جي ڊيٽا کي جمع ڪري، استعمال ڪري، ۽ محفوظ ڪريون ٿا"
    },
    
    // Privacy principles
    secure: {
      title: {
        en: "Secure",
        sd: "محفوظ"
      },
      desc: {
        en: "Your data is protected with industry‑standard measures.",
        sd: "توهان جو ڊيٽا صنعتي معيار جي اقدامات سان محفوظ آهي"
      }
    },
    transparent: {
      title: {
        en: "Transparent",
        sd: "شفاف"
      },
      desc: {
        en: "Clear information about how we use your data.",
        sd: "توهان جي ڊيٽا کي ڪيئن استعمال ڪريون ٿا ان باري ۾ واضح معلومات"
      }
    },
    private: {
      title: {
        en: "Private",
        sd: "نجي"
      },
      desc: {
        en: "Your personal info is never shared without consent.",
        sd: "توهان جي نجي معلومات کي ڪڏهن به اجازت کان سواءِ شيئر نٿو ڪيو وڃي"
      }
    },
    
    // Information collection
    informationWeCollect: {
      en: "Information We Collect",
      sd: "جنهن معلومات کي اسان جمع ڪريون ٿا"
    },
    personalInformation: {
      en: "Personal Information",
      sd: "ذاتي معلومات"
    },
    technicalInformation: {
      en: "Technical Information",
      sd: "تڪنيڪي معلومات"
    },
    
    // Personal info items
    personalInfoItems: {
      nameEmail: {
        en: "Name and email address (when you contact us)",
        sd: "نالو ۽ اي ميل پتو (جڏهن توهان اسان سان رابطو ڪريو)"
      },
      usageData: {
        en: "Usage data and preferences",
        sd: "استعمال ڪيل ڊيٽا ۽ ترجيحون"
      },
      searchQueries: {
        en: "Search queries and interactions",
        sd: "ڳولھا جون درخواستون ۽ تعامل"
      },
      feedback: {
        en: "Feedback and comments",
        sd: "رايا ۽ تبصرا"
      }
    },
    
    // Technical info items
    technicalInfoItems: {
      ipAddress: {
        en: "IP address and device information",
        sd: "آءِ پي پتو ۽ ڊوائس جي معلومات"
      },
      browserType: {
        en: "Browser type and version",
        sd: "برائوزر جو قسم ۽ ورجن"
      },
      operatingSystem: {
        en: "Operating system",
        sd: "آپريٽنگ سسٽم"
      },
      pagesVisited: {
        en: "Pages visited and time spent",
        sd: "ملندڙ صفحا ۽ گذاريل وقت"
      }
    },
    
    // How we use information
    howWeUseInfo: {
      en: "How We Use Your Information",
      sd: "اسان توهان جي معلومات کي ڪيئن استعمال ڪريون ٿا"
    },
    serviceImprovement: {
      title: {
        en: "Service Improvement",
        sd: "خدمت جي بھتر بناوٽ"
      },
      desc: {
        en: "We use your information to improve our website, add new features, and provide better user experience.",
        sd: "اسان توهان جي معلومات کي اسان جي ويب سائيٽ کي بہتر بنائڻ، نيون خاصيتون شامل ڪرڻ، ۽ بهتر صارف تجربو فراهم ڪرڻ لاءِ استعمال ڪريون ٿا"
      }
    },
    communication: {
      title: {
        en: "Communication",
        sd: "مواصلات"
      },
      desc: {
        en: "To respond to your inquiries, provide support, and send important updates about our service.",
        sd: "توهان جي پڇ ڳڻن جو جواب ڏيڻ، مدد فراهم ڪرڻ، ۽ اسان جي خدمت باري ۾ اهم اپڊيٽس موڪلڻ لاءِ"
      }
    },
    security: {
      title: {
        en: "Security",
        sd: "حفاظت"
      },
      desc: {
        en: "To protect against fraud, abuse, and security threats, and to ensure the integrity of our service.",
        sd: "دغابازي، غلط استعمال، ۽ حفاظتي خطرن کان بچائڻ، ۽ اسان جي خدمت جي سالميت کي يقيني بڻائڻ لاءِ"
      }
    },
    
    // Data protection
    dataProtection: {
      en: "Data Protection",
      sd: "ڊيٽا جي حفاظت"
    },
    securityMeasures: {
      en: "Security Measures",
      sd: "حفاظتي اقدامات"
    },
    yourRights: {
      en: "Your Rights",
      sd: "توهان جا حق"
    },
    
    // Security measures items
    securityItems: {
      sslEncryption: {
        en: "SSL encryption for all data transmission",
        sd: "سڀني ڊيٽا جي ٽرانسميشن لاءِ ايس ايس ايل انڪرپشن"
      },
      securityAudits: {
        en: "Regular security audits and updates",
        sd: "مستقل حفاظتي آڊٽس ۽ اپڊيٽس"
      },
      limitedAccess: {
        en: "Limited access to personal data",
        sd: "ذاتي ڊيٽا تي محدود رسائي"
      },
      dataBackups: {
        en: "Regular data backups and recovery",
        sd: "مستقل ڊيٽا بئڪ اپس ۽ بحالي"
      }
    },
    
    // User rights items
    userRightsItems: {
      accessData: {
        en: "Access your personal data",
        sd: "توهان جي ذاتي ڊيٽا تي رسائي"
      },
      requestCorrection: {
        en: "Request data correction",
        sd: "ڊيٽا جي درستي جي درخواست"
      },
      requestDeletion: {
        en: "Request data deletion",
        sd: "ڊيٽا جي ڊيليشن جي درخواست"
      },
      optOut: {
        en: "Opt-out of communications",
        sd: "مواصلات کان دستبردار ٿيڻ"
      }
    },
    
    // Contact section
    questionsAboutPrivacy: {
      en: "Questions About Privacy?",
      sd: "رازداري باري ۾ سوال؟"
    },
    privacyQuestionsDesc: {
      en: "If you have any questions about this privacy policy or how we handle your data, please don't hesitate to contact us.",
      sd: "جيڪڏهن توهان کي هي رازداري جي پاليسي يا اسان ڪيئن توهان جي ڊيٽا کي سنڀاليندا آهيون ان باري ۾ ڪو سوال آهي ته مهرباني ڪري اسان سان رابطو ڪرڻ ۾ هچڪي نه ڪريو"
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

          {/* Privacy Overview */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className={`text-3xl font-bold text-gray-900 mb-6 ${getSmartFontClass(content.yourPrivacyMatters[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                  {content.yourPrivacyMatters[locale]}
                </h2>
                <p className={`text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed ${getSmartFontClass(content.privacyOverview[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.privacyOverview[locale]}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { 
                    title: content.secure.title[locale], 
                    Icon: Shield, 
                    desc: content.secure.desc[locale] 
                  }, 
                  { 
                    title: content.transparent.title[locale], 
                    Icon: Eye, 
                    desc: content.transparent.desc[locale] 
                  }, 
                  { 
                    title: content.private.title[locale], 
                    Icon: Lock, 
                    desc: content.private.desc[locale] 
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

          {/* Information We Collect */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className={`text-3xl font-bold text-gray-900 text-center mb-12 ${getSmartFontClass(content.informationWeCollect[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                {content.informationWeCollect[locale]}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.personalInformation[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      <Users className="w-6 h-6 text-gray-700" />
                      <span>{content.personalInformation[locale]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.personalInfoItems.nameEmail[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.personalInfoItems.nameEmail[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.personalInfoItems.usageData[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.personalInfoItems.usageData[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.personalInfoItems.searchQueries[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.personalInfoItems.searchQueries[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.personalInfoItems.feedback[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.personalInfoItems.feedback[locale]}
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.technicalInformation[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      <Globe className="w-6 h-6 text-gray-700" />
                      <span>{content.technicalInformation[locale]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.technicalInfoItems.ipAddress[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.technicalInfoItems.ipAddress[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.technicalInfoItems.browserType[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.technicalInfoItems.browserType[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.technicalInfoItems.operatingSystem[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.technicalInfoItems.operatingSystem[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.technicalInfoItems.pagesVisited[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.technicalInfoItems.pagesVisited[locale]}
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </section>

          {/* How We Use Information */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className={`text-3xl font-bold text-gray-900 text-center mb-12 ${getSmartFontClass(content.howWeUseInfo[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                {content.howWeUseInfo[locale]}
              </h2>

              <div className="space-y-8">
                <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.serviceImprovement.title[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      <FileText className="w-6 h-6 text-gray-700" />
                      <span>{content.serviceImprovement.title[locale]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.serviceImprovement.desc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                      {content.serviceImprovement.desc[locale]}
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.communication.title[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      <Mail className="w-6 h-6 text-gray-700" />
                      <span>{content.communication.title[locale]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.communication.desc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                      {content.communication.desc[locale]}
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.security.title[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      <Shield className="w-6 h-6 text-gray-700" />
                      <span>{content.security.title[locale]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.security.desc[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                      {content.security.desc[locale]}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </section>

          {/* Data Protection */}
          <section className="py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className={`text-3xl font-bold text-gray-900 text-center mb-12 ${getSmartFontClass(content.dataProtection[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                {content.dataProtection[locale]}
              </h2>

              <Card className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className={`text-2xl font-semibold text-gray-900 mb-6 ${getSmartFontClass(content.securityMeasures[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      {content.securityMeasures[locale]}
                    </h3>
                    <ul className="space-y-4 text-gray-600">
                      <li className="flex items-start gap-4">
                        <Lock className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.securityItems.sslEncryption[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.securityItems.sslEncryption[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <Shield className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.securityItems.securityAudits[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.securityItems.securityAudits[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <Users className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.securityItems.limitedAccess[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.securityItems.limitedAccess[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <Calendar className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.securityItems.dataBackups[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.securityItems.dataBackups[locale]}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={`text-2xl font-semibold text-gray-900 mb-6 ${getSmartFontClass(content.yourRights[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                      {content.yourRights[locale]}
                    </h3>
                    <ul className="space-y-4 text-gray-600">
                      <li className="flex items-start gap-4">
                        <Eye className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.userRightsItems.accessData[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.userRightsItems.accessData[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <FileText className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.userRightsItems.requestCorrection[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.userRightsItems.requestCorrection[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <Lock className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.userRightsItems.requestDeletion[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.userRightsItems.requestDeletion[locale]}
                        </span>
                      </li>
                      <li className="flex items-start gap-4">
                        <Mail className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className={`${getSmartFontClass(content.userRightsItems.optOut[locale])} ${!isRTL ? 'font-medium' : ''}`}>
                          {content.userRightsItems.optOut[locale]}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
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
                <h2 className={`text-3xl font-bold text-gray-900 mb-6 ${getSmartFontClass(content.questionsAboutPrivacy[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                  {content.questionsAboutPrivacy[locale]}
                </h2>
                <p className={`text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed ${getSmartFontClass(content.privacyQuestionsDesc[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.privacyQuestionsDesc[locale]}
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