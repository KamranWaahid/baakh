"use client";
import { getSmartFontClass } from "@/lib/font-detection-utils";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail,
  MessageSquare,
  Send,
  Users,
  Globe,
  Clock,
  ArrowRight
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ContactPage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  const locale = isSindhi ? 'sd' : 'en';

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  // Multi-lingual content
  const content = {
    // Hero section
    contact: {
      en: "Contact",
      sd: "رابطو ڪريو"
    },
    getInTouch: {
      en: "Get in touch",
      sd: "اسان سان جڙيا رھو"
    },
    heroDescription: {
      en: "Academic questions, contributions, or feedback — we'd love to hear from you.",
      sd: "تعليمي سوال، تعاون، يا فيڊبئڪ — اسان کي توهان کان ٻڌڻ ۾ خوشي ٿيندي"
    },
    
    // Form section
    sendMessage: {
      en: "Send us a message",
      sd: "اسان کي پيغام موڪليو"
    },
    thanksMessage: {
      en: "Thanks! Your message was sent.",
      sd: "شڪريا! توهان جو پيغام موڪليو ويو"
    },
    
    // Form fields
    name: {
      en: "Name",
      sd: "نالو"
    },
    email: {
      en: "Email",
      sd: "اي ميل"
    },
    subject: {
      en: "Subject",
      sd: "موضوع"
    },
    message: {
      en: "Message",
      sd: "پيغام"
    },
    
    // Placeholders
    namePlaceholder: {
      en: "Your name",
      sd: "توهان جو نالو"
    },
    emailPlaceholder: {
      en: "your.email@example.com",
      sd: "your.email@example.com"
    },
    subjectPlaceholder: {
      en: "What's this about?",
      sd: "هي ڇا باري ۾ آهي؟"
    },
    messagePlaceholder: {
      en: "Tell us more...",
      sd: "اسان کي وڌيڪ ٻڌايو..."
    },
    
    // Submit button
    sendMessageButton: {
      en: "Send Message",
      sd: "پيغام موڪليو"
    },
    
    // Contact info section
    contactInfoTitle: {
      en: "Get in touch",
      sd: "رابطو ڪريو"
    },
    contactInfoDescription: {
      en: "Questions, corrections, or collaborations — write to us.",
      sd: "سوال، درستي، يا تعاون — اسان کي لکيو"
    },
    
    // Contact methods
    contactEmail: {
      en: "Email",
      sd: "اي ميل"
    },
    website: {
      en: "Website",
      sd: "ويب سائيٽ"
    },
    responseTime: {
      en: "Response time",
      sd: "جواب جو وقت"
    },
    
    // FAQ section
    faqTitle: {
      en: "Frequently Asked Questions",
      sd: "عام پڇيا ويندڙ سوال"
    },
    
    // FAQ items
    contributeContent: {
      question: {
        en: "How can I contribute content?",
        sd: "مون ڪيئن مواد جو تعاون ڪري سگهان ٿو؟"
      },
      answer: {
        en: "We welcome contributions from scholars and poetry enthusiasts. Please email us with your proposal.",
        sd: "اسان عالم ۽ شاعريءَ جي شوقين کان تعاون کي خوش آمديد چوندا آهيون. مهرباني ڪري اسان کي پنهنجي تجويز سان اي ميل ڪريو"
      }
    },
    useForResearch: {
      question: {
        en: "Can I use content for research?",
        sd: "ڇا مان تحقيق لاءِ مواد استعمال ڪري سگهان ٿو؟"
      },
      answer: {
        en: "Yes, all content is available for academic and research purposes with proper attribution.",
        sd: "ها، سڀ مواد علمي ۽ تحقيق مقصدن لاءِ مناسب حوالو سان دستياب آهي"
      }
    },
    translationAccuracy: {
      question: {
        en: "How accurate are the translations?",
        sd: "ترجمي ڪيترا درست آهن؟"
      },
      answer: {
        en: "All translations are verified by experts in Sindhi literature and poetry.",
        sd: "سڀ ترجمي سنڌي ادب ۽ شاعريءَ جا ماهر ماڻهو تصديق ڪندا آهن"
      }
    }
  };

  // Apply Sindhi font only if text contains Arabic/Sindhi characters
  // const sd = (text?: string | null) => (text && /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text) ? 'auto-sindhi-font' : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        })
      });
      if (!res.ok) {
        return;
      }
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(true);
      // Clear existing timeout
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
      submitTimeoutRef.current = setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      // silent fail
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
                <MessageSquare className="h-4 w-4 text-gray-600" />
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                  {content.contact[locale]}
                </Badge>
              </div>
              
              <h1 className={`text-5xl md:text-6xl font-bold tracking-tight text-gray-900 ${isRTL ? 'auto-sindhi-font' : 'font-extrabold'}`}>
                {content.getInTouch[locale]}
              </h1>
              
              <p className={`text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${getSmartFontClass(content.heroDescription[locale])} ${!isRTL ? 'font-light' : ''}`}>
                {content.heroDescription[locale]}
              </p>
            </motion.div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <CardHeader className="px-8 pt-8 pb-4">
                  <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${getSmartFontClass(content.sendMessage[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    <MessageSquare className="w-6 h-6 text-gray-700" />
                    <span>{content.sendMessage[locale]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 px-8 pb-8">
                  {submitted && (
                    <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
                      <p className={`text-sm font-medium ${getSmartFontClass(content.thanksMessage[locale])}`}>
                        {content.thanksMessage[locale]}
                      </p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className={`block text-sm font-medium text-gray-700 mb-3 ${getSmartFontClass(content.name[locale])} ${!isRTL ? 'font-semibold' : ''}`}>
                          {content.name[locale]}
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <Users className="w-4 h-4" />
                          </span>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={content.namePlaceholder[locale]}
                            className="h-12 pl-10 rounded-xl border border-gray-200 bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-3 ${getSmartFontClass(content.contactEmail[locale])} ${!isRTL ? 'font-semibold' : ''}`}>
                          {content.contactEmail[locale]}
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <Mail className="w-4 h-4" />
                          </span>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={content.emailPlaceholder[locale]}
                            className="h-12 pl-10 rounded-xl border border-gray-200 bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className={`block text-sm font-medium text-gray-700 mb-3 ${getSmartFontClass(content.subject[locale])} ${!isRTL ? 'font-semibold' : ''}`}>
                        {content.subject[locale]}
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          <MessageSquare className="w-4 h-4" />
                        </span>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder={content.subjectPlaceholder[locale]}
                          className="h-12 pl-10 rounded-xl border border-gray-200 bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className={`block text-sm font-medium text-gray-700 mb-3 ${getSmartFontClass(content.message[locale])} ${!isRTL ? 'font-semibold' : ''}`}>
                        {content.message[locale]}
                      </label>
                      <div className="relative">
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder={content.messagePlaceholder[locale]}
                          rows={6}
                          className="rounded-xl border border-gray-200 bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200 resize-none"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      {content.sendMessageButton[locale]}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className={`text-3xl font-bold text-gray-900 mb-4 ${getSmartFontClass(content.contactInfoTitle[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                  {content.contactInfoTitle[locale]}
                </h2>
                <p className={`text-lg text-gray-600 mb-8 leading-relaxed ${getSmartFontClass(content.contactInfoDescription[locale])} ${!isRTL ? 'font-light' : ''}`}>
                  {content.contactInfoDescription[locale]}
                </p>
              </div>

              <div className="space-y-6">
                <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <CardContent className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-gray-900 mb-1 ${getSmartFontClass(content.contactEmail[locale])} ${!isRTL ? 'font-bold' : ''}`}>
                          {content.contactEmail[locale]}
                        </h3>
                        <p className="text-gray-600 font-medium">contact@baakh.com</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <CardContent className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-gray-900 mb-1 ${getSmartFontClass(content.website[locale])} ${!isRTL ? 'font-bold' : ''}`}>
                          {content.website[locale]}
                        </h3>
                        <p className="text-gray-600 font-medium">www.baakh.com</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <CardContent className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-gray-900 mb-1 ${getSmartFontClass(content.responseTime[locale])} ${!isRTL ? 'font-bold' : ''}`}>
                          {content.responseTime[locale]}
                        </h3>
                        <p className="text-gray-600 font-medium">Within 24 hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Section */}
              <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm mb-16">
                <CardHeader className="px-6 pt-8 pb-4">
                  <CardTitle className={`text-xl font-semibold ${getSmartFontClass(content.faqTitle[locale])} ${!isRTL ? 'font-bold tracking-tight' : ''}`}>
                    {content.faqTitle[locale]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pb-6 md:pb-8">
                  <div>
                    <h4 className={`font-semibold text-gray-900 mb-3 ${getSmartFontClass(content.contributeContent.question[locale])} ${!isRTL ? 'font-bold' : ''}`}>
                      {content.contributeContent.question[locale]}
                    </h4>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.contributeContent.answer[locale])} ${!isRTL ? 'font-normal' : ''}`}>
                      {content.contributeContent.answer[locale]}
                    </p>
                  </div>
                  <div>
                    <h4 className={`font-semibold text-gray-900 mb-3 ${getSmartFontClass(content.useForResearch.question[locale])} ${!isRTL ? 'font-bold' : ''}`}>
                      {content.useForResearch.question[locale]}
                    </h4>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.useForResearch.answer[locale])} ${!isRTL ? 'font-normal' : ''}`}>
                      {content.useForResearch.answer[locale]}
                    </p>
                  </div>
                  <div>
                    <h4 className={`font-semibold text-gray-900 mb-3 ${getSmartFontClass(content.translationAccuracy.question[locale])} ${!isRTL ? 'font-bold' : ''}`}>
                      {content.translationAccuracy.question[locale]}
                    </h4>
                    <p className={`text-gray-600 leading-relaxed ${getSmartFontClass(content.translationAccuracy.answer[locale])} ${!isRTL ? 'font-normal' : ''}`}>
                      {content.translationAccuracy.answer[locale]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
} 