/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { 
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Save,
  X,
  Camera,
  MapPin,
  Globe,
  Phone,
  Briefcase,
  Heart,
  Music,
  Star,
  Users,
  Award,
  Clock,
  Eye,
  Download,
  Instagram,
  Twitter,
  Youtube,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface UserProfileProps {
  user: any;
  userDetails: any;
  stats: any;
  onRefresh: () => void;
  isLoading: boolean;
  onSaveUser?: (id: string, data: any) => Promise<void>;
  isSaving?: boolean;
}

export function UserProfile({ 
  user, 
  userDetails,
  stats,
  onRefresh,
  isLoading,
  onSaveUser, 
  isSaving = false 
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    country: user?.country || 'Nigeria',
    socialLinks: user?.socialLinks || {
      instagram: 'https://instagram.com/username',
      twitter: 'https://twitter.com/username',
      youtube: 'https://youtube.com/@username',
      soundcloud: 'https://soundcloud.com/username',
      spotify: 'https://open.spotify.com/artist/username'
    }
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusIcon = (user: any) => {
    if (!user?.isActive) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    if (!user?.isVerified) {
      return <AlertCircle className="h-5 w-5 text-warning" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getStatusText = (user: any) => {
    if (!user?.isActive) return 'Suspended';
    if (!user?.isVerified) return 'Unverified';
    return 'Active';
  };

  const getStatusVariant = (user: any) => {
    if (!user?.isActive) return 'destructive';
    if (!user?.isVerified) return 'secondary';
    return 'default';
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      country: user?.country || 'Nigeria',
      socialLinks: user?.socialLinks || {
        instagram: 'https://instagram.com/username',
        twitter: 'https://twitter.com/username',
        youtube: 'https://youtube.com/@username',
        soundcloud: 'https://soundcloud.com/username',
        spotify: 'https://open.spotify.com/artist/username'
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      country: user?.country || 'Nigeria',
      socialLinks: user?.socialLinks || {
        instagram: '',
        twitter: '',
        youtube: '',
        soundcloud: '',
        spotify: ''
      }
    });
  };

  const handleSave = async () => {
    try {
      if (onSaveUser) {
        await onSaveUser(user._id, editData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent" />
          <CardHeader className="relative z-10 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </span>
                Profile Information
              </CardTitle>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : onSaveUser ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEdit}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={`${user?.firstName || user?.username} avatar`}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-2xl font-medium text-muted-foreground">
                        {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                      </span>
                    )}
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    {user?.firstName && user?.lastName 
                      ? `${user?.firstName} ${user?.lastName}` 
                      : user?.username
                    }
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {getStatusIcon(user)}
                    <Badge variant={getStatusVariant(user)}>
                      {getStatusText(user)}
                    </Badge>
                    <Badge variant="secondary">
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={editData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={editData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Username</p>
                          <p className="text-sm text-muted-foreground">{user?.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Role</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Country</p>
                          <p className="text-sm text-muted-foreground">{user?.country || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Member Since</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Last Login</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.lastLogin 
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {user?.bio && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Bio</p>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={editData.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={editData.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={editData.socialLinks.youtube}
                  onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                  placeholder="Channel URL"
                />
              </div>
              <div>
                <Label htmlFor="soundcloud">SoundCloud</Label>
                <Input
                  id="soundcloud"
                  value={editData.socialLinks.soundcloud}
                  onChange={(e) => handleSocialLinkChange('soundcloud', e.target.value)}
                  placeholder="Profile URL"
                />
              </div>
              <div>
                <Label htmlFor="spotify">Spotify</Label>
                <Input
                  id="spotify"
                  value={editData.socialLinks.spotify}
                  onChange={(e) => handleSocialLinkChange('spotify', e.target.value)}
                  placeholder="Artist URL"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(user?.socialLinks || {}).map(([platform, url]) => {
                  const getPlatformIcon = (platform: string) => {
                    switch (platform.toLowerCase()) {
                      case 'instagram':
                        return <Instagram className="h-5 w-5" />;
                      case 'twitter':
                        return <Twitter className="h-5 w-5" />;
                      case 'youtube':
                        return <Youtube className="h-5 w-5" />;
                      case 'soundcloud':
                        return <Music className="h-5 w-5" />;
                      case 'spotify':
                        return <Music className="h-5 w-5" />;
                      default:
                        return <Globe className="h-5 w-5" />;
                    }
                  };

                  const getPlatformColor = (platform: string) => {
                    switch (platform.toLowerCase()) {
                      case 'instagram':
                        return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white';
                      case 'twitter':
                        return 'bg-blue-500 text-white';
                      case 'youtube':
                        return 'bg-red-500 text-white';
                      case 'soundcloud':
                        return 'bg-orange-500 text-white';
                      case 'spotify':
                        return 'bg-green-500 text-white';
                      default:
                        return 'bg-gray-500 text-white';
                    }
                  };

                  const hasUrl = typeof url === 'string' && url && url.trim() !== '';

                  return (
                    <div key={platform} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPlatformColor(platform)}`}>
                        {getPlatformIcon(platform)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{platform}</p>
                        {hasUrl ? (
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-blue-600 truncate">{url}</p>
                            <a 
                              href={url.startsWith('http') ? url : `https://${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">Not connected</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {Object.keys(user?.socialLinks || {}).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No social links added yet</p>
                  <p className="text-xs">Click "Edit Profile" to add your social media links</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
