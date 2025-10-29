/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { 
  User,
  Mail,
  Shield,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserSettingsProps {
  user: any;
  userDetails: any;
  stats: any;
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserSettings({ user }: UserSettingsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Profile Settings
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    
    // Privacy Settings
    profilePublic: true,
    showSales: false,
    showEarnings: false,
    allowMessages: true,
    showOnlineStatus: true,
    
    // Notification Settings
    emailSales: true,
    emailComments: false,
    emailFollowers: true,
    pushSales: true,
    pushComments: false,
    pushFollowers: true,
    weeklyReport: true,
    monthlyReport: true,
  });

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save settings API call
      console.log('Saving settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusBadge = (user: any) => {
    if (!user?.isActive) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (!user?.isVerified) {
      return <Badge variant="secondary">Unverified</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* User Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {user?.isActive ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Account Status</p>
                <div className="mt-1">
                  {getStatusBadge(user)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Email Verification</p>
                <div className="mt-1">
                  <Badge variant={user?.isVerified ? 'default' : 'secondary'}>
                    {user?.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">User Role</p>
                <div className="mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {user?.role || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={settings.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={settings.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={settings.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={settings.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to view your profile and beats
                    </p>
                  </div>
                  <Switch
                    checked={settings.profilePublic}
                    onCheckedChange={(checked) => handleInputChange('profilePublic', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Sales Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your sales statistics publicly
                    </p>
                  </div>
                  <Switch
                    checked={settings.showSales}
                    onCheckedChange={(checked) => handleInputChange('showSales', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Earnings</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your earnings publicly
                    </p>
                  </div>
                  <Switch
                    checked={settings.showEarnings}
                    onCheckedChange={(checked) => handleInputChange('showEarnings', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Let other users send you messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMessages}
                    onCheckedChange={(checked) => handleInputChange('allowMessages', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Display when you're online
                    </p>
                  </div>
                  <Switch
                    checked={settings.showOnlineStatus}
                    onCheckedChange={(checked) => handleInputChange('showOnlineStatus', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sales Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone purchases your beats</p>
                    </div>
                    <Switch
                      checked={settings.emailSales}
                      onCheckedChange={(checked) => handleInputChange('emailSales', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Comment Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone comments on your beats</p>
                    </div>
                    <Switch
                      checked={settings.emailComments}
                      onCheckedChange={(checked) => handleInputChange('emailComments', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Follower Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
                    </div>
                    <Switch
                      checked={settings.emailFollowers}
                      onCheckedChange={(checked) => handleInputChange('emailFollowers', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Change Password</Label>
                <div className="flex space-x-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                />
              </div>
              <Button variant="outline" size="sm">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
