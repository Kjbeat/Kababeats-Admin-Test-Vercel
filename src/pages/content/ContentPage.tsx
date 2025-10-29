import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Music, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Eye, 
  EyeOff,
  MoreHorizontal,
  Search,
  Grid3X3,
  List,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreateCuratedPlaylistModal } from '@/components/playlist/CreateCuratedPlaylistModal';
import { useAdminPlaylists, AdminPlaylist, CreatePlaylistData } from '@/contexts/AdminPlaylistsContext';
import { useAuth } from '@/contexts/AuthContext';

export function ContentPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<AdminPlaylist | null>(null);

  const { 
    playlists, 
    isLoading, 
    createPlaylist, 
    updatePlaylist, 
    deletePlaylist,
    refreshPlaylists
  } = useAdminPlaylists();

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Debug: Log playlists data
  console.log('ContentPage - playlists:', playlists);
  console.log('ContentPage - isLoading:', isLoading);
  console.log('ContentPage - playlists length:', playlists.length);
  console.log('ContentPage - user:', user);
  console.log('ContentPage - isAuthenticated:', isAuthenticated);
  console.log('ContentPage - authLoading:', authLoading);


  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (playlist.description && playlist.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGenre = !selectedGenre || (playlist.tracks && playlist.tracks.length > 0 && playlist.tracks.some(track => track.genre === selectedGenre));
    return matchesSearch && matchesGenre;
  });

  const genres = [...new Set(playlists.flatMap(playlist => 
    playlist.tracks && playlist.tracks.length > 0 ? playlist.tracks.map(track => track.genre) : []
  ))];

const handleCreatePlaylist = async (playlistData: CreatePlaylistData) => {
    try {
      console.log('ContentPage - Creating playlist:', playlistData);
      await createPlaylist(playlistData); // On attend la création
      
      // Si la ligne ci-dessus n'a pas planté, la création a réussi.
      // On rafraîchit la liste immédiatement.
      console.log('ContentPage - Playlist created successfully. Refreshing list...');
      await refreshPlaylists();

    } catch (error) {
      console.error("Failed to create playlist:", error);
    } finally {
      
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditPlaylist = (playlist: AdminPlaylist) => {
    setEditingPlaylist(playlist);
  };

  const handleUpdatePlaylist = async (playlistId: string, data: Partial<AdminPlaylist>) => {
  try {
    await updatePlaylist(playlistId, data);
    await refreshPlaylists();
  } catch (error) {
    console.error("Failed to update playlist:", error);
  } finally {
    setEditingPlaylist(null);
  }
};

  const handleDeletePlaylist = async (playlistId: string) => {
    await deletePlaylist(playlistId);
          await refreshPlaylists(); 
  };

  const togglePlaylistVisibility = async (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      await updatePlaylist(playlistId, { isPublic: !playlist.isPublic });
      await refreshPlaylists(); 
    }
  };

  const handlePlaylistClick = (playlistId: string) => {
    console.log('ContentPage - Navigating to playlist detail:', playlistId);
    navigate(`/content/${playlistId}`);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Curated Playlists</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage curated playlists from platform beats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {playlists.length} playlists
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Playlist
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search playlists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="">All Genres</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Playlists */}
      {authLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading authentication...</span>
        </div>
      ) : !isAuthenticated ? (
        <div className="text-center py-12">
          <Music className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">Authentication Required</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please log in to view curated playlists.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading playlists...</span>
        </div>
      ) : filteredPlaylists.length === 0 ? (
        <div className="text-center py-12">
          <Music className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">No playlists found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {playlists.length === 0 
              ? "Create your first curated playlist to get started."
              : "Try adjusting your search criteria or filters."
            }
          </p>
          {playlists.length === 0 && (
            <div className="mt-6">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredPlaylists.map((playlist) => (
            <Card 
              key={playlist.id} 
              className="group hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePlaylistClick(playlist.id)}
            >
              <CardContent className="p-0">
                {/* Playlist Cover */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {playlist.coverImage ? (
                    <img
                      src={playlist.coverImage}
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                  ) : playlist.tracks && playlist.tracks.length > 0 && playlist.tracks[0].artwork ? (
                    <img
                      src={playlist.tracks[0].artwork}
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/5">
                      <Music className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="w-16 h-16 rounded-full bg-white/90 text-black hover:bg-white"
                    >
                      <Play className="h-6 w-6 ml-1" fill="currentColor" />
                    </Button>
                  </div>

                  {/* Visibility Toggle */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlaylistVisibility(playlist.id);
                    }}
                  >
                    {playlist.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Playlist Info */}
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{playlist.title}</h3>
                      <Badge variant={playlist.isPublic ? 'default' : 'secondary'}>
                        {playlist.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {playlist.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{playlist.trackCount} tracks</span>
                      <span>{new Date(playlist.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPlaylist(playlist)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Playlist
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeletePlaylist(playlist.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Playlist
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Curated Playlist Modal */}
      <CreateCuratedPlaylistModal
  isOpen={isCreateDialogOpen || !!editingPlaylist}
  onOpenChange={(open) => {
    if (!open) {
      setIsCreateDialogOpen(false);
      setEditingPlaylist(null);
    }
  }}
  onCreatePlaylist={handleCreatePlaylist}
  onUpdatePlaylist={handleUpdatePlaylist}
  playlistToEdit={editingPlaylist}
/>
    </div>
  );
}
