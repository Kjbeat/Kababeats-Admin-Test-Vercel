/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  Music,
  ShoppingCart,
  Download,
  CreditCard,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Play,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';

interface UserLibraryProps {
  user: any;
  userDetails: any;
  stats: any;
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserLibrary({ user, userDetails, stats, onRefresh, isLoading }: UserLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('purchaseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      purchase: "default",
      free_download: "secondary",
      subscription: "outline",
    };
    return <Badge variant={variants[type] || "secondary"} className="capitalize">
      {type?.replace('_', ' ') || 'Unknown'}
    </Badge>;
  };

  const filteredLibrary = (userDetails?.library || []).filter((item: any) => {
    const matchesSearch = item.beatTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.beatProducer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.purchaseType === typeFilter;
    return matchesSearch && matchesType;
  });

  const sortedLibrary = [...filteredLibrary].sort((a: any, b: any) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'beatTitle':
        aValue = a.beatTitle?.toLowerCase() || '';
        bValue = b.beatTitle?.toLowerCase() || '';
        break;
      case 'purchaseDate':
        aValue = new Date(a.purchaseDate).getTime();
        bValue = new Date(b.purchaseDate).getTime();
        break;
      case 'downloadCount':
        aValue = a.downloadCount || 0;
        bValue = b.downloadCount || 0;
        break;
      case 'lastPlayed':
        aValue = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
        bValue = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
        break;
      default:
        aValue = new Date(a.purchaseDate).getTime();
        bValue = new Date(b.purchaseDate).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleExport = useCallback(() => {
    // TODO: Implement CSV export
    console.log('Exporting library data...');
  }, []);

  const handleLibraryAction = useCallback((action: string, itemId: string) => {
    // TODO: Implement library actions
    console.log(`${action} library item ${itemId}`);
  }, []);

  const libraryStats = {
    total: userDetails?.library?.length || 0,
    purchases: userDetails?.library?.filter((item: any) => item.purchaseType === 'purchase').length || 0,
    freeDownloads: userDetails?.library?.filter((item: any) => item.purchaseType === 'free_download').length || 0,
    subscriptions: userDetails?.library?.filter((item: any) => item.purchaseType === 'subscription').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Library Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{formatNumber(libraryStats.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchases</p>
                <p className="text-2xl font-bold">{formatNumber(libraryStats.purchases)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Free Downloads</p>
                <p className="text-2xl font-bold">{formatNumber(libraryStats.freeDownloads)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscriptions</p>
                <p className="text-2xl font-bold">{formatNumber(libraryStats.subscriptions)}</p>
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
                placeholder="Search library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="free_download">Free Downloads</SelectItem>
                <SelectItem value="subscription">Subscriptions</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchaseDate">Purchase Date</SelectItem>
                <SelectItem value="beatTitle">Beat Title</SelectItem>
                <SelectItem value="downloadCount">Downloads</SelectItem>
                <SelectItem value="lastPlayed">Last Played</SelectItem>
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

      {/* Library Table */}
      <Card>
        <CardHeader>
          <CardTitle>User's Library ({filteredLibrary.length} items)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sortedLibrary.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beat</TableHead>
                    <TableHead>Producer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Downloads</TableHead>
                    <TableHead>Last Played</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLibrary.map((item: any) => (
                    <TableRow key={item._id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
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
                            <p className="font-medium text-foreground">{item.beatTitle}</p>
                            <p className="text-sm text-muted-foreground">Beat ID: {item.beatId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{item.beatProducer}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(item.purchaseType)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Download className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{formatNumber(item.downloadCount || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Play className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {item.lastPlayed ? 
                              format(new Date(item.lastPlayed), 'MMM dd, yyyy') : 
                              'Never'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(item.purchaseDate), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(item.purchaseDate), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <DropdownMenuItem onClick={() => handleLibraryAction('view', item._id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Beat
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleLibraryAction('download', item._id)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleLibraryAction('play', item._id)}>
                            <Play className="mr-2 h-4 w-4" />
                            Play Now
                          </DropdownMenuItem>
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
              <h3 className="text-lg font-semibold mb-2">No Library Items Found</h3>
              <p className="text-muted-foreground">This user hasn't purchased or downloaded any beats yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
