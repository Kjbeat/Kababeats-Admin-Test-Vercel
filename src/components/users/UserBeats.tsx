/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  Music,
  Play,
  Download,
  Star,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';

interface UserBeatsProps {
  user: any;
  userDetails: any;
  stats: any;
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserBeats({ userDetails, stats }: UserBeatsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      published: "default",
      draft: "secondary",
      archived: "outline",
      scheduled: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"} className="capitalize">{status}</Badge>;
  };

  const getGenreBadge = (genre: string) => {
    const colors: Record<string, string> = { 
      "Hip Hop": "bg-blue-100 text-blue-800", 
      "Trap": "bg-green-100 text-green-800", 
      "R&B": "bg-purple-100 text-purple-800", 
      "Pop": "bg-yellow-100 text-yellow-800", 
      "EDM": "bg-pink-100 text-pink-800",
      "Jazz": "bg-orange-100 text-orange-800",
      "Rock": "bg-red-100 text-red-800"
    };
    return <Badge variant="outline" className={colors[genre] || ""}>{genre}</Badge>;
  };

  const filteredBeats = (userDetails?.beats || []).filter((beat: any) => {
    const matchesSearch = beat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beat.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter === 'all' || beat.genre === genreFilter;
    const matchesStatus = statusFilter === 'all' || beat.status === statusFilter;
    return matchesSearch && matchesGenre && matchesStatus;
  });

  const sortedBeats = [...filteredBeats].sort((a: any, b: any) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'title':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'plays':
        aValue = a.plays || 0;
        bValue = b.plays || 0;
        break;
      case 'sales':
        aValue = a.sales || 0;
        bValue = b.sales || 0;
        break;
      case 'price':
        aValue = a.basePrice || 0;
        bValue = b.basePrice || 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleExport = useCallback(() => {
    // TODO: Implement CSV export
    console.log('Exporting beats data...');
  }, []);

  const handleBeatAction = useCallback((action: string, beatId: string) => {
    // TODO: Implement beat actions
    console.log(`${action} beat ${beatId}`);
  }, []);

  return (
    <div className="space-y-6">
      {/* Beats Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Beats</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.totalBeats || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Plays</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.totalPlays || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.totalDownloads || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">{(stats?.averageRating || 0).toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search beats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                <SelectItem value="Trap">Trap</SelectItem>
                <SelectItem value="R&B">R&B</SelectItem>
                <SelectItem value="Pop">Pop</SelectItem>
                <SelectItem value="EDM">EDM</SelectItem>
                <SelectItem value="Jazz">Jazz</SelectItem>
                <SelectItem value="Rock">Rock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="plays">Plays</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Beats Table */}
      <Card>
        <CardHeader>
          <CardTitle>User's Beats ({filteredBeats.length} beats)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sortedBeats.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beat</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>BPM / Key</TableHead>
                    <TableHead className="text-right">Plays</TableHead>
                    <TableHead className="text-right">Downloads</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBeats.map((beat: any) => (
                    <TableRow key={beat._id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
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
                          <div>
                            <p className="font-medium text-foreground">{beat.title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {beat.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getGenreBadge(beat.genre || 'Unknown')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{beat.bpm || 'N/A'} BPM</p>
                          <p className="text-muted-foreground">{beat.key || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Play className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{formatNumber(beat.plays || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Download className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{formatNumber(beat.downloads || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="font-medium text-green-600">{formatNumber(beat.sales || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">{formatCurrency(beat.basePrice || 0)}</p>
                          {beat.salePrice && beat.salePrice !== beat.basePrice && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatCurrency(beat.salePrice)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(beat.status || 'Unknown')}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(beat.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <DropdownMenuItem onClick={() => handleBeatAction('view', beat._id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBeatAction('edit', beat._id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Beat
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleBeatAction('delete', beat._id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Beat
                            </DropdownMenuItem>
                          </div>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Beats Found</h3>
              <p className="text-muted-foreground">This user hasn't uploaded any beats yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
