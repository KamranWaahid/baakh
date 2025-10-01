'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Mail, MessageSquare, Send, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PageParams {
  params: Promise<{ locale: string }>;
}

export default function SubmitPage() {
  // Temporary redirect to new slug
  if (typeof window !== 'undefined') {
    const isSindhi = window.location.pathname.startsWith('/sd');
    const target = isSindhi ? '/sd/submit-poet-work' : '/en/submit-poet-work';
    if (window.location.pathname !== target) {
      window.location.replace(target);
      return null;
    }
  }
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  const isRTL = isSindhi;
  
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
  const [submitted, setSubmitted] = useState(false);

  const content = {
    title: isSindhi ? 'پنھنجو ڪم داخل ڪرايو' : 'Submit Your Work',
    description: isSindhi 
      ? 'اسان کي پنھنجي شاعري، ڪوپليٽ يا ڪو به ٻيو مواد موڪليو'
      : 'Share your poetry, couplets, or any other content with us',
    name: isSindhi ? 'نالو' : 'Name',
    email: isSindhi ? 'اي ميل' : 'Email',
    type: isSindhi ? 'قسم' : 'Type',
    title_label: isSindhi ? 'عنوان' : 'Title',
    content_label: isSindhi ? 'مواد' : 'Content',
    poet: isSindhi ? 'شاعر' : 'Poet',
    category: isSindhi ? 'قسم' : 'Category',
    submit: isSindhi ? 'موڪليو' : 'Submit',
    submitting: isSindhi ? 'موڪلجي رهيو آهي...' : 'Submitting...',
    success: isSindhi ? 'موڪلجي ويو!' : 'Submitted Successfully!',
    success_message: isSindhi 
      ? 'توهان جو مواد موڪلجي ويو آهي. اسان جلد توهان سان رابطو ڪنداسين.'
      : 'Your content has been submitted. We will contact you soon.',
    contact_us: isSindhi ? 'اسان سان رابطو ڪريو' : 'Contact Us',
    admin_access: isSindhi ? 'اداري وارو رسائ' : 'Admin Access',
    admin_description: isSindhi 
      ? 'جيڪڏهن توهان کي مواد داخل ڪرڻ جي اجازت آهي، توهان اداري پينل استعمال ڪري سگهو ٿا'
      : 'If you have permission to add content, you can use the admin panel',
    go_admin: isSindhi ? 'اداري پينل ۾ وڃو' : 'Go to Admin Panel',
    types: {
      poetry: isSindhi ? 'شاعري' : 'Poetry',
      couplet: isSindhi ? 'ڪوپليٽ' : 'Couplet',
      correction: isSindhi ? 'درستي' : 'Correction',
      suggestion: isSindhi ? 'تجويز' : 'Suggestion',
      other: isSindhi ? 'ٻيو' : 'Other'
    },
    categories: {
      love: isSindhi ? 'محبت' : 'Love',
      nature: isSindhi ? 'فطرت' : 'Nature',
      social: isSindhi ? 'سماجي' : 'Social',
      religious: isSindhi ? 'مذهبي' : 'Religious',
      patriotic: isSindhi ? 'وطن پرستي' : 'Patriotic',
      other: isSindhi ? 'ٻيو' : 'Other'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitted(true);
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h1 className={`text-3xl font-bold text-gray-900 mb-4 ${isSindhi ? 'font-sindhi' : ''}`}>
              {content.success}
            </h1>
            <p className={`text-lg text-gray-600 mb-8 ${isSindhi ? 'font-sindhi' : ''}`}>
              {content.success_message}
            </p>
            <Button asChild className="bg-black hover:bg-gray-800 text-white">
              <Link href={isSindhi ? '/sd' : '/en'}>
                {isSindhi ? 'واپس وڃو' : 'Go Back'}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl font-bold text-gray-900 mb-4 ${isSindhi ? 'font-sindhi' : ''}`}>
            {content.title}
          </h1>
          <p className={`text-xl text-gray-600 ${isSindhi ? 'font-sindhi' : ''}`}>
            {content.description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Submit Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isSindhi ? 'font-sindhi' : ''}`}>
                  <FileText className="h-5 w-5" />
                  {content.title}
                </CardTitle>
                <CardDescription className={isSindhi ? 'font-sindhi' : ''}>
                  {isSindhi ? 'پنھنجو مواد اسان کي موڪليو' : 'Send us your content'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className={isSindhi ? 'font-sindhi' : ''}>
                        {content.name}
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={isSindhi ? 'پنھنجو نالو داخل ڪريو' : 'Enter your name'}
                        className={isSindhi ? 'font-sindhi' : ''}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className={isSindhi ? 'font-sindhi' : ''}>
                        {content.email}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder={isSindhi ? 'اي ميل داخل ڪريو' : 'Enter your email'}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="type" className={isSindhi ? 'font-sindhi' : ''}>
                      {content.type}
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={isSindhi ? 'قسم چونڊيو' : 'Select type'} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(content.types).map(([key, value]) => (
                          <SelectItem key={key} value={key} className={isSindhi ? 'font-sindhi' : ''}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title" className={isSindhi ? 'font-sindhi' : ''}>
                      {content.title_label}
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder={isSindhi ? 'عنوان داخل ڪريو' : 'Enter title'}
                      className={isSindhi ? 'font-sindhi' : ''}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className={isSindhi ? 'font-sindhi' : ''}>
                      {content.content_label}
                    </Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder={isSindhi ? 'مواد داخل ڪريو' : 'Enter your content'}
                      className={`min-h-32 ${isSindhi ? 'font-sindhi' : ''}`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="poet" className={isSindhi ? 'font-sindhi' : ''}>
                        {content.poet}
                      </Label>
                      <Input
                        id="poet"
                        value={formData.poet}
                        onChange={(e) => handleInputChange('poet', e.target.value)}
                        placeholder={isSindhi ? 'شاعر جو نالو' : 'Poet name'}
                        className={isSindhi ? 'font-sindhi' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className={isSindhi ? 'font-sindhi' : ''}>
                        {content.category}
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isSindhi ? 'قسم چونڊيو' : 'Select category'} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(content.categories).map(([key, value]) => (
                            <SelectItem key={key} value={key} className={isSindhi ? 'font-sindhi' : ''}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    disabled={loading}
                  >
                    {loading ? content.submitting : content.submit}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Access Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isSindhi ? 'font-sindhi' : ''}`}>
                  <Users className="h-5 w-5" />
                  {content.admin_access}
                </CardTitle>
                <CardDescription className={isSindhi ? 'font-sindhi' : ''}>
                  {content.admin_description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className={`text-sm text-blue-800 ${isSindhi ? 'font-sindhi' : ''}`}>
                        {isSindhi 
                          ? 'اداري پينل استعمال ڪرڻ لاءِ توهان کي لاگ ان هجڻ گهرجي'
                          : 'You need to be logged in to use the admin panel'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/admin">
                    {content.go_admin}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isSindhi ? 'font-sindhi' : ''}`}>
                  <MessageSquare className="h-5 w-5" />
                  {content.contact_us}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">contact@baakh.com</span>
                  </div>
                  <p className={`text-sm text-gray-600 ${isSindhi ? 'font-sindhi' : ''}`}>
                    {isSindhi 
                      ? 'ڪي به سوال يا تجويزون آهن؟ اسان سان رابطو ڪريو'
                      : 'Have any questions or suggestions? Contact us'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
