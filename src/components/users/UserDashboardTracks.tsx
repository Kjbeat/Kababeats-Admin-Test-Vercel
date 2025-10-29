/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { 
  Music,
  Play,
  Download,
  Heart,
  MoreVertical,
  Edit,
  Trash2,
  Share,
  Star,
  Search,
  Upload,
  RefreshCw,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserDashboardTracksProps {
  user: any;
  userDetails: any;
  stats: any;
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserDashboardTracks({ onRefresh, isLoading }: UserDashboardTracksProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Mock tracks data
  const tracksData = {
    all: [
      {
        id: '1',
        title: 'Midnight Vibes',
        description: 'A smooth and atmospheric beat perfect for late-night sessions',
        artwork: null,
        bpm: 140,
        key: 'C# Minor',
        genre: 'Hip Hop',
        mood: 'Dark',
        tags: ['dark', 'atmospheric', 'hip-hop'],
        basePrice: 25.00,
        salePrice: null,
        isExclusive: false,
        status: 'published',
        plays: 1250,
        likes: 45,
        downloads: 12,
        sales: 8,
        rating: 4.8,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
        duration: '3:24'
      },
      {
        id: '2',
        title: 'Urban Dreams',
        description: 'An energetic trap beat with heavy 808s and melodic elements',
        artwork: null,
        bpm: 150,
        key: 'F# Major',
        genre: 'Trap',
        mood: 'Energetic',
        tags: ['trap', 'energetic', '808'],
        basePrice: 30.00,
        salePrice: 20.00,
        isExclusive: false,
        status: 'published',
        plays: 980,
        likes: 32,
        downloads: 8,
        sales: 5,
        rating: 4.6,
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-11T00:00:00Z',
        duration: '2:45'
      },
      {
        id: '3',
        title: 'Summer Vibes',
        description: 'A bright and uplifting beat perfect for summer tracks',
        artwork: null,
        bpm: 120,
        key: 'G Major',
        genre: 'Pop',
        mood: 'Happy',
        tags: ['pop', 'summer', 'uplifting'],
        basePrice: 35.00,
        salePrice: null,
        isExclusive: true,
        status: 'published',
        plays: 2100,
        likes: 67,
        downloads: 15,
        sales: 12,
        rating: 4.9,
        createdAt: '2025-01-03T00:00:00Z',
        updatedAt: '2025-01-12T00:00:00Z',
        duration: '3:12'
      },
      {
        id: '4',
        title: 'Dark Forest',
        description: 'A mysterious and haunting beat with cinematic elements',
        artwork: null,
        bpm: 90,
        key: 'A Minor',
        genre: 'Cinematic',
        mood: 'Mysterious',
        tags: ['cinematic', 'mysterious', 'dark'],
        basePrice: 40.00,
        salePrice: null,
        isExclusive: false,
        status: 'draft',
        plays: 0,
        likes: 0,
        downloads: 0,
        sales: 0,
        rating: 0,
        createdAt: '2025-01-05T00:00:00Z',
        updatedAt: '2025-01-05T00:00:00Z',
        duration: '4:15'
      }
    ],
    published: [],
    drafts: [],
    archived: []
  };

  // Filter tracks based on active tab
  const filteredTracks = tracksData[activeTab as keyof typeof tracksData] || tracksData.all;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      published: "default",
      draft: "outline",
      archived: "secondary",
      scheduled: "outline",
    };
    const labels: Record<string, string> = {
      published: 'Published',
      draft: 'Draft',
      archived: 'Archived',
      scheduled: 'Scheduled',
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      'Hip Hop': 'bg-blue-100 text-blue-800',
      'Trap': 'bg-purple-100 text-purple-800',
      'Pop': 'bg-pink-100 text-pink-800',
      'Cinematic': 'bg-gray-100 text-gray-800',
      'R&B': 'bg-red-100 text-red-800',
      'Electronic': 'bg-green-100 text-green-800',
    };
    return colors[genre] || 'bg-gray-100 text-gray-800';
  };

  const handlePlayTrack = useCallback((trackId: string) => {
    // TODO: Implement play track
    console.log('Playing track:', trackId);
  }, []);

  const handleEditTrack = useCallback((trackId: string) => {
    // TODO: Implement edit track
    console.log('Editing track:', trackId);
  }, []);

  const handleDeleteTrack = useCallback((trackId: string) => {
    // TODO: Implement delete track
    console.log('Deleting track:', trackId);
  }, []);

  const handleShareTrack = useCallback((trackId: string) => {
    // TODO: Implement share track
    console.log('Sharing track:', trackId);
  }, []);

  const handleUploadTrack = useCallback(() => {
    // TODO: Implement upload track
    console.log('Uploading new track...');
  }, []);

  const handleSelectTrack = useCallback((trackId: string) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedTracks.length === filteredTracks.length) {
      setSelectedTracks([]);
    } else {
      setSelectedTracks(filteredTracks.map(track => track.id));
    }
  }, [selectedTracks.length, filteredTracks]);

  const sortTracks = (tracks: any[]) => {
    return [...tracks].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const sortedTracks = sortTracks(filteredTracks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Tracks</h2>
          <p className="text-muted-foreground">Manage your beats and tracks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleUploadTrack}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Track
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="createdAt">Date Created</option>
                <option value="updatedAt">Last Updated</option>
                <option value="title">Title</option>
                <option value="plays">Plays</option>
                <option value="sales">Sales</option>
                <option value="rating">Rating</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Tracks</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTracks.map((track) => (
                <Card key={track.id} className="overflow-hidden">
                  <div className="relative">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {track.artwork ? (
                        <img
                          src={track.artwork}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <DropdownMenu
                        trigger={
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                          <DropdownMenuItem onClick={() => handlePlayTrack(track.id)}>
                            <Play className="mr-2 h-4 w-4" />
                            Play
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTrack(track.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareTrack(track.id)}>
                            <Share className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTrack(track.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        {getStatusBadge(track.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{track.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getGenreColor(track.genre)}>
                          {track.genre}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{track.bpm} BPM</span>
                        <span className="text-xs text-muted-foreground">{track.key}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {formatNumber(track.plays)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {formatNumber(track.downloads)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {formatNumber(track.likes)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {track.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {track.salePrice ? (
                            <>
                              <span className="line-through text-muted-foreground">{formatCurrency(track.basePrice)}</span>
                              <span className="ml-2 text-green-600">{formatCurrency(track.salePrice)}</span>
                            </>
                          ) : (
                            formatCurrency(track.basePrice)
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">{track.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tracks</CardTitle>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTracks.length === filteredTracks.length && filteredTracks.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                    <span className="text-sm text-muted-foreground">Select All</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Track</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plays</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTracks.map((track) => (
                      <TableRow key={track.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedTracks.includes(track.id)}
                            onChange={() => handleSelectTrack(track.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <Music className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{track.title}</p>
                              <p className="text-sm text-muted-foreground">{track.duration}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getGenreColor(track.genre)}>
                            {track.genre}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(track.status)}</TableCell>
                        <TableCell>{formatNumber(track.plays)}</TableCell>
                        <TableCell>{formatNumber(track.downloads)}</TableCell>
                        <TableCell>{formatNumber(track.sales)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {track.rating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {track.salePrice ? (
                            <>
                              <span className="line-through text-muted-foreground text-xs">{formatCurrency(track.basePrice)}</span>
                              <br />
                              <span className="text-green-600 font-semibold">{formatCurrency(track.salePrice)}</span>
                            </>
                          ) : (
                            formatCurrency(track.basePrice)
                          )}
                        </TableCell>
                        <TableCell>{new Date(track.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu
                            trigger={
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            }
                          >
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                              <DropdownMenuItem onClick={() => handlePlayTrack(track.id)}>
                                <Play className="mr-2 h-4 w-4" />
                                Play
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTrack(track.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShareTrack(track.id)}>
                                <Share className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTrack(track.id)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </div>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
