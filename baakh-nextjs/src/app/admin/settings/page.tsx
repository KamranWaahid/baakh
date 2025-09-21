"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Settings,
  User,
  Shield,
  Bell,
  Database,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Languages,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";

interface SettingsData {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    bio: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: string;
    loginNotifications: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    weeklyReports: boolean;
    systemAlerts: boolean;
    userActivity: boolean;
  };
  system: {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    theme: string;
    autoBackup: boolean;
    backupFrequency: string;
  };
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Settings data state
  const [settingsData, setSettingsData] = useState<SettingsData>({
    profile: {
      firstName: "Admin",
      lastName: "User",
      email: "",
      phone: "",
      avatar: "",
      bio: "System administrator for Baakh poetry archive"
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: "30",
      loginNotifications: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      weeklyReports: true,
      systemAlerts: true,
      userActivity: false
    },
    system: {
      language: "en",
      timezone: "Asia/Karachi",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      theme: "light",
      autoBackup: true,
      backupFrequency: "daily"
    }
  });

  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load user ID and settings on component mount
  useEffect(() => {
    const loadUserAndSettings = async () => {
      try {
        // Get current user
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserId(userData.user?.id || "");
          
          if (userData.user?.id) {
            // Check database status and load settings
            await checkDatabaseStatusAndLoadSettings(userData.user.id);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAndSettings();
  }, []);

  // Check database status and load settings accordingly
  const checkDatabaseStatusAndLoadSettings = async (userId: string) => {
    try {
      // Check if production database is ready
      const statusResponse = await fetch('/api/admin/settings/status');
      const statusData = await statusResponse.json();
      
      if (statusData.production_ready) {
        console.log('✅ Using production database for admin settings');
        await loadSettings(userId, 'admin');
      } else {
        console.log('⚠️ Using test endpoints (database not ready)');
        console.log('Status:', statusData.message);
        await loadSettings(userId, 'test');
      }
    } catch (error) {
      console.error('Error checking database status:', error);
      // Fallback to test endpoints
      await loadSettings(userId, 'test');
    }
  };

  // Load settings from API
  const loadSettings = async (userId: string, mode: 'test' | 'admin' = 'test') => {
    try {
      const endpoint = mode === 'admin' ? 'admin' : 'test';
      const response = await fetch(`/api/admin/settings/${endpoint}?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettingsData(data.settings);
        }
      } else {
        // If admin endpoint fails, fallback to test
        if (mode === 'admin') {
          console.log('Admin endpoint failed, falling back to test endpoints');
          await loadSettings(userId, 'test');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // If admin endpoint fails, fallback to test
      if (mode === 'admin') {
        console.log('Admin endpoint failed, falling back to test endpoints');
        await loadSettings(userId, 'test');
      } else {
        toast.error('Failed to load settings');
      }
    }
  };

  // Validate form data
  const validateForm = (section: string, data: Record<string, unknown>): boolean => {
    const newErrors: Record<string, string> = {};

    if (section === 'profile') {
      if (!data.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!data.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!data.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (section === 'password') {
      if (!data.currentPassword) newErrors.currentPassword = 'Current password is required';
      if (!data.newPassword) newErrors.newPassword = 'New password is required';
      else if (data.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(data.newPassword)) {
        newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
      }
      if (data.newPassword !== data.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save settings to API
  const handleSave = async (section: string) => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      const sectionData = settingsData[section as keyof SettingsData];
      
      if (!validateForm(section, sectionData)) {
        setIsSaving(false);
        return;
      }

      // Try admin endpoint first, fallback to test
      let response = await fetch('/api/admin/settings/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          section,
          data: sectionData
        })
      });

      // If admin endpoint fails, try test endpoint
      if (!response.ok) {
        console.log('Admin endpoint failed, trying test endpoint');
        response = await fetch('/api/admin/settings/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            section,
            data: sectionData
          })
        });
      }

      if (response.ok) {
        toast.success(`${section} settings saved successfully`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to save ${section} settings`);
      }
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      toast.error(`Failed to save ${section} settings`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      if (!validateForm('password', passwordData)) {
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/admin/settings/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        toast.success('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  // Update settings data
  const updateSettingsData = (section: keyof SettingsData, field: string, value: unknown) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Update password data
  const updatePasswordData = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#1F1F1F]" />
            <p className="text-[#6B6B6B]">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F9F9F9]">
        <AdminPageHeader
          title="Admin Settings"
          subtitle="System Settings"
          subtitleIcon={<Settings className="w-4 h-4" />}
          description="Manage your account preferences, security settings, and system configuration. Organize content with structured classification system."
        />

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1F1F1F] data-[state=active]:shadow-sm">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1F1F1F] data-[state=active]:shadow-sm">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1F1F1F] data-[state=active]:shadow-sm">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1F1F1F] data-[state=active]:shadow-sm">
              <Database className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1F1F1F]">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#1F1F1F] font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      value={settingsData.profile.firstName}
                      onChange={(e) => updateSettingsData('profile', 'firstName', e.target.value)}
                      className={`border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-600 text-sm">
                          {errors.firstName}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#1F1F1F] font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settingsData.profile.lastName}
                      onChange={(e) => updateSettingsData('profile', 'lastName', e.target.value)}
                      className={`border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                    {errors.lastName && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-600 text-sm">
                          {errors.lastName}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#1F1F1F] font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settingsData.profile.email}
                      onChange={(e) => updateSettingsData('profile', 'email', e.target.value)}
                      className={`border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-600 text-sm">
                          {errors.email}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#1F1F1F] font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      value={settingsData.profile.phone}
                      onChange={(e) => updateSettingsData('profile', 'phone', e.target.value)}
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[#1F1F1F] font-medium">Bio</Label>
                  <Input
                    id="bio"
                    value={settingsData.profile.bio}
                    onChange={(e) => updateSettingsData('profile', 'bio', e.target.value)}
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave('profile')}
                    disabled={isSaving}
                    className="bg-[#1F1F1F] hover:bg-[#404040] text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Password Change Card */}
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1F1F1F]">
                  <Key className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Update your account password for enhanced security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-[#1F1F1F] font-medium">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => updatePasswordData('currentPassword', e.target.value)}
                      className={`border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] ${errors.currentPassword ? 'border-red-500' : ''}`}
                    />
                    {errors.currentPassword && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-600 text-sm">
                          {errors.currentPassword}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-[#1F1F1F] font-medium">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => updatePasswordData('newPassword', e.target.value)}
                      className={`border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] ${errors.newPassword ? 'border-red-500' : ''}`}
                    />
                    {errors.newPassword && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-600 text-sm">
                          {errors.newPassword}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#1F1F1F] font-medium">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => updatePasswordData('confirmPassword', e.target.value)}
                    className={`border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  {errors.confirmPassword && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-600 text-sm">
                        {errors.confirmPassword}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                {/* Password Requirements */}
                <div className="bg-[#F8F9FA] border border-[#E5E5E5] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#1F1F1F] mb-2">Password Requirements:</h4>
                  <ul className="text-xs text-[#6B6B6B] space-y-1">
                    <li className={`flex items-center gap-2 ${passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                      <CheckCircle className="h-3 w-3" />
                      At least 8 characters long
                    </li>
                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                      <CheckCircle className="h-3 w-3" />
                      One uppercase letter (A-Z)
                    </li>
                    <li className={`flex items-center gap-2 ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                      <CheckCircle className="h-3 w-3" />
                      One lowercase letter (a-z)
                    </li>
                    <li className={`flex items-center gap-2 ${/\d/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                      <CheckCircle className="h-3 w-3" />
                      One number (0-9)
                    </li>
                    <li className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                      <CheckCircle className="h-3 w-3" />
                      One special character (!@#$%^&*...)
                    </li>
                  </ul>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isSaving}
                    className="bg-[#1F1F1F] hover:bg-[#404040] text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Preferences Card */}
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1F1F1F]">
                  <Shield className="h-5 w-5" />
                  Security Preferences
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Configure your security settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-[#6B6B6B]">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={settingsData.security.twoFactorEnabled}
                      onCheckedChange={(checked) => updateSettingsData('security', 'twoFactorEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Login Notifications</Label>
                      <p className="text-sm text-[#6B6B6B]">Get notified of new login attempts</p>
                    </div>
                    <Switch
                      checked={settingsData.security.loginNotifications}
                      onCheckedChange={(checked) => updateSettingsData('security', 'loginNotifications', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout" className="text-[#1F1F1F] font-medium">Session Timeout (minutes)</Label>
                    <Select 
                      value={settingsData.security.sessionTimeout} 
                      onValueChange={(value) => updateSettingsData('security', 'sessionTimeout', value)}
                    >
                      <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                        <SelectValue placeholder="Select timeout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave('security')}
                    disabled={isSaving}
                    className="bg-[#1F1F1F] hover:bg-[#404040] text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1F1F1F]">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Choose how and when you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Email Notifications</Label>
                      <p className="text-sm text-[#6B6B6B]">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settingsData.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateSettingsData('notifications', 'emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Push Notifications</Label>
                      <p className="text-sm text-[#6B6B6B]">Receive push notifications in browser</p>
                    </div>
                    <Switch
                      checked={settingsData.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateSettingsData('notifications', 'pushNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">SMS Notifications</Label>
                      <p className="text-sm text-[#6B6B6B]">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={settingsData.notifications.smsNotifications}
                      onCheckedChange={(checked) => updateSettingsData('notifications', 'smsNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Weekly Reports</Label>
                      <p className="text-sm text-[#6B6B6B]">Receive weekly summary reports</p>
                    </div>
                    <Switch
                      checked={settingsData.notifications.weeklyReports}
                      onCheckedChange={(checked) => updateSettingsData('notifications', 'weeklyReports', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">System Alerts</Label>
                      <p className="text-sm text-[#6B6B6B]">Receive critical system notifications</p>
                    </div>
                    <Switch
                      checked={settingsData.notifications.systemAlerts}
                      onCheckedChange={(checked) => updateSettingsData('notifications', 'systemAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">User Activity</Label>
                      <p className="text-sm text-[#6B6B6B]">Get notified about user activities and changes</p>
                    </div>
                    <Switch
                      checked={settingsData.notifications.userActivity}
                      onCheckedChange={(checked) => updateSettingsData('notifications', 'userActivity', checked)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave('notifications')}
                    disabled={isSaving}
                    className="bg-[#1F1F1F] hover:bg-[#404040] text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1F1F1F]">
                  <Database className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Configure system preferences and regional settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-[#1F1F1F] font-medium">Language</Label>
                    <Select 
                      value={settingsData.system.language} 
                      onValueChange={(value) => updateSettingsData('system', 'language', value)}
                    >
                      <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sd">Sindhi</SelectItem>
                        <SelectItem value="ur">Urdu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-[#1F1F1F] font-medium">Timezone</Label>
                    <Select 
                      value={settingsData.system.timezone} 
                      onValueChange={(value) => updateSettingsData('system', 'timezone', value)}
                    >
                      <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Karachi">Asia/Karachi (PKT)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat" className="text-[#1F1F1F] font-medium">Date Format</Label>
                    <Select 
                      value={settingsData.system.dateFormat} 
                      onValueChange={(value) => updateSettingsData('system', 'dateFormat', value)}
                    >
                      <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeFormat" className="text-[#1F1F1F] font-medium">Time Format</Label>
                    <Select 
                      value={settingsData.system.timeFormat} 
                      onValueChange={(value) => updateSettingsData('system', 'timeFormat', value)}
                    >
                      <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Auto Backup</Label>
                      <p className="text-sm text-[#6B6B6B]">Automatically backup system data</p>
                    </div>
                    <Switch
                      checked={settingsData.system.autoBackup}
                      onCheckedChange={(checked) => updateSettingsData('system', 'autoBackup', checked)}
                    />
                  </div>
                  {settingsData.system.autoBackup && (
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency" className="text-[#1F1F1F] font-medium">Backup Frequency</Label>
                      <Select 
                        value={settingsData.system.backupFrequency} 
                        onValueChange={(value) => updateSettingsData('system', 'backupFrequency', value)}
                      >
                        <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-[#1F1F1F] font-medium">Theme</Label>
                    <Select 
                      value={settingsData.system.theme} 
                      onValueChange={(value) => updateSettingsData('system', 'theme', value)}
                    >
                      <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave('system')}
                    disabled={isSaving}
                    className="bg-[#1F1F1F] hover:bg-[#404040] text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
