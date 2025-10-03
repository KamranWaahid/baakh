'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Send } from 'lucide-react';

export default function SubmitPoetWorkPage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    title: '',
    content: '',
    poet: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; slug: string; title: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const t = {
    title: isSindhi ? 'پنھنجو يا ڪنھن شاعر ڪم داخل ڪرايو' : 'Submit Your or Any Poet Work',
    subtitle: isSindhi ? 'سادو فارم ڀري موڪليو' : 'Fill the simple form to submit',
    name: isSindhi ? 'نالو' : 'Name',
    email: isSindhi ? 'اي ميل' : 'Email',
    type: isSindhi ? 'قسم' : 'Type',
    title_label: isSindhi ? 'عنوان' : 'Title',
    content_label: isSindhi ? 'مواد' : 'Content',
    poet: isSindhi ? 'شاعر' : 'Poet',
    category: isSindhi ? 'صنف' : 'Category',
    submit: isSindhi ? 'موڪليو' : 'Submit',
    submitting: isSindhi ? 'موڪلجي رهيو آهي...' : 'Submitting...',
    success: isSindhi ? 'پيغام موڪليو ويو!' : 'Submitted',
    success_message: isSindhi ? 'اسان جلد توهان سان رابطو ڪنداسين.' : 'We will contact you soon.',
    back: isSindhi ? 'واپس وڃو' : 'Go Home',
  };

  // Allow Sindhi/Arabic script, common whitespace and punctuation; disallow Latin letters
  const SINDHI_REGEX = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/; // must contain
  const HAS_LATIN_REGEX = /[A-Za-z]/;
  const sanitizeSindhi = (value: string) => value;

  const validateSindhi = (value: string) => {
    if (!value || !SINDHI_REGEX.test(value)) return 'Please write in Sindhi.';
    if (HAS_LATIN_REGEX.test(value)) return 'English letters are not allowed. Use Sindhi script only.';
    return null;
  };

  const onChange = (key: string, value: string) => {
    if (key === 'content') {
      const sanitized = sanitizeSindhi(value);
      setFormData((p) => ({ ...p, content: sanitized }));
      setContentError(validateSindhi(sanitized));
      return;
    }
    setFormData((p) => ({ ...p, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    const err = validateSindhi(formData.content);
    setContentError(err);
    if (err) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/submissions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitter_name: formData.name,
          submitter_email: formData.email,
          submission_type: formData.type || 'poetry',
          title: formData.title,
          content: formData.content,
          poet_name: formData.poet || null,
          category_slug: formData.category || null,
          lang: 'sd',
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({} as any));
        setSubmitError(json?.error || (isSindhi ? 'درخواست ناڪام ٿي' : 'Submission failed'));
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API (localized)
  useEffect(() => {
    const controller = new AbortController();
    const lang = isSindhi ? 'sd' : 'en';
    (async () => {
      try {
        setCategoriesLoading(true);
        const res = await fetch(`/api/categories/?lang=${lang}&all=true`, { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const items = Array.isArray(json?.items) ? json.items : [];
        const mapped = items.map((it: any) => ({
          id: String(it.id || it.slug || ''),
          slug: String(it.slug || ''),
          title: String(isSindhi ? (it.sindhiName || it.englishName || it.slug) : (it.englishName || it.sindhiName || it.slug))
        }));
        setCategories(mapped);
      } catch (err) {
        // silent fail
      } finally {
        setCategoriesLoading(false);
      }
    })();
    return () => controller.abort();
  }, [isSindhi]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-white py-16 px-6">
        <AnimatePresence>
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative max-w-2xl mx-auto text-center"
          >
            {/* Subtle success pulses */}
            <div className="relative flex items-center justify-center mb-8">
              <motion.div
                aria-hidden
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.25, scale: 1.25 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute w-24 h-24 rounded-full bg-gray-100"
              />
              <motion.div
                aria-hidden
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.35, scale: 1.6 }}
                transition={{ duration: 1.1, ease: 'easeOut', delay: 0.05 }}
                className="absolute w-24 h-24 rounded-full bg-gray-100"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-gray-200 bg-white relative"
              >
                <Send className="h-6 w-6 text-gray-900" />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className={`text-2xl text-gray-900 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}
            >
              {t.success}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 }}
              className={`text-base text-gray-600 mb-8 ${isSindhi ? 'auto-sindhi-font' : ''}`}
            >
              {t.success_message}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.18 }}
            >
              <Button asChild variant="outline" className="h-11 px-6 rounded-xl border border-gray-200 bg-white text-gray-900 hover:bg-gray-50">
                <Link href={isSindhi ? '/sd' : '/en'}>{t.back}</Link>
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-10">
          <h1 className={`text-[28px] leading-tight text-gray-900 mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>{t.title}</h1>
          <p className={`text-[15px] text-gray-600 ${isSindhi ? 'auto-sindhi-font' : ''}`}>{t.subtitle}</p>
        </motion.div>

        <motion.form onSubmit={onSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-[13px] text-gray-700">{t.name}</Label>
              <Input id="name" autoComplete="name" value={formData.name} onChange={(e) => onChange('name', e.target.value)} onInput={(e) => onChange('name', (e.target as HTMLInputElement).value)} placeholder={isSindhi ? 'نالو' : 'Your name'} className="h-11 rounded-xl border border-gray-200 bg-white focus:bg-white" required />
            </div>
            <div>
              <Label htmlFor="email" className="text-[13px] text-gray-700">{t.email}</Label>
              <Input id="email" type="email" autoComplete="email" value={formData.email} onChange={(e) => onChange('email', e.target.value)} onInput={(e) => onChange('email', (e.target as HTMLInputElement).value)} placeholder={isSindhi ? 'اي ميل' : 'name@email.com'} className="h-11 rounded-xl border border-gray-200 bg-white focus:bg-white" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-[13px] text-gray-700">{t.type}</Label>
              <Select value={formData.type} onValueChange={(v) => onChange('type', v)}>
                <SelectTrigger className="h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 focus:bg-white data-[state=open]:bg-white px-3 text-[14px] data-[placeholder]:text-gray-400 focus:border-gray-300 focus:ring-0 focus-visible:ring-0 outline-none focus:outline-none">
                  <SelectValue placeholder={isSindhi ? 'قسم' : 'Select type'} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg p-1">
                  <SelectItem value="poetry" className="rounded-md px-3 py-2 text-[14px] hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-none focus:ring-0 data-[state=checked]:bg-gray-100 transition-colors">{isSindhi ? 'شاعري' : 'Poetry'}</SelectItem>
                  <SelectItem value="couplet" className="rounded-md px-3 py-2 text-[14px] hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-none focus:ring-0 data-[state=checked]:bg-gray-100 transition-colors">{isSindhi ? 'ڪوپليٽ' : 'Couplet'}</SelectItem>
                  <SelectItem value="correction" className="rounded-md px-3 py-2 text-[14px] hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-none focus:ring-0 data-[state=checked]:bg-gray-100 transition-colors">{isSindhi ? 'درستي' : 'Correction'}</SelectItem>
                  <SelectItem value="suggestion" className="rounded-md px-3 py-2 text-[14px] hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-none focus:ring-0 data-[state=checked]:bg-gray-100 transition-colors">{isSindhi ? 'تجويز' : 'Suggestion'}</SelectItem>
                  <SelectItem value="other" className="rounded-md px-3 py-2 text-[14px] hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-none focus:ring-0 data-[state=checked]:bg-gray-100 transition-colors">{isSindhi ? 'ٻيو' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category" className="text-[13px] text-gray-700">{t.category}</Label>
              <Select value={formData.category} onValueChange={(v) => onChange('category', v)}>
                <SelectTrigger className="h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 focus:bg-white data-[state=open]:bg-white px-3 text-[14px] data-[placeholder]:text-gray-400 focus:border-gray-300 focus:ring-0 focus-visible:ring-0 outline-none focus:outline-none">
                  <SelectValue placeholder={isSindhi ? 'قسم' : 'Select category'} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg p-1 max-h-64 overflow-auto">
                  {categoriesLoading ? (
                    <div className="space-y-1 p-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 rounded-md bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug} className="rounded-md px-3 py-2 text-[14px] hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:outline-none focus:ring-0 data-[state=checked]:bg-gray-100 transition-colors">{c.title}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="poet" className="text-[13px] text-gray-700">{t.poet}</Label>
            <Input id="poet" autoComplete="organization" value={formData.poet} onChange={(e) => onChange('poet', e.target.value)} onInput={(e) => onChange('poet', (e.target as HTMLInputElement).value)} placeholder={isSindhi ? 'شاعر' : 'Poet name'} className="h-11 rounded-xl border border-gray-200 bg-white focus:bg-white" />
          </div>

          <div>
            <Label htmlFor="title" className="text-[13px] text-gray-700">{t.title_label}</Label>
            <Input id="title" autoComplete="off" value={formData.title} onChange={(e) => onChange('title', e.target.value)} onInput={(e) => onChange('title', (e.target as HTMLInputElement).value)} placeholder={isSindhi ? 'عنوان' : 'Title'} className="h-11 rounded-xl border border-gray-200 bg-white focus:bg-white" required />
          </div>

          <div>
            <Label htmlFor="content" className="text-[13px] text-gray-700">{t.content_label}</Label>
            <Textarea
              id="content"
              lang="sd"
              dir="rtl"
              value={formData.content}
              autoComplete="off"
              onChange={(e) => onChange('content', e.target.value)}
              onInput={(e) => onChange('content', (e.target as HTMLTextAreaElement).value)}
              placeholder={isSindhi ? 'مواد سنڌي ۾' : 'Write content in Sindhi'}
              className={`rounded-xl border ${contentError ? 'border-red-300' : 'border-gray-200'} bg-white focus:bg-white min-h-32 auto-sindhi-font sindhi-text`}
              aria-invalid={!!contentError}
              required
            />
            {contentError && (
              <p className="mt-2 text-sm text-red-600">{contentError}</p>
            )}
          </div>

          <Button type="submit" disabled={loading || !!contentError} className="w-full h-11 rounded-xl border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed">
            <FileText className="h-4 w-4 mr-2" />
            {loading ? t.submitting : t.submit}
          </Button>
          {submitError && !contentError && (
            <p className="mt-2 text-sm text-red-600">{submitError}</p>
          )}
        </motion.form>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="h-11 px-6 rounded-xl border border-gray-200 bg-white text-gray-900 hover:bg-gray-50">
            <Link href={isSindhi ? '/sd' : '/en'}>← {isSindhi ? 'واپس' : 'Back'}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
