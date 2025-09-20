'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminReports } from '@/hooks/useReports';
import { AdminReportView, ReportStatus, ReportReason } from '@/types/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, MessageSquare, Flag, RefreshCw, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPageHeader from '@/components/ui/AdminPageHeader';

interface ReportsDashboardProps {
  isSindhi?: boolean;
}

export default function ReportsDashboard({ isSindhi = false }: ReportsDashboardProps) {
  const { getReports, updateReportStatus, loading, error } = useAdminReports();
  const [reports, setReports] = useState<AdminReportView[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all');
  const [selectedReason, setSelectedReason] = useState<ReportReason | 'all'>('all');
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Function to detect if text contains Sindhi script
  const containsSindhiScript = (text: string): boolean => {
    if (!text) return false;
    // Check for Sindhi Unicode ranges - more comprehensive
    const sindhiRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u067E\u0686\u0698\u06A9\u06AF\u06BE\u06C1\u06D2]/;
    return sindhiRegex.test(text);
  };

  const statusLabels = {
    pending: isSindhi ? 'انتظار ۾' : 'Pending',
    under_review: isSindhi ? 'جائزو وٺي رهيو' : 'Under Review',
    resolved: isSindhi ? 'حل ٿيل' : 'Resolved',
    dismissed: isSindhi ? 'رد ڪيل' : 'Dismissed',
    escalated: isSindhi ? 'اوچي سطح تي' : 'Escalated'
  };

  const reasonLabels = {
    contentError: isSindhi ? 'مواد ۾ غلطي' : 'Content Error',
    offensive: isSindhi ? 'نامناسب مواد' : 'Offensive Content',
    copyright: isSindhi ? 'ڪاپي رائيٽ' : 'Copyright',
    spam: isSindhi ? 'اسپام' : 'Spam',
    misinformation: isSindhi ? 'غلط ڄاڻ' : 'Misinformation',
    lowQuality: isSindhi ? 'گهٽ معيار' : 'Low Quality',
    wrongPoet: isSindhi ? 'غلط شاعر' : 'Wrong Poet',
    triggering: isSindhi ? 'حساس مواد' : 'Triggering Content',
    wrongCategory: isSindhi ? 'غلط درجو' : 'Wrong Category',
    duplicate: isSindhi ? 'ورجايل' : 'Duplicate',
    other: isSindhi ? 'ٻيو' : 'Other'
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'escalated':
        return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'escalated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const fetchReports = useCallback(async () => {
    try {
      setLocalError(null); // Clear previous errors
      const result = await getReports({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        reason: selectedReason === 'all' ? undefined : selectedReason,
        limit: 50,
        offset: 0
      });

      if (result.success && result.data) {
        setReports(result.data);
      } else {
        console.error('Failed to fetch reports:', result.error);
        setLocalError(result.error || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error in fetchReports:', error);
      setLocalError(error instanceof Error ? error.message : 'Failed to fetch reports');
    }
  }, [getReports, selectedStatus, selectedReason]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusUpdate = async (reportId: string, newStatus: ReportStatus) => {
    setUpdating(reportId);
    
    try {
      const result = await updateReportStatus(
        reportId,
        newStatus,
        adminNotes[reportId] || undefined
      );

      if (result.success) {
        setAdminNotes(prev => ({ ...prev, [reportId]: '' }));
        await fetchReports(); // Refresh the list
      } else {
        console.error('Failed to update status:', result.error);
        setLocalError(result.error || 'Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      setLocalError(error instanceof Error ? error.message : 'Failed to update report status');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isSindhi ? 'sd' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = reports.filter(report => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.poetry_slug.toLowerCase().includes(query) ||
      report.poet_name.toLowerCase().includes(query) ||
      report.poet_english_name.toLowerCase().includes(query) ||
      (report.reporter_name && report.reporter_name.toLowerCase().includes(query)) ||
      (report.reporter_email && report.reporter_email.toLowerCase().includes(query)) ||
      report.description?.toLowerCase().includes(query)
    );
  });

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F9F9]">
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-7 w-56 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={`text-[#6B6B6B] ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                {isSindhi ? 'رپورٽس لوڊ ٿي رهيون...' : 'Loading reports...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }} 
        className="bg-white border-b border-[#E5E5E5] px-6 py-6"
      >
        <div className="max-w-7xl mx-auto">
          <AdminPageHeader
            title={isSindhi ? 'رپورٽس ڊش بورڊ' : 'Reports Dashboard'}
            subtitle={isSindhi ? 'صارف رپورٽس جو جائزو ۽ انتظام' : 'Review and manage user reports'}
            description={isSindhi ? 'شاعري جي رپورٽس کي دیکھو، جائزو وٺو، ۽ حل ڪريو' : 'View, review, and resolve poetry reports from users'}
            action={
              <Button 
                onClick={fetchReports} 
                variant="outline" 
                size="sm"
                className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isSindhi ? 'تازه ڪاري' : 'Refresh'}
              </Button>
            }
            subtitleIcon={<Flag className="w-5 h-5 text-[#EF4444]" />}
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Search */}
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm admin-card mb-8 p-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] w-4 h-4" />
                <input
                  type="text"
                  placeholder={isSindhi ? 'ڳوليو...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-lg focus:border-[#1F1F1F] bg-white"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ReportStatus | 'all')}>
                <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F]">
                  <SelectValue placeholder={isSindhi ? 'حالت' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isSindhi ? 'سڀ' : 'All'}</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Reason Filter */}
            <div className="w-full sm:w-48">
              <Select value={selectedReason} onValueChange={(value) => setSelectedReason(value as ReportReason | 'all')}>
                <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F]">
                  <SelectValue placeholder={isSindhi ? 'سبب' : 'Reason'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isSindhi ? 'سڀ' : 'All'}</SelectItem>
                  {Object.entries(reasonLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {(error || localError) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className={`text-red-700 ${isSindhi ? 'auto-sindhi-font' : ''}`}>{error || localError}</p>
          </motion.div>
        )}

        {/* Reports List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm admin-card">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#1F1F1F]">
                            <span className={isSindhi ? 'auto-sindhi-font' : ''}>{isSindhi ? 'شاعري' : 'Poetry'}</span>: <span className={containsSindhiScript(report.poetry_slug) ? 'auto-sindhi-font' : ''}>{report.poetry_slug}</span>
                          </h3>
                          <Badge className={`${getStatusColor(report.status)} border`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(report.status)}
                              <span className={`text-xs font-medium ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                                {statusLabels[report.status]}
                              </span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-[#6B6B6B] mb-1">
                          <span className={isSindhi ? 'auto-sindhi-font' : ''}>{isSindhi ? 'شاعر' : 'Poet'}</span>: <span className={containsSindhiScript(report.poet_name) ? 'auto-sindhi-font' : ''}>{report.poet_name}</span> ({report.poet_english_name})
                        </p>
                        <p className={`text-sm text-[#9A9A9A] ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? 'رپورٽر' : 'Reporter'}: {report.reporter_name || report.reporter_email}
                        </p>
                      </div>
                      <div className="text-right text-sm text-[#6B6B6B]">
                        <p>{formatDate(report.created_at)}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="h-4 w-4 text-[#6B6B6B]" />
                        <span className={`font-medium text-[#1F1F1F] ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? 'رپورٽ جو سبب' : 'Report Reason'}: {reasonLabels[report.reason]}
                        </span>
                      </div>
                      {report.description && (
                        <p className={`text-sm text-[#6B6B6B] bg-[#F4F4F5] p-4 rounded-lg ${containsSindhiScript(report.description) ? 'auto-sindhi-font' : ''}`}>
                          {report.description}
                        </p>
                      )}
                    </div>

                    {report.admin_notes && (
                      <div className="mb-6">
                        <p className={`text-sm font-medium text-[#1F1F1F] mb-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? 'ايڊمن نوٽس' : 'Admin Notes'}:
                        </p>
                        <p className={`text-sm text-[#6B6B6B] bg-blue-50 p-4 rounded-lg border border-blue-200 ${containsSindhiScript(report.admin_notes) ? 'auto-sindhi-font' : ''}`}>
                          {report.admin_notes}
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 text-[#1F1F1F] ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                          {isSindhi ? 'ايڊمن نوٽس شامل ڪريو' : 'Add Admin Notes'}
                        </label>
                        <Textarea
                          value={adminNotes[report.id] || ''}
                          onChange={(e) => setAdminNotes(prev => ({ ...prev, [report.id]: e.target.value }))}
                          placeholder={isSindhi ? 'نوٽس لکيو...' : 'Add notes...'}
                          className="min-h-[80px] border-[#E5E5E5] focus:border-[#1F1F1F]"
                        />
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {report.status !== 'resolved' && (
                          <Button
                            onClick={() => handleStatusUpdate(report.id, 'resolved')}
                            disabled={updating === report.id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {updating === report.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : null}
                            {isSindhi ? 'حل ڪريو' : 'Resolve'}
                          </Button>
                        )}
                        
                        {report.status !== 'dismissed' && (
                          <Button
                            onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                            disabled={updating === report.id}
                            size="sm"
                            variant="destructive"
                          >
                            {isSindhi ? 'رد ڪريو' : 'Dismiss'}
                          </Button>
                        )}
                        
                        {report.status !== 'under_review' && (
                          <Button
                            onClick={() => handleStatusUpdate(report.id, 'under_review')}
                            disabled={updating === report.id}
                            size="sm"
                            variant="outline"
                            className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5]"
                          >
                            {isSindhi ? 'جائزو وٺو' : 'Review'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredReports.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm admin-card">
                <CardContent className="p-12 text-center">
                  <Flag className="w-12 h-12 mx-auto mb-4 text-[#E5E5E5]" />
                  <p className={`text-[#6B6B6B] text-lg ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isSindhi ? 'ڪو رپورٽ نه ملي' : 'No reports found'}
                  </p>
                  <p className={`text-sm text-[#9A9A9A] mt-2 ${isSindhi ? 'auto-sindhi-font' : ''}`}>
                    {isSindhi ? 'فلٽر تبديل ڪريو يا نئين رپورٽس جو انتظار ڪريو' : 'Try adjusting your filters or wait for new reports'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
