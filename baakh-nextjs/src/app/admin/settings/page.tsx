"use client";

import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Clock
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@baakh.com",
    phone: "+92 300 1234567",
    avatar: "",
    bio: "System administrator for Baakh poetry archive"
  });

  // Security settings state
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
    sessionTimeout: "30",
    loginNotifications: true
  });

  // Notification settings state
  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    weeklyReports: true,
    systemAlerts: true,
    userActivity: false
  });

  // System settings state
  const [systemData, setSystemData] = useState({
    language: "en",
    timezone: "Asia/Karachi",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    theme: "light",
    autoBackup: true,
    backupFrequency: "daily"
  });

  const handleSave = async (section: string) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${section} settings saved successfully`);
    } catch (error) {
      toast.error(`Failed to save ${section} settings`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileUpdate = () => {
    handleSave("Profile");
  };

  const handleSecurityUpdate = () => {
    handleSave("Security");
  };

  const handleNotificationUpdate = () => {
    handleSave("Notification");
  };

  const handleSystemUpdate = () => {
    handleSave("System");
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-10 space-y-10">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[#1F1F1F]">Admin Settings</h1>
                <p className="text-lg text-[#6B6B6B] max-w-2xl">
                  Manage your account preferences, security settings, and system configuration
                </p>
              </div>
            </div>
          </div>
        </div>

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
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#1F1F1F] font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#1F1F1F] font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#1F1F1F] font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[#1F1F1F] font-medium">Bio</Label>
                  <Input
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={isSaving}
                    className="bg-[#1F1F1F] hover:bg-[#404040] text-white"
                  >
                    {isSaving ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
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
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1F1F1F]">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Manage your password, two-factor authentication, and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-[#1F1F1F] font-medium">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-[#1F1F1F] font-medium">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#1F1F1F] font-medium">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-[#6B6B6B]">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={securityData.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurityData({...securityData, twoFactorEnabled: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Login Notifications</Label>
                      <p className="text-sm text-[#6B6B6B]">Get notified of new login attempts</p>
                    </div>
                    <Switch
                      checked={securityData.loginNotifications}
                      onCheckedChange={(checked) => setSecurityData({...securityData, loginNotifications: checked})}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSecurityUpdate}
                    disabled={isSaving}
                    className="bg-[#1F1F1F] hover:bg-[#404040] text-white"
                  >
                    {isSaving ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
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
                      checked={notificationData.emailNotifications}
                      onCheckedChange={(checked) => setNotificationData({...notificationData, emailNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Push Notifications</Label>
                      <p className="text-sm text-[#6B6B6B]">Receive push notifications in browser</p>
                    </div>
                    <Switch
                      checked={notificationData.pushNotifications}
                      onCheckedChange={(checked) => setNotificationData({...notificationData, pushNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">SMS Notifications</Label>
                      <p className="text-sm text-[#6B6B6B]">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notificationData.smsNotifications}
                      onCheckedChange={(checked) => setNotificationData({...notificationData, smsNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Weekly Reports</Label>
                      <p className="text-sm text-[#6B6B6B]">Receive weekly summary reports</p>
                    </div>
                    <Switch
                      checked={notificationData.weeklyReports}
                      onCheckedChange={(checked) => setNotificationData({...notificationData, weeklyReports: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">System Alerts</Label>
                      <p className="text-sm text-[#6B6B6B]">Receive critical system notifications</p>
                    </div>
                    <Switch
                      checked={notificationData.systemAlerts}
                      onCheckedChange={(checked) => setNotificationData({...notificationData, systemAlerts: checked})}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleNotificationUpdate}
                    disabled={isSaving}
                    className="bg-[#1F1F1F] hover:bg-[#404040] text-white"
                  >
                    {isSaving ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
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
                    <Select value={systemData.language} onValueChange={(value) => setSystemData({...systemData, language: value})}>
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
                    <Select value={systemData.timezone} onValueChange={(value) => setSystemData({...systemData, timezone: value})}>
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
                    <Select value={systemData.dateFormat} onValueChange={(value) => setSystemData({...systemData, dateFormat: value})}>
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
                    <Select value={systemData.timeFormat} onValueChange={(value) => setSystemData({...systemData, timeFormat: value})}>
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
                      checked={systemData.autoBackup}
                      onCheckedChange={(checked) => setSystemData({...systemData, autoBackup: checked})}
                    />
                  </div>
                  {systemData.autoBackup && (
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency" className="text-[#1F1F1F] font-medium">Backup Frequency</Label>
                      <Select value={systemData.backupFrequency} onValueChange={(value) => setSystemData({...systemData, backupFrequency: value})}>
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
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSystemUpdate}
                    disabled={isSaving}
                    className="bg-[#1F1F1F] hover:bg-[#404040] text-white"
                  >
                    {isSaving ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
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
    </AdminLayout>
  );
}
