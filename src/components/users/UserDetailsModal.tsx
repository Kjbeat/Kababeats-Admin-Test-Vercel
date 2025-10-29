/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Mail, 
  Calendar, 
  Shield, 
  User as UserIcon, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Music,
  Download,
  Users,
  Star,
  ShoppingCart,
  FolderOpen,
  Eye,
  X,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Badge } from '@/components/ui/badge';
  import { Avatar } from '@/components/ui/avatar';
  import { Button } from '@/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/types';
import { useUserDetails } from '@/hooks/useUsers';

interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (user: User) => void;
  onSuspend?: (user: User) => void;
  onActivate?: (user: User) => void;
}

export function UserDetailsModal({
  user,
  open,
  onOpenChange,
  onEdit,
  onSuspend,
  onActivate,
}: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['stats', 'recent']));

  const { data: userDetails, isLoading } = useUserDetails(user?._id || '');

  if (!user) return null;

  const getStatusIcon = (user: User) => {
    if (!user.isActive) {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    if (!user.isVerified) {
      return <AlertCircle className="h-5 w-5 text-warning" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getStatusText = (user: User) => {
    if (!user.isActive) return 'Suspended';
    if (!user.isVerified) return 'Unverified';
    return 'Active';
  };

  const getStatusVariant = (user: User) => {
    if (!user.isActive) return 'destructive';
    if (!user.isVerified) return 'secondary';
    return 'default';
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const stats = (userDetails as any)?.stats || {
    totalSales: 0,
    totalRevenue: 0,
    totalBeats: 0,
    totalPlaylists: 0,
    totalLibraryItems: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    averageRating: 0,
    totalPlays: 0,
    totalDownloads: 0,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {user.avatar ? (
                <img src={user.avatar} alt={`${user.firstName || user.username} avatar`} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground">
                  {user.firstName?.[0] || user.username[0] || 'U'}
                </span>
              )}
            </Avatar>
            <div className="space-y-2">
              <DialogTitle className="text-2xl">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.username
                }
              </DialogTitle>
              <div className="flex items-center space-x-2">
                {getStatusIcon(user)}
                <Badge variant={getStatusVariant(user)}>
                  {getStatusText(user)}
                </Badge>
                <Badge variant="secondary">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="beats">Beats</TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                          <p className="text-2xl font-bold">{formatNumber(stats.totalSales)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Music className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Beats</p>
                          <p className="text-2xl font-bold">{formatNumber(stats.totalBeats)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Followers</p>
                          <p className="text-2xl font-bold">{formatNumber(stats.totalFollowers)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Basic Information</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection('basic')}
                      >
                        {expandedSections.has('basic') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.has('basic') && (
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Email</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Username</p>
                              <p className="text-sm text-muted-foreground">{user.username}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Role</p>
                              <p className="text-sm text-muted-foreground">
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Account Status</span>
                            <Badge variant={getStatusVariant(user)}>
                              {getStatusText(user)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Email Verified</span>
                            <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                              {user.isVerified ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Account Active</span>
                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                              {user.isActive ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Activity Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Activity</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection('activity')}
                      >
                        {expandedSections.has('activity') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  {expandedSections.has('activity') && (
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Last Login</p>
                              <p className="text-sm text-muted-foreground">
                                {user.lastLogin 
                                  ? format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm')
                                  : 'Never'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Account Created</p>
                              <p className="text-sm text-muted-foreground">
                                {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Last Updated</p>
                              <p className="text-sm text-muted-foreground">
                                {user.updatedAt ? format(new Date(user.updatedAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Total Plays</p>
                              <p className="text-sm text-muted-foreground">{formatNumber(stats.totalPlays)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Download className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Total Downloads</p>
                              <p className="text-sm text-muted-foreground">{formatNumber(stats.totalDownloads)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Star className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Average Rating</p>
                              <p className="text-sm text-muted-foreground">{stats.averageRating.toFixed(1)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="sales" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">Loading sales data...</div>
                    ) : (userDetails as any)?.sales?.length ? (
                      <div className="space-y-4">
                        {(userDetails as any).sales.map((sale: any) => (
                          <div key={sale._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <Music className="h-8 w-8 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{sale.beatTitle}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(sale.createdAt), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(sale.amount)}</p>
                              <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                                {sale.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No sales found</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="beats" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User's Beats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">Loading beats data...</div>
                    ) : (userDetails as any)?.beats?.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(userDetails as any).beats.map((beat: any) => (
                          <div key={beat._id} className="border rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              {beat.artwork ? (
                                <img 
                                  src={beat.artwork} 
                                  alt={beat.title}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                  <Music className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{beat.title}</p>
                                <p className="text-sm text-muted-foreground">{beat.genre}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>BPM: {beat.bpm}</span>
                                <span>Key: {beat.key}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Plays: {formatNumber(beat.plays)}</span>
                                <span>Sales: {formatNumber(beat.sales)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Price: {formatCurrency(beat.basePrice)}</span>
                                <Badge variant={beat.status === 'published' ? 'default' : 'secondary'}>
                                  {beat.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No beats found</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="playlists" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User's Playlists</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">Loading playlists data...</div>
                    ) : (userDetails as any)?.playlists?.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(userDetails as any).playlists.map((playlist: any) => (
                          <div key={playlist._id} className="border rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              {playlist.coverImage ? (
                                <img 
                                  src={playlist.coverImage} 
                                  alt={playlist.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                  <FolderOpen className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{playlist.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {playlist.isPublic ? 'Public' : 'Private'}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Beats: {playlist.beatCount}</span>
                                <span>Plays: {formatNumber(playlist.totalPlays)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Likes: {formatNumber(playlist.totalLikes)}</span>
                                <span>Created: {format(new Date(playlist.createdAt), 'MMM dd, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No playlists found</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="library" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User's Library</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">Loading library data...</div>
                    ) : (userDetails as any)?.library?.length ? (
                      <div className="space-y-4">
                        {(userDetails as any).library.map((item: any) => (
                          <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              {item.beatArtwork ? (
                                <img 
                                  src={item.beatArtwork} 
                                  alt={item.beatTitle}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                  <Music className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{item.beatTitle}</p>
                                <p className="text-sm text-muted-foreground">by {item.beatProducer}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={item.purchaseType === 'purchase' ? 'default' : 'secondary'}>
                                {item.purchaseType.replace('_', ' ')}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(item.purchaseDate), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No library items found</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {onEdit && (
            <Button onClick={() => onEdit(user)}>
              Edit User
            </Button>
          )}
          {user.isActive ? (
            onSuspend && (
              <Button 
                variant="destructive" 
                onClick={() => onSuspend(user)}
              >
                Suspend User
              </Button>
            )
          ) : (
            onActivate && (
              <Button 
                variant="default" 
                onClick={() => onActivate(user)}
              >
                Activate User
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}