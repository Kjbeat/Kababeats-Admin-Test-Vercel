/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Key,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

interface UserDashboardSettingsLayoutProps {
  user: any;
  userDetails: any;
  stats: any;
  onRefresh: () => void;
  isLoading: boolean;
  onSaveUser: (id: string, data: any) => Promise<void>;
  isSaving?: boolean;
}

export function UserDashboardSettingsLayout({ 
  user, 
  userDetails, 
  stats, 
  onRefresh, 
  isLoading, 
  onSaveUser, 
  isSaving = false 
}: UserDashboardSettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      country: user?.country || 'Nigeria',
      website: user?.website || '',
      location: user?.location || ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      saleNotifications: true,
      followerNotifications: true,
      commentNotifications: true,
      weeklyDigest: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
      allowMessages: true,
      showOnlineStatus: true,
      allowCollaborations: true
    },
    appearance: {
      theme: 'system',
      language: 'en',
      timezone: 'Africa/Lagos',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: 30,
      requirePasswordChange: false
    },
    billing: {
      currency: 'USD',
      taxId: '',
      businessName: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Nigeria'
      }
    }
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: string, parentField: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [parentField]: {
          ...(prev[section as keyof typeof prev] as any)[parentField],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      await onSaveUser(user._id, settings.profile);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={settings.profile.firstName}
                    onChange={(e) => handleInputChange('profile', 'firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={settings.profile.lastName}
                    onChange={(e) => handleInputChange('profile', 'lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={settings.profile.username}
                    onChange={(e) => handleInputChange('profile', 'username', e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={settings.profile.country}
                    onChange={(e) => handleInputChange('profile', 'country', e.target.value)}
                    placeholder="Enter your country"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.profile.website}
                    onChange={(e) => handleInputChange('profile', 'website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'pushNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional and marketing emails</p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={settings.notifications.marketingEmails}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'marketingEmails', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="saleNotifications">Sale Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when your beats are sold</p>
                  </div>
                  <Switch
                    id="saleNotifications"
                    checked={settings.notifications.saleNotifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'saleNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="followerNotifications">Follower Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
                  </div>
                  <Switch
                    id="followerNotifications"
                    checked={settings.notifications.followerNotifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'followerNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="commentNotifications">Comment Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone comments on your beats</p>
                  </div>
                  <Switch
                    id="commentNotifications"
                    checked={settings.notifications.commentNotifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'commentNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary of your activity</p>
                  </div>
                  <Switch
                    id="weeklyDigest"
                    checked={settings.notifications.weeklyDigest}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'weeklyDigest', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                  </div>
                  <select
                    id="profileVisibility"
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleInputChange('privacy', 'profileVisibility', e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="followers">Followers Only</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showEmail">Show Email</Label>
                    <p className="text-sm text-muted-foreground">Display your email on your profile</p>
                  </div>
                  <Switch
                    id="showEmail"
                    checked={settings.privacy.showEmail}
                    onCheckedChange={(checked) => handleInputChange('privacy', 'showEmail', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showLocation">Show Location</Label>
                    <p className="text-sm text-muted-foreground">Display your location on your profile</p>
                  </div>
                  <Switch
                    id="showLocation"
                    checked={settings.privacy.showLocation}
                    onCheckedChange={(checked) => handleInputChange('privacy', 'showLocation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowMessages">Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">Allow other users to send you messages</p>
                  </div>
                  <Switch
                    id="allowMessages"
                    checked={settings.privacy.allowMessages}
                    onCheckedChange={(checked) => handleInputChange('privacy', 'allowMessages', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showOnlineStatus">Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">Display when you're online</p>
                  </div>
                  <Switch
                    id="showOnlineStatus"
                    checked={settings.privacy.showOnlineStatus}
                    onCheckedChange={(checked) => handleInputChange('privacy', 'showOnlineStatus', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowCollaborations">Allow Collaborations</Label>
                    <p className="text-sm text-muted-foreground">Allow other users to request collaborations</p>
                  </div>
                  <Switch
                    id="allowCollaborations"
                    checked={settings.privacy.allowCollaborations}
                    onCheckedChange={(checked) => handleInputChange('privacy', 'allowCollaborations', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <select
                    id="theme"
                    value={settings.appearance.theme}
                    onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    value={settings.appearance.language}
                    onChange={(e) => handleInputChange('appearance', 'language', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={settings.appearance.timezone}
                    onChange={(e) => handleInputChange('appearance', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Africa/Lagos">Africa/Lagos</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <select
                    id="dateFormat"
                    value={settings.appearance.dateFormat}
                    onChange={(e) => handleInputChange('appearance', 'dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <select
                    id="timeFormat"
                    value={settings.appearance.timeFormat}
                    onChange={(e) => handleInputChange('appearance', 'timeFormat', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={settings.security.twoFactorAuth ? "default" : "outline"}>
                      {settings.security.twoFactorAuth ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch
                      id="twoFactorAuth"
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => handleInputChange('security', 'twoFactorAuth', checked)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="loginAlerts">Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                  </div>
                  <Switch
                    id="loginAlerts"
                    checked={settings.security.loginAlerts}
                    onCheckedChange={(checked) => handleInputChange('security', 'loginAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                  </div>
                  <select
                    id="sessionTimeout"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requirePasswordChange">Require Password Change</Label>
                    <p className="text-sm text-muted-foreground">Force password change on next login</p>
                  </div>
                  <Switch
                    id="requirePasswordChange"
                    checked={settings.security.requirePasswordChange}
                    onCheckedChange={(checked) => handleInputChange('security', 'requirePasswordChange', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={settings.billing.currency}
                    onChange={(e) => handleInputChange('billing', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={settings.billing.taxId}
                    onChange={(e) => handleInputChange('billing', 'taxId', e.target.value)}
                    placeholder="Enter your tax ID"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={settings.billing.businessName}
                    onChange={(e) => handleInputChange('billing', 'businessName', e.target.value)}
                    placeholder="Enter your business name"
                  />
                </div>
              </div>
              <div>
                <Label className="text-base font-medium">Billing Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={settings.billing.address.street}
                      onChange={(e) => handleNestedInputChange('billing', 'address', 'street', e.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={settings.billing.address.city}
                      onChange={(e) => handleNestedInputChange('billing', 'address', 'city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={settings.billing.address.state}
                      onChange={(e) => handleNestedInputChange('billing', 'address', 'state', e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={settings.billing.address.zipCode}
                      onChange={(e) => handleNestedInputChange('billing', 'address', 'zipCode', e.target.value)}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={settings.billing.address.country}
                      onChange={(e) => handleNestedInputChange('billing', 'address', 'country', e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
