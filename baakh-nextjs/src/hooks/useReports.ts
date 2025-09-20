import { useState, useCallback } from 'react';
import { SubmitReportData, ReportStatistics, AdminReportView, ReportFilters } from '@/types/reports';

interface UseReportsReturn {
  submitReport: (data: SubmitReportData) => Promise<{ success: boolean; error?: string; reportId?: string }>;
  getReportStatistics: (poetryId?: string) => Promise<{ success: boolean; data?: ReportStatistics[]; error?: string }>;
  loading: boolean;
  error: string | null;
}

export const useReports = (): UseReportsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReport = useCallback(async (data: SubmitReportData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reports/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send authentication cookies
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit report');
      }

      return {
        success: true,
        reportId: result.report_id
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getReportStatistics = useCallback(async (poetryId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = poetryId 
        ? `/api/reports/statistics?poetry_id=${poetryId}`
        : '/api/reports/statistics';

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Send authentication cookies
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch report statistics');
      }

      return {
        success: true,
        data: result.data
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    submitReport,
    getReportStatistics,
    loading,
    error
  };
};

// Admin hook for managing reports
interface UseAdminReportsReturn {
  getReports: (filters?: ReportFilters) => Promise<{ success: boolean; data?: AdminReportView[]; error?: string }>;
  updateReportStatus: (reportId: string, status: string, adminNotes?: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  error: string | null;
}

export const useAdminReports = (): UseAdminReportsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReports = useCallback(async (filters?: ReportFilters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.reason) params.append('reason', filters.reason);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        method: 'GET',
        credentials: 'include', // Send authentication cookies
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch reports');
      }

      return {
        success: true,
        data: result.data
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReportStatus = useCallback(async (reportId: string, status: string, adminNotes?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send authentication cookies
        body: JSON.stringify({
          report_id: reportId,
          status,
          admin_notes: adminNotes
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update report status');
      }

      return {
        success: true
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getReports,
    updateReportStatus,
    loading,
    error
  };
};
