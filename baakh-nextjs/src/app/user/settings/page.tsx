"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  User,
  Settings,
  Shield,
  Bell,
  Globe,
  Save,
  AlertCircle,
  Loader2
} from "lucide-react";

interface UserSettingsData {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    bio: string;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    theme: string;
    notifications: boolean;
  };
  privacy: {
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
}

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Settings data state
  const [settingsData, setSettingsData] = useState<UserSettingsData>({
    profile: {
      firstName: "User",
      lastName: "",
      email: "",
      phone: "",
      avatar: "",
      bio: "Regular user of Baakh poetry archive"
    },
    preferences: {
      language: "en",
      timezone: "Asia/Karachi",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      theme: "light",
      notifications: true
    },
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      showPhone: false,
      allowMessages: true
    }
  });

  // Load user ID and settings on component mount
  useEffect(() => {
    const loadUserAndSettings = async () => {
      try {
        // For regular users, we would get the user ID from the e2ee auth system
        // For now, we'll use a mock user ID
        const mockUserId = "mock-user-id";
        setUserId(mockUserId);
        
        // Load settings
        await loadSettings(mockUserId);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAndSettings();
  }, []);

  // Load settings from API
  const loadSettings = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/settings?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettingsData(data.settings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
  };

  // Validate form data
  const validateForm = (section: string, data: any): boolean => {
    const newErrors: Record<string, string> = {};

    if (section === 'profile') {
      if (!data.firstName.trim()) newErrors.firstName = 'First name is required';
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
      const sectionData = settingsData[section as keyof UserSettingsData];
      
      if (!validateForm(section, sectionData)) {
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/user/settings', {
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

  // Update settings data
  const updateSettingsData = (section: keyof UserSettingsData, field: string, value: any) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#1F1F1F]" />
          <p className="text-[#6B6B6B]">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">
            User Settings
          </h1>
          <p className="text-[#6B6B6B] text-lg">
            Manage your account preferences and privacy settings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-[#F4F4F5] border border-[#E5E5E5] rounded-lg p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1F1F1F] data-[state=active]:shadow-sm">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1F1F1F] data-[state=active]:shadow-sm">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1F1F1F] data-[state=active]:shadow-sm">
              <Shield className="h-4 w-4" />
              Privacy
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
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#1F1F1F] font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settingsData.profile.email}
                      onChange={(e) => updateSettingsData('profile', 'email', e.target.value)}
                      className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]"
                    />
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

          {/* Preferences Settings Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1F1F1F]">
                  <Settings className="h-5 w-5" />
                  Preferences
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Configure your language, timezone, and display preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-[#1F1F1F] font-medium">Language</Label>
                    <Select 
                      value={settingsData.preferences.language} 
                      onValueChange={(value) => updateSettingsData('preferences', 'language', value)}
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
                      value={settingsData.preferences.timezone} 
                      onValueChange={(value) => updateSettingsData('preferences', 'timezone', value)}
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
                      value={settingsData.preferences.dateFormat} 
                      onValueChange={(value) => updateSettingsData('preferences', 'dateFormat', value)}
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
                      value={settingsData.preferences.timeFormat} 
                      onValueChange={(value) => updateSettingsData('preferences', 'timeFormat', value)}
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
                      <Label className="text-[#1F1F1F] font-medium">Notifications</Label>
                      <p className="text-sm text-[#6B6B6B]">Receive notifications about new content</p>
                    </div>
                    <Switch
                      checked={settingsData.preferences.notifications}
                      onCheckedChange={(checked) => updateSettingsData('preferences', 'notifications', checked)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave('preferences')}
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

          {/* Privacy Settings Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1F1F1F]">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription className="text-[#6B6B6B]">
                  Control your privacy and who can see your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileVisibility" className="text-[#1F1F1F] font-medium">Profile Visibility</Label>
                    <Select 
                      value={settingsData.privacy.profileVisibility} 
                      onValueChange={(value) => updateSettingsData('privacy', 'profileVisibility', value)}
                    >
                      <SelectTrigger className="border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F]">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Show Email</Label>
                      <p className="text-sm text-[#6B6B6B]">Allow others to see your email address</p>
                    </div>
                    <Switch
                      checked={settingsData.privacy.showEmail}
                      onCheckedChange={(checked) => updateSettingsData('privacy', 'showEmail', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Show Phone</Label>
                      <p className="text-sm text-[#6B6B6B]">Allow others to see your phone number</p>
                    </div>
                    <Switch
                      checked={settingsData.privacy.showPhone}
                      onCheckedChange={(checked) => updateSettingsData('privacy', 'showPhone', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#1F1F1F] font-medium">Allow Messages</Label>
                      <p className="text-sm text-[#6B6B6B]">Allow other users to send you messages</p>
                    </div>
                    <Switch
                      checked={settingsData.privacy.allowMessages}
                      onCheckedChange={(checked) => updateSettingsData('privacy', 'allowMessages', checked)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave('privacy')}
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
  );
}
