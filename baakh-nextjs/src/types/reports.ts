// TypeScript types for Poetry Reports System
// This file contains TypeScript interfaces matching the Supabase database schema

export type ReportCategory = 'common' | 'additional';

export type ReportReason = 
  | 'contentError'
  | 'offensive'
  | 'copyright'
  | 'spam'
  | 'misinformation'
  | 'lowQuality'
  | 'wrongPoet'
  | 'triggering'
  | 'wrongCategory'
  | 'duplicate'
  | 'other';

export type ReportStatus = 
  | 'pending'
  | 'under_review'
  | 'resolved'
  | 'dismissed'
  | 'escalated';

export interface PoetryReport {
  id: string;
  poetry_id: string;
  reporter_id?: string;
  category: ReportCategory;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportStatistics {
  poetry_id: string;
  poetry_slug: string;
  total_reports: number;
  pending_reports: number;
  under_review_reports: number;
  resolved_reports: number;
  dismissed_reports: number;
  content_error_reports: number;
  offensive_reports: number;
  copyright_reports: number;
  spam_reports: number;
  misinformation_reports: number;
  low_quality_reports: number;
  wrong_poet_reports: number;
  triggering_reports: number;
  wrong_category_reports: number;
  duplicate_reports: number;
  other_reports: number;
}

export interface AdminReportView {
  id: string;
  poetry_id: string;
  poetry_slug: string;
  poet_name: string;
  poet_english_name: string;
  category: ReportCategory;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  reporter_email?: string;
  reporter_name?: string;
  resolved_by_email?: string;
  resolved_by_name?: string;
}

export interface ReportReasonTranslation {
  reason_key: ReportReason;
  english_title: string;
  english_description: string;
  sindhi_title: string;
  sindhi_description: string;
}

export interface SubmitReportData {
  poetry_id: string;
  category: ReportCategory;
  reason: ReportReason;
  description?: string;
}

export interface UpdateReportStatusData {
  report_id: string;
  status: ReportStatus;
  admin_notes?: string;
}

export interface ReportFilters {
  status?: ReportStatus;
  reason?: ReportReason;
  limit?: number;
  offset?: number;
}

// Report reason mappings for UI
export const REPORT_REASON_LABELS: Record<ReportReason, { en: string; sd: string }> = {
  contentError: {
    en: 'Content Error – factual/grammatical issues, broken formatting, or wrong attribution',
    sd: 'مواد ۾ غلطي – حقيقتي/گرامر غلطيون، ٽٽل فارميٽ، يا غلط نسبت'
  },
  offensive: {
    en: 'Offensive / Inappropriate Content – hate speech, explicit content, harassment, etc.',
    sd: 'نازيبا / نامناسب مواد – نفرت ڀريو خطاب، غير اخلاقي مواد، يا هراساڻي'
  },
  copyright: {
    en: 'Copyright / Plagiarism – if the poem is stolen or improperly credited',
    sd: 'ڪاپي رائيٽ / چوري ٿيل مواد – جيڪڏهن نظم چوري ٿيل يا غلط طريقي سان منسوب ٿيل هجي'
  },
  spam: {
    en: 'Spam / Irrelevant Content – advertisements, unrelated text, or repeated junk',
    sd: 'اسپام / غير لاڳاپيل مواد – اشتهار، غير لاڳاپيل متن، يا بيڪار ورجايل مواد'
  },
  misinformation: {
    en: 'Misinformation – false claims presented as facts',
    sd: 'غلط ڄاڻ – ڪوڙو دعويٰ جيڪو حقيقت طور پيش ڪيو ويو هجي'
  },
  lowQuality: {
    en: 'Low Quality / Not a Poem – random text, gibberish, or non-poetry content',
    sd: 'گهٽ معيار / نظم نه آهي – بي ترتيب لفظ، بڪواس، يا غير شاعراڻو مواد'
  },
  wrongPoet: {
    en: 'Wrong Poet – poem attributed to the wrong poet',
    sd: 'غلط شاعر – نظم غلط شاعر سان منسوب ٿيل'
  },
  triggering: {
    en: 'Triggering / Sensitive Content – mentions of self-harm, violence, etc.',
    sd: 'حساس / ڏک پهچائيندڙ مواد – خودڪشي، تشدد وغيره جا حوالا'
  },
  wrongCategory: {
    en: 'Wrong Category / Tag – poem placed in the wrong genre',
    sd: 'غلط درجو / ٽيگ – نظم غلط صنف ۾ رکيل'
  },
  duplicate: {
    en: 'Duplicate Entry – already exists on the platform',
    sd: 'ورجايل داخلا – هي نظم اڳ ۾ ئي موجود آهي'
  },
  other: {
    en: 'Other (Free Text) – for anything not covered',
    sd: 'ٻيو (آزاد لکت) – جيڪو مٿي بيان ٿيل ناهي'
  }
};

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, { en: string; sd: string }> = {
  common: {
    en: 'Common Reporting Options',
    sd: 'عام رپورٽ جا اختيار'
  },
  additional: {
    en: 'Additional Options',
    sd: 'اضافي اختيار'
  }
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, { en: string; sd: string }> = {
  pending: {
    en: 'Pending',
    sd: 'انتظار ۾'
  },
  under_review: {
    en: 'Under Review',
    sd: 'جائزو وٺي رهيو'
  },
  resolved: {
    en: 'Resolved',
    sd: 'حل ٿيل'
  },
  dismissed: {
    en: 'Dismissed',
    sd: 'رد ڪيل'
  },
  escalated: {
    en: 'Escalated',
    sd: 'اوچي سطح تي'
  }
};

// Helper function to get reason label by language
export const getReasonLabel = (reason: ReportReason, language: 'en' | 'sd'): string => {
  return REPORT_REASON_LABELS[reason][language];
};

// Helper function to get category label by language
export const getCategoryLabel = (category: ReportCategory, language: 'en' | 'sd'): string => {
  return REPORT_CATEGORY_LABELS[category][language];
};

// Helper function to get status label by language
export const getStatusLabel = (status: ReportStatus, language: 'en' | 'sd'): string => {
  return REPORT_STATUS_LABELS[status][language];
};
