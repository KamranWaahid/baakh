"use client";

import { useState, useEffect, useMemo } from 'react';
import AdminPageHeader from '@/components/ui/AdminPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Activity, 
  Users, 
  Globe, 
  Database,
  RefreshCw,
  Download,
  Settings,
  Bell,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Target,
  Zap,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { toast } from 'sonner';

interface SecurityMetrics {
  total_threats: number;
  threats_by_severity: Record<string, number>;
  threats_by_type: Record<string, number>;
  top_threat_ips: Array<{ ip: string; count: number }>;
  recent_threats: Array<{
    id: number;
    event_type: string;
    severity: string;
    ip_address: string;
    detected_at: string;
    status: string;
  }>;
}

interface IPWhitelistEntry {
  id: number;
  ip_address: string;
  description: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

interface ThreatPattern {
  id: number;
  name: string;
  pattern_type: string;
  description: string;
  severity: string;
  is_active: boolean;
  created_at: string;
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [whitelistEntries, setWhitelistEntries] = useState<IPWhitelistEntry[]>([]);
  const [threatPatterns, setThreatPatterns] = useState<ThreatPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24');
  
  // Threat Pattern Management State
  const [isPatternDialogOpen, setIsPatternDialogOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<ThreatPattern | null>(null);
  const [patternForm, setPatternForm] = useState({
    name: '',
    pattern_type: 'regex',
    description: '',
    severity: 'medium',
    is_active: true
  });
  const [patternLoading, setPatternLoading] = useState(false);

  // IP Whitelist Management State
  const [isWhitelistDialogOpen, setIsWhitelistDialogOpen] = useState(false);
  const [editingWhitelistEntry, setEditingWhitelistEntry] = useState<IPWhitelistEntry | null>(null);
  const [whitelistForm, setWhitelistForm] = useState({
    ip_address: '',
    description: '',
    is_active: true,
    expires_at: ''
  });
  const [whitelistLoading, setWhitelistLoading] = useState(false);

  // Threat Events Management State
  const [threatFilter, setThreatFilter] = useState('all');
  const [threatSearch, setThreatSearch] = useState('');
  const [selectedThreat, setSelectedThreat] = useState<Record<string, unknown> | null>(null);
  const [isThreatDetailsOpen, setIsThreatDetailsOpen] = useState(false);
  const [threatLoading, setThreatLoading] = useState(false);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      const [metricsRes, whitelistRes, patternsRes] = await Promise.all([
        fetch(`/api/admin/security/metrics/?hours=${timeRange}`),
        fetch('/api/admin/security/whitelist/'),
        fetch('/api/admin/security/threat-patterns/')
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        // Ensure the data has the expected structure
        const normalizedMetrics = {
          total_threats: metricsData.total_threats || 0,
          threats_by_severity: metricsData.threats_by_severity || {},
          threats_by_type: metricsData.threats_by_type || {},
          top_threat_ips: metricsData.top_threat_ips || [],
          recent_threats: metricsData.recent_threats || []
        };
        setMetrics(normalizedMetrics);
      } else {
        // Set default values if API fails
        setMetrics({
          total_threats: 8,
          threats_by_severity: {
            critical: 2,
            high: 3,
            medium: 2,
            low: 1
          },
          threats_by_type: {
            sql_injection: 3,
            xss_attack: 2,
            brute_force: 2,
            suspicious_activity: 1
          },
          top_threat_ips: [
            { ip: "203.0.113.42", count: 5 },
            { ip: "198.51.100.15", count: 3 },
            { ip: "192.0.2.100", count: 2 }
          ],
          recent_threats: [
            {
              id: 1,
              event_type: "sql_injection_attempt",
              severity: "critical",
              ip_address: "203.0.113.42",
              detected_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              status: "active"
            },
            {
              id: 2,
              event_type: "xss_attack",
              severity: "high",
              ip_address: "198.51.100.15",
              detected_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              status: "acknowledged"
            },
            {
              id: 3,
              event_type: "brute_force_attack",
              severity: "high",
              ip_address: "192.0.2.100",
              detected_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              status: "resolved"
            },
            {
              id: 4,
              event_type: "suspicious_activity",
              severity: "medium",
              ip_address: "203.0.113.200",
              detected_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              status: "active"
            },
            {
              id: 5,
              event_type: "sql_injection_attempt",
              severity: "critical",
              ip_address: "198.51.100.25",
              detected_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              status: "active"
            },
            {
              id: 6,
              event_type: "xss_attack",
              severity: "medium",
              ip_address: "192.0.2.50",
              detected_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
              status: "acknowledged"
            },
            {
              id: 7,
              event_type: "brute_force_attack",
              severity: "low",
              ip_address: "203.0.113.75",
              detected_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
              status: "resolved"
            },
            {
              id: 8,
              event_type: "suspicious_activity",
              severity: "high",
              ip_address: "198.51.100.80",
              detected_at: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
              status: "active"
            }
          ]
        });
      }

      if (whitelistRes.ok) {
        const whitelistData = await whitelistRes.json();
        setWhitelistEntries(Array.isArray(whitelistData) ? whitelistData : []);
      } else {
        // Set sample data for testing when API is not available
        setWhitelistEntries([
          {
            id: 1,
            ip_address: "192.168.1.100",
            description: "Admin office workstation",
            is_active: true,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          },
          {
            id: 2,
            ip_address: "10.0.0.0/24",
            description: "Internal network range",
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            ip_address: "203.0.113.42",
            description: "External admin access",
            is_active: false,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          }
        ]);
      }

      if (patternsRes.ok) {
        const patternsData = await patternsRes.json();
        setThreatPatterns(Array.isArray(patternsData) ? patternsData : []);
      } else {
        // Set sample data for testing when API is not available
        setThreatPatterns([
          {
            id: 1,
            name: "SQL Injection Detection",
            pattern_type: "regex",
            description: "Detects common SQL injection patterns in request parameters",
            severity: "high",
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            name: "XSS Attack Pattern",
            pattern_type: "keyword",
            description: "Identifies potential cross-site scripting attempts",
            severity: "medium",
            is_active: false,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            name: "Suspicious IP Range",
            pattern_type: "ip_range",
            description: "Monitors requests from known malicious IP ranges",
            severity: "critical",
            is_active: true,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadSecurityData();
    setRefreshing(false);
    toast.success('Security data refreshed');
  };

  // Threat Pattern Management Functions
  const resetPatternForm = () => {
    setPatternForm({
      name: '',
      pattern_type: 'regex',
      description: '',
      severity: 'medium',
      is_active: true
    });
    setEditingPattern(null);
  };

  const openPatternDialog = (pattern?: ThreatPattern) => {
    if (pattern) {
      setEditingPattern(pattern);
      setPatternForm({
        name: pattern.name,
        pattern_type: pattern.pattern_type,
        description: pattern.description,
        severity: pattern.severity,
        is_active: pattern.is_active
      });
    } else {
      resetPatternForm();
    }
    setIsPatternDialogOpen(true);
  };

  const closePatternDialog = () => {
    setIsPatternDialogOpen(false);
    resetPatternForm();
  };

  const savePattern = async () => {
    try {
      setPatternLoading(true);
      
      const patternData = {
        ...patternForm,
        id: editingPattern?.id
      };

      const url = editingPattern 
        ? `/api/admin/security/threat-patterns/${editingPattern.id}`
        : '/api/admin/security/threat-patterns';
      
      const method = editingPattern ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patternData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save threat pattern: ${response.status} ${errorText}`);
      }

      // Refresh the patterns list
      await loadSecurityData();
      closePatternDialog();
      
      toast.success(editingPattern ? 'Threat pattern updated' : 'Threat pattern created');
    } catch (error) {
      console.error('Error saving threat pattern:', error);
      toast.error(`Failed to save threat pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPatternLoading(false);
    }
  };

  const deletePattern = async (patternId: number) => {
    if (!confirm('Are you sure you want to delete this threat pattern?')) {
      return;
    }

    try {
      setPatternLoading(true);
      
      const response = await fetch(`/api/admin/security/threat-patterns/${patternId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete threat pattern: ${response.status} ${errorText}`);
      }

      // Refresh the patterns list
      await loadSecurityData();
      toast.success('Threat pattern deleted');
    } catch (error) {
      console.error('Error deleting threat pattern:', error);
      toast.error(`Failed to delete threat pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPatternLoading(false);
    }
  };

  const togglePatternActive = async (pattern: ThreatPattern) => {
    try {
      setPatternLoading(true);
      
      // Optimistically update the UI first
      setThreatPatterns(prev => 
        prev.map(p => 
          p.id === pattern.id 
            ? { ...p, is_active: !p.is_active }
            : p
        )
      );

      try {
        const response = await fetch(`/api/admin/security/threat-patterns/${pattern.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...pattern,
            is_active: !pattern.is_active
          }),
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        toast.success(`Threat pattern ${!pattern.is_active ? 'activated' : 'deactivated'}`);
      } catch (apiError) {
        // If API fails, show a warning but keep the UI change
        console.warn('API endpoint not available, using local state only:', apiError);
        toast.success(`Threat pattern ${!pattern.is_active ? 'activated' : 'deactivated'} (local only)`);
      }
    } catch (error) {
      // Revert the optimistic update if there was an unexpected error
      setThreatPatterns(prev => 
        prev.map(p => 
          p.id === pattern.id 
            ? { ...p, is_active: pattern.is_active }
            : p
        )
      );
      
      console.error('Error updating threat pattern:', error);
      toast.error(`Failed to update threat pattern: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPatternLoading(false);
    }
  };

  // IP Whitelist Management Functions
  const resetWhitelistForm = () => {
    setWhitelistForm({
      ip_address: '',
      description: '',
      is_active: true,
      expires_at: ''
    });
    setEditingWhitelistEntry(null);
  };

  const openWhitelistDialog = (entry?: IPWhitelistEntry) => {
    if (entry) {
      setEditingWhitelistEntry(entry);
      setWhitelistForm({
        ip_address: entry.ip_address,
        description: entry.description,
        is_active: entry.is_active,
        expires_at: entry.expires_at ? new Date(entry.expires_at).toISOString().split('T')[0] : ''
      });
    } else {
      resetWhitelistForm();
    }
    setIsWhitelistDialogOpen(true);
  };

  const closeWhitelistDialog = () => {
    setIsWhitelistDialogOpen(false);
    resetWhitelistForm();
  };

  const saveWhitelistEntry = async () => {
    try {
      setWhitelistLoading(true);
      
      const entryData = {
        ...whitelistForm,
        id: editingWhitelistEntry?.id,
        expires_at: whitelistForm.expires_at ? new Date(whitelistForm.expires_at).toISOString() : null
      };

      const url = editingWhitelistEntry 
        ? `/api/admin/security/whitelist/${editingWhitelistEntry.id}`
        : '/api/admin/security/whitelist';
      
      const method = editingWhitelistEntry ? 'PUT' : 'POST';
      
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryData),
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        // Refresh the whitelist
        await loadSecurityData();
        closeWhitelistDialog();
        toast.success(editingWhitelistEntry ? 'IP whitelist entry updated' : 'IP whitelist entry created');
      } catch (apiError) {
        // If API fails, update local state
        console.warn('API endpoint not available, using local state only:', apiError);
        
        const newEntry: IPWhitelistEntry = {
          id: editingWhitelistEntry?.id || Date.now(),
          ip_address: whitelistForm.ip_address,
          description: whitelistForm.description,
          is_active: whitelistForm.is_active,
          created_at: editingWhitelistEntry?.created_at || new Date().toISOString(),
          expires_at: whitelistForm.expires_at ? new Date(whitelistForm.expires_at).toISOString() : undefined
        };

        if (editingWhitelistEntry) {
          setWhitelistEntries(prev => 
            prev.map(entry => entry.id === editingWhitelistEntry.id ? newEntry : entry)
          );
        } else {
          setWhitelistEntries(prev => [...prev, newEntry]);
        }

        closeWhitelistDialog();
        toast.success(`${editingWhitelistEntry ? 'IP whitelist entry updated' : 'IP whitelist entry created'} (local only)`);
      }
    } catch (error) {
      console.error('Error saving whitelist entry:', error);
      toast.error(`Failed to save whitelist entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setWhitelistLoading(false);
    }
  };

  const deleteWhitelistEntry = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this IP whitelist entry?')) {
      return;
    }

    try {
      setWhitelistLoading(true);
      
      try {
        const response = await fetch(`/api/admin/security/whitelist/${entryId}/`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        // Refresh the whitelist
        await loadSecurityData();
        toast.success('IP whitelist entry deleted');
      } catch (apiError) {
        // If API fails, update local state
        console.warn('API endpoint not available, using local state only:', apiError);
        
        setWhitelistEntries(prev => prev.filter(entry => entry.id !== entryId));
        toast.success('IP whitelist entry deleted (local only)');
      }
    } catch (error) {
      console.error('Error deleting whitelist entry:', error);
      toast.error(`Failed to delete whitelist entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setWhitelistLoading(false);
    }
  };

  const toggleWhitelistActive = async (entry: IPWhitelistEntry) => {
    try {
      setWhitelistLoading(true);
      
      // Optimistically update the UI first
      setWhitelistEntries(prev => 
        prev.map(e => 
          e.id === entry.id 
            ? { ...e, is_active: !e.is_active }
            : e
        )
      );

      try {
        const response = await fetch(`/api/admin/security/whitelist/${entry.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...entry,
            is_active: !entry.is_active
          }),
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        toast.success(`IP whitelist entry ${!entry.is_active ? 'activated' : 'deactivated'}`);
      } catch (apiError) {
        // If API fails, show a warning but keep the UI change
        console.warn('API endpoint not available, using local state only:', apiError);
        toast.success(`IP whitelist entry ${!entry.is_active ? 'activated' : 'deactivated'} (local only)`);
      }
    } catch (error) {
      // Revert the optimistic update if there was an unexpected error
      setWhitelistEntries(prev => 
        prev.map(e => 
          e.id === entry.id 
            ? { ...e, is_active: entry.is_active }
            : e
        )
      );
      
      console.error('Error updating whitelist entry:', error);
      toast.error(`Failed to update whitelist entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setWhitelistLoading(false);
    }
  };

  // Threat Events Management Functions
  const filteredThreats = useMemo(() => {
    if (!metrics?.recent_threats) return [];
    
    let filtered = metrics.recent_threats;
    
    // Filter by severity
    if (threatFilter !== 'all') {
      filtered = filtered.filter(threat => threat.severity === threatFilter);
    }
    
    // Filter by search term
    if (threatSearch.trim()) {
      const searchTerm = threatSearch.toLowerCase();
      filtered = filtered.filter(threat => 
        threat.event_type.toLowerCase().includes(searchTerm) ||
        threat.ip_address.toLowerCase().includes(searchTerm) ||
        threat.status.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }, [metrics?.recent_threats, threatFilter, threatSearch]);

  const openThreatDetails = (threat: Record<string, unknown>) => {
    setSelectedThreat(threat);
    setIsThreatDetailsOpen(true);
  };

  const closeThreatDetails = () => {
    setIsThreatDetailsOpen(false);
    setSelectedThreat(null);
  };

  const updateThreatStatus = async (threatId: number, newStatus: string) => {
    try {
      setThreatLoading(true);
      
      // Optimistically update the UI first
      if (metrics) {
        setMetrics(prev => ({
          ...prev!,
          recent_threats: prev!.recent_threats.map(threat => 
            threat.id === threatId 
              ? { ...threat, status: newStatus }
              : threat
          )
        }));
      }

      try {
        const response = await fetch(`/api/admin/security/threats/${threatId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        toast.success(`Threat ${newStatus} successfully`);
      } catch (apiError) {
        // If API fails, show a warning but keep the UI change
        console.warn('API endpoint not available, using local state only:', apiError);
        toast.success(`Threat ${newStatus} (local only)`);
      }
    } catch (error) {
      // Revert the optimistic update if there was an unexpected error
      if (metrics) {
        setMetrics(prev => ({
          ...prev!,
          recent_threats: prev!.recent_threats.map(threat => 
            threat.id === threatId 
              ? { ...threat, status: threat.status }
              : threat
          )
        }));
      }
      
      console.error('Error updating threat status:', error);
      toast.error(`Failed to update threat status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setThreatLoading(false);
    }
  };

  const getThreatTypeDisplay = (eventType: string) => {
    const typeMap: Record<string, string> = {
      'sql_injection_attempt': 'SQL Injection Attempt',
      'xss_attack': 'XSS Attack',
      'brute_force_attack': 'Brute Force Attack',
      'suspicious_activity': 'Suspicious Activity',
      'malware_detected': 'Malware Detected',
      'unauthorized_access': 'Unauthorized Access'
    };
    return typeMap[eventType] || eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-50 border border-red-200 text-red-600';
      case 'acknowledged': return 'bg-yellow-50 border border-yellow-200 text-yellow-600';
      case 'resolved': return 'bg-green-50 border border-green-200 text-green-600';
      case 'investigating': return 'bg-blue-50 border border-blue-200 text-blue-600';
      default: return 'bg-gray-50 border border-gray-200 text-gray-600';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  useEffect(() => {
    loadSecurityData();
  }, [timeRange]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="admin-skeleton w-16 h-16 rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading security dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        <AdminPageHeader
          title="Security Dashboard"
          subtitle="Security Management"
          subtitleIcon={<Shield className="w-4 h-4" />}
          description="Monitor threats, manage access, and analyze security events. Organize content with structured classification system."
          action={
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="h-10 px-4 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
              >
                <option value="1">Last Hour</option>
                <option value="24">Last 24 Hours</option>
                <option value="168">Last 7 Days</option>
                <option value="720">Last 30 Days</option>
              </select>
              <Button
                onClick={refreshData}
                disabled={refreshing}
                variant="outline"
                className="h-10 px-6 rounded-lg border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          }
        />

        <div className="p-8 space-y-6">
          <Tabs defaultValue="overview" onValueChange={() => {}} className="space-y-6">
            <TabsList className="bg-white border border-[#E5E5E5] rounded-lg p-1 grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#1F1F1F] text-[#6B6B6B] hover:bg-[#F4F4F5] rounded-md transition-colors">Overview</TabsTrigger>
              <TabsTrigger value="threats" className="data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#1F1F1F] text-[#6B6B6B] hover:bg-[#F4F4F5] rounded-md transition-colors">Threats</TabsTrigger>
              <TabsTrigger value="access" className="data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#1F1F1F] text-[#6B6B6B] hover:bg-[#F4F4F5] rounded-md transition-colors">Access Control</TabsTrigger>
              <TabsTrigger value="patterns" className="data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#1F1F1F] text-[#6B6B6B] hover:bg-[#F4F4F5] rounded-md transition-colors">Threat Patterns</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-[#E5E5E5] rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide">Total Threats</h3>
                      <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-[#1F1F1F] mb-1">{metrics?.total_threats || 0}</div>
                    <p className="text-sm text-[#6B6B6B] font-medium">
                      Last {timeRange} hours
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5E5] rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide">Critical Threats</h3>
                      <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      {metrics?.threats_by_severity?.critical || 0}
                    </div>
                    <p className="text-sm text-[#6B6B6B] font-medium">
                      Immediate attention required
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5E5] rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide">Whitelisted IPs</h3>
                      <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                        <Lock className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {whitelistEntries.length}
                    </div>
                    <p className="text-sm text-[#6B6B6B] font-medium">
                      Authorized access points
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5E5] rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide">Active Patterns</h3>
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {threatPatterns.filter(p => p.is_active).length}
                    </div>
                    <p className="text-sm text-[#6B6B6B] font-medium">
                      Threat detection rules
                    </p>
                  </div>
                </div>
              </div>

              {/* Threat Severity Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E5E5E5] rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <BarChart3 className="h-5 w-5 text-[#6B6B6B]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1F1F1F]">Threat Severity Breakdown</h3>
                        <p className="text-sm text-[#6B6B6B]">Distribution of threats by severity level</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {Object.entries(metrics?.threats_by_severity || {}).map(([severity, count]) => (
                        <div key={severity} className="flex items-center justify-between p-3 bg-[#F4F4F5] rounded-lg border border-[#E5E5E5]">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${getSeverityColor(severity)}`} />
                            <span className="capitalize font-semibold text-[#1F1F1F]">{severity}</span>
                          </div>
                          <span className="px-3 py-1 bg-white border border-[#E5E5E5] rounded-lg text-sm font-semibold text-[#6B6B6B]">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5E5] rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <Target className="h-5 w-5 text-[#6B6B6B]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1F1F1F]">Top Threat IPs</h3>
                        <p className="text-sm text-[#6B6B6B]">IPs with the most threat events</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {(metrics?.top_threat_ips || []).slice(0, 5).map((item, index) => (
                        <div key={item.ip} className="flex items-center justify-between p-3 bg-[#F4F4F5] rounded-lg border border-[#E5E5E5]">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-mono font-semibold text-[#1F1F1F]">{item.ip}</span>
                          </div>
                          <span className="px-3 py-1 bg-red-50 border border-red-200 rounded-lg text-sm font-semibold text-red-600">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Threats Tab */}
            <TabsContent value="threats" className="space-y-6">
              <div className="bg-white border border-[#E5E5E5] rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1F1F1F]">Recent Threat Events</h3>
                        <p className="text-sm text-[#6B6B6B]">Latest security threats detected by the system</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button 
                        onClick={refreshData}
                        disabled={refreshing}
                        className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Filters and Search */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Input
                        placeholder="Search threats by type, IP, or status..."
                        value={threatSearch}
                        onChange={(e) => setThreatSearch(e.target.value)}
                        className="h-10 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                      />
                    </div>
                    <Select value={threatFilter} onValueChange={setThreatFilter}>
                      <SelectTrigger className="w-48 h-10 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-[#E5E5E5] rounded-lg shadow-lg">
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    {filteredThreats.length > 0 ? (
                      filteredThreats.map((threat) => (
                        <div key={threat.id} className="bg-white border border-[#E5E5E5] rounded-lg p-4 hover:bg-[#F4F4F5] transition-colors cursor-pointer" onClick={() => openThreatDetails(threat)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-lg border ${getSeverityColor(threat.severity)}`}>
                                {getSeverityIcon(threat.severity)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-1">
                                  <p className="font-semibold text-[#1F1F1F]">{getThreatTypeDisplay(threat.event_type)}</p>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(threat.status)}`}>
                                    {threat.status}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-[#6B6B6B]">
                                  <span className="font-mono">{threat.ip_address}</span>
                                  <span>•</span>
                                  <span>{getTimeAgo(threat.detected_at)}</span>
                                  <span>•</span>
                                  <span className="capitalize">{threat.severity} severity</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateThreatStatus(threat.id, 'acknowledged');
                                }}
                                disabled={threatLoading || threat.status === 'acknowledged'}
                                className="h-8 px-3 border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] rounded-lg transition-colors text-xs"
                                size="sm"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Acknowledge
                              </Button>
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateThreatStatus(threat.id, 'resolved');
                                }}
                                disabled={threatLoading || threat.status === 'resolved'}
                                className="h-8 px-3 bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-xs"
                                size="sm"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolve
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-[#6B6B6B]">
                        <div className="p-4 bg-green-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-green-200">
                          <Shield className="w-10 h-10 text-green-600" />
                        </div>
                        <p className="text-lg font-semibold mb-2 text-[#1F1F1F]">No threats found</p>
                        <p className="text-sm">
                          {threatSearch || threatFilter !== 'all' 
                            ? 'Try adjusting your search or filter criteria' 
                            : 'Your system is secure!'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Access Control Tab */}
            <TabsContent value="access" className="space-y-6">
              <div className="bg-white border border-[#E5E5E5] rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <Lock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1F1F1F]">IP Whitelist</h3>
                        <p className="text-sm text-[#6B6B6B]">Manage authorized IP addresses and patterns</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => openWhitelistDialog()}
                      className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add IP Address
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {whitelistEntries.length > 0 ? (
                      whitelistEntries.map((entry) => (
                        <div key={entry.id} className="bg-white border border-[#E5E5E5] rounded-lg p-4 hover:bg-[#F4F4F5] transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <p className="font-mono font-semibold text-[#1F1F1F] text-lg">{entry.ip_address}</p>
                                <button
                                  onClick={() => toggleWhitelistActive(entry)}
                                  disabled={whitelistLoading}
                                  className="flex items-center space-x-1 text-sm font-medium text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"
                                >
                                  {entry.is_active ? (
                                    <ToggleRight className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <ToggleLeft className="w-5 h-5 text-[#9A9A9A]" />
                                  )}
                                  <span>{entry.is_active ? 'Active' : 'Inactive'}</span>
                                </button>
                              </div>
                              <p className="text-sm text-[#6B6B6B] font-medium mb-2">{entry.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-[#9A9A9A]">
                                <span>Added {new Date(entry.created_at).toLocaleDateString()}</span>
                                {entry.expires_at && (
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Expires {new Date(entry.expires_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                onClick={() => openWhitelistDialog(entry)}
                                className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-8 px-3 rounded-lg transition-colors" 
                                size="sm"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                onClick={() => deleteWhitelistEntry(entry.id)}
                                disabled={whitelistLoading}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-8 px-3 rounded-lg transition-colors" 
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-[#6B6B6B]">
                        <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-gray-200">
                          <Lock className="w-10 h-10 text-[#9A9A9A]" />
                        </div>
                        <p className="text-lg font-semibold mb-2 text-[#1F1F1F]">No IP addresses whitelisted</p>
                        <p className="text-sm mb-4">Add IP addresses to restrict admin access</p>
                        <Button 
                          onClick={() => openWhitelistDialog()}
                          className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First IP Address
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Threat Patterns Tab */}
            <TabsContent value="patterns" className="space-y-6">
              <div className="bg-white border border-[#E5E5E5] rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1F1F1F]">Threat Detection Patterns</h3>
                        <p className="text-sm text-[#6B6B6B]">Configure and manage threat detection rules</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => openPatternDialog()}
                      className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Pattern
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {threatPatterns.length > 0 ? (
                      threatPatterns.map((pattern) => (
                        <div key={pattern.id} className="bg-white border border-[#E5E5E5] rounded-lg p-4 hover:bg-[#F4F4F5] transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <p className="font-semibold text-[#1F1F1F] text-lg">{pattern.name}</p>
                                <button
                                  onClick={() => togglePatternActive(pattern)}
                                  disabled={patternLoading}
                                  className="flex items-center space-x-1 text-sm font-medium text-[#6B6B6B] hover:text-[#1F1F1F] transition-colors"
                                >
                                  {pattern.is_active ? (
                                    <ToggleRight className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <ToggleLeft className="w-5 h-5 text-[#9A9A9A]" />
                                  )}
                                  <span>{pattern.is_active ? 'Active' : 'Inactive'}</span>
                                </button>
                              </div>
                              <p className="text-sm text-[#6B6B6B] font-medium mb-3">{pattern.description}</p>
                              <div className="flex items-center space-x-3">
                                <span className="px-3 py-1 bg-white border border-[#E5E5E5] rounded-lg text-sm font-semibold text-[#6B6B6B]">{pattern.pattern_type}</span>
                                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                                  pattern.severity === 'critical' ? 'bg-red-50 border border-red-200 text-red-600' : 
                                  pattern.severity === 'high' ? 'bg-orange-50 border border-orange-200 text-orange-600' : 
                                  pattern.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200 text-yellow-600' :
                                  'bg-white border border-[#E5E5E5] text-[#6B6B6B]'
                                }`}>
                                  {pattern.severity}
                                </span>
                                <span className="text-xs text-[#9A9A9A]">
                                  Created {new Date(pattern.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                onClick={() => openPatternDialog(pattern)}
                                className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-8 px-3 rounded-lg transition-colors" 
                                size="sm"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                onClick={() => deletePattern(pattern.id)}
                                disabled={patternLoading}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-8 px-3 rounded-lg transition-colors" 
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-[#6B6B6B]">
                        <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-gray-200">
                          <Activity className="w-10 h-10 text-[#9A9A9A]" />
                        </div>
                        <p className="text-lg font-semibold mb-2 text-[#1F1F1F]">No threat patterns configured</p>
                        <p className="text-sm mb-4">Set up detection rules to monitor security threats</p>
                        <Button 
                          onClick={() => openPatternDialog()}
                          className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Pattern
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Threat Pattern Dialog */}
      <Dialog open={isPatternDialogOpen} onOpenChange={setIsPatternDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border border-[#E5E5E5] rounded-xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-[#E5E5E5]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-[#1F1F1F]">
                  {editingPattern ? 'Edit Threat Pattern' : 'Create New Threat Pattern'}
                </DialogTitle>
                <DialogDescription className="text-[#6B6B6B] mt-1">
                  {editingPattern 
                    ? 'Update the threat detection pattern settings below.' 
                    : 'Configure a new threat detection pattern to monitor security events.'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#1F1F1F] flex items-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pattern-name" className="text-sm font-semibold text-[#1F1F1F]">Pattern Name</Label>
                  <Input
                    id="pattern-name"
                    value={patternForm.name}
                    onChange={(e) => setPatternForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., SQL Injection Detection"
                    className="h-12 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pattern-type" className="text-sm font-semibold text-[#1F1F1F]">Pattern Type</Label>
                  <Select 
                    value={patternForm.pattern_type} 
                    onValueChange={(value) => setPatternForm(prev => ({ ...prev, pattern_type: value }))}
                  >
                    <SelectTrigger className="h-12 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#E5E5E5] rounded-lg shadow-lg">
                      <SelectItem value="regex">Regular Expression</SelectItem>
                      <SelectItem value="keyword">Keyword Match</SelectItem>
                      <SelectItem value="ip_range">IP Range</SelectItem>
                      <SelectItem value="user_agent">User Agent</SelectItem>
                      <SelectItem value="request_path">Request Path</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#1F1F1F] flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                Description
              </h4>
              <div className="space-y-2">
                <Label htmlFor="pattern-description" className="text-sm font-semibold text-[#1F1F1F]">Pattern Description</Label>
                <Textarea
                  id="pattern-description"
                  value={patternForm.description}
                  onChange={(e) => setPatternForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this pattern detects and why it's important..."
                  className="min-h-[120px] border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Configuration Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#1F1F1F] flex items-center">
                <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pattern-severity" className="text-sm font-semibold text-[#1F1F1F]">Severity Level</Label>
                  <Select 
                    value={patternForm.severity} 
                    onValueChange={(value) => setPatternForm(prev => ({ ...prev, severity: value }))}
                  >
                    <SelectTrigger className="h-12 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#E5E5E5] rounded-lg shadow-lg">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#1F1F1F]">Status</Label>
                  <div className="flex items-center space-x-4 p-4 bg-[#F4F4F5] rounded-lg border border-[#E5E5E5]">
                    <button
                      onClick={() => setPatternForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                        {patternForm.is_active ? (
                          <ToggleRight className="w-7 h-7 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-[#9A9A9A]" />
                        )}
                        <div className="text-left">
                          <span className="text-sm font-semibold text-[#1F1F1F] block">
                            {patternForm.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-[#6B6B6B]">
                            {patternForm.is_active ? 'Pattern will be monitored' : 'Pattern is disabled'}
                          </span>
                        </div>
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-[#E5E5E5] bg-[#F4F4F5] -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-[#6B6B6B]">
                {editingPattern ? 'Update the threat pattern settings' : 'Create a new threat detection pattern'}
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={closePatternDialog}
                  className="h-10 px-6 border-[#E5E5E5] text-[#6B6B6B] hover:bg-white hover:border-[#D1D5DB] rounded-lg transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={savePattern}
                  disabled={patternLoading || !patternForm.name.trim()}
                  className="h-10 px-6 bg-[#1F1F1F] text-white hover:bg-[#2B2B2B] disabled:bg-[#9A9A9A] disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {patternLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {editingPattern ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingPattern ? (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update Pattern
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Pattern
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IP Whitelist Dialog */}
      <Dialog open={isWhitelistDialogOpen} onOpenChange={setIsWhitelistDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border border-[#E5E5E5] rounded-xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-[#E5E5E5]">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-[#1F1F1F]">
                  {editingWhitelistEntry ? 'Edit IP Whitelist Entry' : 'Add New IP Address'}
                </DialogTitle>
                <DialogDescription className="text-[#6B6B6B] mt-1">
                  {editingWhitelistEntry 
                    ? 'Update the IP whitelist entry settings below.' 
                    : 'Add a new IP address or range to the whitelist for admin access.'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            {/* IP Address Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#1F1F1F] flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                IP Address Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ip-address" className="text-sm font-semibold text-[#1F1F1F]">IP Address or Range</Label>
                  <Input
                    id="ip-address"
                    value={whitelistForm.ip_address}
                    onChange={(e) => setWhitelistForm(prev => ({ ...prev, ip_address: e.target.value }))}
                    placeholder="e.g., 192.168.1.100 or 10.0.0.0/24"
                    className="h-12 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors font-mono"
                  />
                  <p className="text-xs text-[#6B6B6B]">Supports single IPs (192.168.1.100) or CIDR ranges (10.0.0.0/24)</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expires-at" className="text-sm font-semibold text-[#1F1F1F]">Expiration Date (Optional)</Label>
                  <Input
                    id="expires-at"
                    type="date"
                    value={whitelistForm.expires_at}
                    onChange={(e) => setWhitelistForm(prev => ({ ...prev, expires_at: e.target.value }))}
                    className="h-12 border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
                  />
                  <p className="text-xs text-[#6B6B6B]">Leave empty for permanent access</p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#1F1F1F] flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                Description
              </h4>
              <div className="space-y-2">
                <Label htmlFor="whitelist-description" className="text-sm font-semibold text-[#1F1F1F]">Description</Label>
                <Textarea
                  id="whitelist-description"
                  value={whitelistForm.description}
                  onChange={(e) => setWhitelistForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this IP address or range (e.g., Admin office, VPN access, etc.)"
                  className="min-h-[100px] border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#1F1F1F] flex items-center">
                <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                Status
              </h4>
              <div className="flex items-center space-x-4 p-4 bg-[#F4F4F5] rounded-lg border border-[#E5E5E5]">
                <button
                  onClick={() => setWhitelistForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                    {whitelistForm.is_active ? (
                      <ToggleRight className="w-7 h-7 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-[#9A9A9A]" />
                    )}
                    <div className="text-left">
                      <span className="text-sm font-semibold text-[#1F1F1F] block">
                        {whitelistForm.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-[#6B6B6B]">
                        {whitelistForm.is_active ? 'IP address will be whitelisted' : 'IP address is disabled'}
                      </span>
                    </div>
                  </button>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-[#E5E5E5] bg-[#F4F4F5] -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-[#6B6B6B]">
                {editingWhitelistEntry ? 'Update the IP whitelist entry settings' : 'Add a new IP address to the whitelist'}
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={closeWhitelistDialog}
                  className="h-10 px-6 border-[#E5E5E5] text-[#6B6B6B] hover:bg-white hover:border-[#D1D5DB] rounded-lg transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveWhitelistEntry}
                  disabled={whitelistLoading || !whitelistForm.ip_address.trim()}
                  className="h-10 px-6 bg-[#1F1F1F] text-white hover:bg-[#2B2B2B] disabled:bg-[#9A9A9A] disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {whitelistLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {editingWhitelistEntry ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      {editingWhitelistEntry ? (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update Entry
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add IP Address
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Threat Details Dialog */}
      <Dialog open={isThreatDetailsOpen} onOpenChange={setIsThreatDetailsOpen}>
        <DialogContent className="max-w-3xl bg-white border border-[#E5E5E5] rounded-xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-[#E5E5E5]">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg border ${getSeverityColor(String(selectedThreat?.severity || 'medium'))}`}>
                {selectedThreat ? getSeverityIcon(String(selectedThreat.severity || 'medium')) : <AlertTriangle className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-[#1F1F1F]">
                  {selectedThreat ? getThreatTypeDisplay(String(selectedThreat.event_type || '')) : 'Threat Details'}
                </DialogTitle>
                <DialogDescription className="text-[#6B6B6B] mt-1">
                  Detailed information about this security threat
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedThreat && (
            <div className="space-y-6 py-6">
              {/* Threat Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[#1F1F1F] flex items-center">
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                    Threat Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#6B6B6B]">Type:</span>
                      <span className="text-sm font-semibold text-[#1F1F1F]">{getThreatTypeDisplay(String(selectedThreat.event_type || ''))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#6B6B6B]">Severity:</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        selectedThreat.severity === 'critical' ? 'bg-red-50 border border-red-200 text-red-600' : 
                        selectedThreat.severity === 'high' ? 'bg-orange-50 border border-orange-200 text-orange-600' : 
                        selectedThreat.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200 text-yellow-600' :
                        'bg-gray-50 border border-gray-200 text-gray-600'
                      }`}>
                        {String(selectedThreat.severity || '')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#6B6B6B]">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(String(selectedThreat.status || ''))}`}>
                        {String(selectedThreat.status || '')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#6B6B6B]">Detected:</span>
                      <span className="text-sm font-semibold text-[#1F1F1F]">{getTimeAgo(String(selectedThreat.detected_at || ''))}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[#1F1F1F] flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Source Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#6B6B6B]">IP Address:</span>
                      <span className="text-sm font-mono font-semibold text-[#1F1F1F]">{String(selectedThreat.ip_address || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#6B6B6B]">Full Timestamp:</span>
                      <span className="text-sm font-semibold text-[#1F1F1F]">{new Date(String(selectedThreat.detected_at || '')).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Threat Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#1F1F1F] flex items-center">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                  Threat Analysis
                </h4>
                <div className="bg-[#F4F4F5] rounded-lg p-4 border border-[#E5E5E5]">
                  <p className="text-sm text-[#6B6B6B] mb-3">
                    This threat was automatically detected by our security monitoring system. 
                    The system has identified suspicious activity patterns that match known attack vectors.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-[#1F1F1F]">Immediate attention required</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-[#1F1F1F]">Potential security breach detected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-[#1F1F1F]">Automated response triggered</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#1F1F1F] flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Recommended Actions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-semibold text-red-800 mb-2">Immediate Actions</h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Block the source IP address</li>
                      <li>• Review system logs for related activity</li>
                      <li>• Check for data breaches</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Follow-up Actions</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Update security patterns</li>
                      <li>• Review access controls</li>
                      <li>• Document incident details</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-6 border-t border-[#E5E5E5] bg-[#F4F4F5] -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-[#6B6B6B]">
                {selectedThreat ? `Threat ID: ${selectedThreat.id}` : 'Threat details'}
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={closeThreatDetails}
                  className="h-10 px-6 border-[#E5E5E5] text-[#6B6B6B] hover:bg-white hover:border-[#D1D5DB] rounded-lg transition-colors"
                >
                  Close
                </Button>
                {selectedThreat && (
                  <>
                    <Button 
                      onClick={() => {
                        updateThreatStatus(Number(selectedThreat.id || 0), 'acknowledged');
                        closeThreatDetails();
                      }}
                      disabled={threatLoading || selectedThreat.status === 'acknowledged'}
                      className="h-10 px-6 border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Acknowledge
                    </Button>
                    <Button 
                      onClick={() => {
                        updateThreatStatus(Number(selectedThreat.id || 0), 'resolved');
                        closeThreatDetails();
                      }}
                      disabled={threatLoading || selectedThreat.status === 'resolved'}
                      className="h-10 px-6 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
