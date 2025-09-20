'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Clock, Eye, Edit, Trash2, Filter, Search, Plus, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Report {
  report_id: string;
  poetry_id: number;
  poetry_slug: string;
  poet_name: string;
  poet_english_name: string;
  category: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  admin_notes: string;
  created_at: string;
  updated_at: string;
  resolved_at: string;
  reporter_email: string;
  reporter_name: string;
  resolved_by_email: string;
  resolved_by_name: string;
}

export default function AdminReportsPage() {
  const pathname = usePathname();
  const isSindhi = pathname?.startsWith('/sd');
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (reasonFilter !== 'all') params.append('reason', reasonFilter);
      params.append('limit', '50');
      
      const response = await fetch(`/api/admin/reports?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.data);
      } else {
        setError(data.error || 'Failed to fetch reports');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Update report status
  const updateReportStatus = async (reportId: string, status: string, notes: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          admin_notes: notes,
        }),
      });

      if (response.ok) {
        await fetchReports(); // Refresh the list
        setIsDialogOpen(false);
        setSelectedReport(null);
        setAdminNotes('');
        setNewStatus('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report');
    }
  };

  // Delete report
  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchReports(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, reasonFilter]);

  // Filter reports based on search term
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.poetry_slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.poet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.poet_english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'dismissed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'dismissed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9]">
          <AdminPageHeader
            title={isSindhi ? 'رپورٽس' : 'Reports Management'}
            subtitle="Content Moderation"
            subtitleIcon={<Shield className="w-4 h-4" />}
            description={isSindhi ? 'شاعري جي رپورٽس جو انتظام' : 'Manage poetry reports and moderation'}
          />
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        <AdminPageHeader
          title={isSindhi ? 'رپورٽس' : 'Reports Management'}
          subtitle="Content Moderation"
          subtitleIcon={<Shield className="w-4 h-4" />}
          description={isSindhi ? 'شاعري جي رپورٽس جو انتظام' : 'Manage poetry reports and moderation'}
          action={
            <Button onClick={fetchReports} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {isSindhi ? 'نئون' : 'Refresh'}
            </Button>
          }
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <Card className="admin-card mb-8">
            <CardHeader className="px-8 pt-8 pb-6">
              <CardTitle className="flex items-center gap-2 text-[#1F1F1F]">
                <Filter className="h-5 w-5" />
                {isSindhi ? 'فلٽر' : 'Filters'}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9A9A9A] h-4 w-4" />
                  <Input
                    placeholder={isSindhi ? 'ڳوليو...' : 'Search...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                    <SelectValue placeholder={isSindhi ? 'حالت چونڊيو' : 'Select Status'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isSindhi ? 'سڀ' : 'All'}</SelectItem>
                    <SelectItem value="pending">{isSindhi ? 'انتظار ۾' : 'Pending'}</SelectItem>
                    <SelectItem value="resolved">{isSindhi ? 'حل ٿيل' : 'Resolved'}</SelectItem>
                    <SelectItem value="dismissed">{isSindhi ? 'رد ڪيل' : 'Dismissed'}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={reasonFilter} onValueChange={setReasonFilter}>
                  <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                    <SelectValue placeholder={isSindhi ? 'سبب چونڊيو' : 'Select Reason'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isSindhi ? 'سڀ' : 'All'}</SelectItem>
                    <SelectItem value="inappropriate">{isSindhi ? 'نامناسب' : 'Inappropriate'}</SelectItem>
                    <SelectItem value="spam">{isSindhi ? 'اسپام' : 'Spam'}</SelectItem>
                    <SelectItem value="copyright">{isSindhi ? 'ڪاپي رائيٽ' : 'Copyright'}</SelectItem>
                    <SelectItem value="other">{isSindhi ? 'ٻيو' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setReasonFilter('all');
                  }}
                  className="border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5]"
                >
                  {isSindhi ? 'صاف ڪريو' : 'Clear'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#F8F8F8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-[#9A9A9A]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                  {isSindhi ? 'ڪو رپورٽ ناهي ملي' : 'No reports found'}
                </h3>
                <p className="text-[#6B6B6B] max-w-md mx-auto">
                  {isSindhi ? 'ڳوليندڙ معيارن سان ڪو رپورٽ ناهي ملي' : 'No reports match your search criteria'}
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.report_id} className="group bg-white border border-[#F0F0F0] rounded-2xl hover:border-[#E0E0E0] hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        {/* Status and Category Row */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            {isSindhi ? 
                              (report.status === 'pending' ? 'انتظار ۾' : 
                               report.status === 'resolved' ? 'حل ٿيل' : 'رد ڪيل') :
                              report.status.charAt(0).toUpperCase() + report.status.slice(1)
                            }
                          </div>
                          <span className="text-xs text-[#8B8B8B] bg-[#F8F8F8] px-2 py-1 rounded-md font-medium">
                            {report.category}
                          </span>
                          <span className="text-xs text-[#8B8B8B] bg-[#F8F8F8] px-2 py-1 rounded-md font-medium">
                            {report.reason}
                          </span>
                        </div>
                        
                        {/* Poetry Title */}
                        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1 line-clamp-1">
                          <span className="font-sindhi">{report.poetry_slug}</span>
                        </h3>
                        
                        {/* Poet Name */}
                        <p className="text-sm text-[#6B6B6B] mb-3">
                          <span className="font-sindhi">{report.poet_name}</span>
                          {report.poet_english_name && (
                            <span className="text-[#9A9A9A] ml-1">({report.poet_english_name})</span>
                          )}
                        </p>
                        
                        {/* Description */}
                        <p className="text-sm text-[#6B6B6B] line-clamp-2 mb-4">
                          {report.description}
                        </p>
                        
                        {/* Admin Notes (if exists) */}
                        {report.admin_notes && (
                          <div className="bg-[#FAFAFA] border border-[#F0F0F0] rounded-lg p-4 mb-6">
                            <p className="text-xs font-medium text-[#8B8B8B] mb-2">
                              {isSindhi ? 'ايڊمن نوٽس' : 'Admin Notes'}
                            </p>
                            <p className="text-sm text-[#6B6B6B]">{report.admin_notes}</p>
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        <div className="text-xs text-[#9A9A9A]">
                          {isSindhi ? 'تخليق' : 'Created'}: {new Date(report.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setAdminNotes(report.admin_notes || '');
                            setNewStatus(report.status);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-[#F5F5F5] text-[#6B6B6B] hover:text-[#1A1A1A]"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReport(report.report_id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 text-[#6B6B6B] hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Update Report Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#1F1F1F]">
                {isSindhi ? 'رپورٽ اپڊيٽ ڪريو' : 'Update Report'}
              </DialogTitle>
              <DialogDescription className="text-[#6B6B6B]">
                {isSindhi ? 'رپورٽ جي حالت ۽ نوٽس تبديل ڪريو' : 'Change the report status and add admin notes'}
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-[#1F1F1F]">
                    {isSindhi ? 'شاعري' : 'Poetry'}
                  </Label>
                  <p className="text-sm text-[#6B6B6B] mt-1">
                    <span className="font-sindhi">{selectedReport.poetry_slug}</span> - 
                    <span className="font-sindhi">{selectedReport.poet_name}</span>
                  </p>
                </div>
                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-[#1F1F1F]">{isSindhi ? 'حالت' : 'Status'}</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{isSindhi ? 'انتظار ۾' : 'Pending'}</SelectItem>
                      <SelectItem value="resolved">{isSindhi ? 'حل ٿيل' : 'Resolved'}</SelectItem>
                      <SelectItem value="dismissed">{isSindhi ? 'رد ڪيل' : 'Dismissed'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-[#1F1F1F]">{isSindhi ? 'ايڊمن نوٽس' : 'Admin Notes'}</Label>
                  <Textarea
                    id="notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={isSindhi ? 'نوٽس شامل ڪريو...' : 'Add notes...'}
                    rows={4}
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5]"
              >
                {isSindhi ? 'منسوخ' : 'Cancel'}
              </Button>
              <Button 
                onClick={() => selectedReport && updateReportStatus(selectedReport.report_id, newStatus, adminNotes)}
                className="bg-[#1F1F1F] text-white hover:bg-[#1F1F1F]/90"
              >
                {isSindhi ? 'محفوظ ڪريو' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
