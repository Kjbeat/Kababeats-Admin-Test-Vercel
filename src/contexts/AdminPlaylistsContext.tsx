import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { apiService } from '@/services/api';

export interface AdminPlaylist {
  id: string;
  _id?: string; 
  title: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  isCurated: boolean;
  curator: string;
  curatorName: string;
  trackCount: number;
  updatedAt: string;
  createdAt: string;
  tracks: Array<{
    id: string;
    title: string;
    producer: string;
    genre: string;
    bpm: number;
    artwork: string;
    storageKey: string;
    plays?: number;
    likes?: number;
    downloads?: number;
  }>;
}

export interface CreatePlaylistData {
  title: string;
  description?: string;
  coverImage?: string;
  isPublic?: boolean;
  trackIds?: string[];
}

export interface UpdatePlaylistData {
  title?: string;
  description?: string;
  coverImage?: string;
  isPublic?: boolean;
  trackIds?: string[];
}

export interface PlaylistFilters {
  search?: string;
  isPublic?: boolean;
  isCurated?: boolean;
  curator?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AdminPlaylistsContextType {
  playlists: AdminPlaylist[];
  isLoading: boolean;
  createPlaylist: (data: CreatePlaylistData) => Promise<AdminPlaylist | null>;
  updatePlaylist: (id: string, data: UpdatePlaylistData) => Promise<AdminPlaylist | null>;
  deletePlaylist: (id: string) => Promise<boolean>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<boolean>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<boolean>;
  getPlaylists: (filters?: PlaylistFilters) => Promise<void>;
  getPlaylistById: (id: string) => Promise<AdminPlaylist | null>;
  refreshPlaylists: () => Promise<void>;
}

const AdminPlaylistsContext = createContext<AdminPlaylistsContextType | undefined>(undefined);

export const useAdminPlaylists = () => {
  const context = useContext(AdminPlaylistsContext);
  if (!context) {
    throw new Error('useAdminPlaylists must be used within an AdminPlaylistsProvider');
  }
  return context;
};

interface AdminPlaylistsProviderProps {
  children: ReactNode;
}

export const AdminPlaylistsProvider: React.FC<AdminPlaylistsProviderProps> = ({ children }) => {
  const [playlists, setPlaylists] = useState<AdminPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const getPlaylists = useCallback(async (filters: PlaylistFilters = {}) => {
    try {
      setIsLoading(true);
      const cacheBuster = Date.now();
      const data = await apiService.get<AdminPlaylist[]>('/playlists/curated', { 
        ...filters, 
        _t: cacheBuster 
      });

      const mappedPlaylists = data.map((playlist: any) => ({
        id: playlist._id || playlist.id,
        title: playlist.title || '',
        description: playlist.description || '',
        coverImage: playlist.coverImage || '',
        isPublic: !!playlist.isPublic,
        isCurated: !!playlist.isCurated,
        curator: playlist.curator || '',
        curatorName: playlist.curatorName || '',
        trackCount: playlist.trackCount || playlist.tracks?.length || 0,
        updatedAt: playlist.updatedAt || playlist.updated_at || new Date().toISOString(),
        createdAt: playlist.createdAt || playlist.created_at || new Date().toISOString(),
        tracks: playlist.tracks || []
      }));

      setPlaylists(mappedPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({ title: "Error", description: "Failed to fetch playlists", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPlaylist = async (data: CreatePlaylistData): Promise<AdminPlaylist | null> => {
    try {
      setIsLoading(true);
      const newPlaylist = await apiService.post<AdminPlaylist>('/playlists', data);

      const normalizedPlaylist: AdminPlaylist = {
        ...newPlaylist,
        id: newPlaylist._id || newPlaylist.id,
        updatedAt: newPlaylist.updatedAt || new Date().toISOString(),
        createdAt: newPlaylist.createdAt || new Date().toISOString(),
        tracks: newPlaylist.tracks || [],
        isPublic: !!newPlaylist.isPublic,
        isCurated: !!newPlaylist.isCurated,
        curator: newPlaylist.curator || '',
        curatorName: newPlaylist.curatorName || '',
        trackCount: newPlaylist.trackCount || 0,
      };

      setPlaylists(prev => [normalizedPlaylist, ...prev]);
      toast({ title: "Playlist Created", description: `"${data.title}" has been created successfully.` });
      return normalizedPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({ title: "Error", description: "An error occurred while creating the playlist.", variant: "destructive" });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlaylist = async (id: string, data: UpdatePlaylistData): Promise<AdminPlaylist | null> => {
    try {
      setIsLoading(true);
      const updatedPlaylist = await apiService.put<AdminPlaylist>(`/playlists/${id}`, data);

      const normalized: AdminPlaylist = {
        ...updatedPlaylist,
        id: updatedPlaylist._id || updatedPlaylist.id,
        updatedAt: updatedPlaylist.updatedAt || new Date().toISOString(),
        createdAt: updatedPlaylist.createdAt || new Date().toISOString(),
        tracks: updatedPlaylist.tracks || [],
        isPublic: !!updatedPlaylist.isPublic,
        isCurated: !!updatedPlaylist.isCurated,
        curator: updatedPlaylist.curator || '',
        curatorName: updatedPlaylist.curatorName || '',
        trackCount: updatedPlaylist.trackCount || 0,
      };

      setPlaylists(prev => prev.map(playlist => 
        playlist.id === id ? normalized : playlist
      ));

      toast({
        title: "Playlist Updated",
        description: `"${data.title || 'Playlist'}" has been updated successfully.`
      });

      return normalized;
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast({
        title: "Error",
        description: "Failed to update playlist",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlaylist = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await apiService.delete(`/playlists/${id}`);

      setPlaylists(prev => prev.filter(playlist => playlist.id !== id));

      toast({
        title: "Playlist Deleted",
        description: "The playlist has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the playlist.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addTrackToPlaylist = async (playlistId: string, trackId: string): Promise<boolean> => {
    try {
      // Optimistic update
      setPlaylists(prev => prev.map(playlist => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            trackCount: playlist.trackCount + 1
          };
        }
        return playlist;
      }));

      const updatedPlaylist = await apiService.post<AdminPlaylist>(`/playlists/${playlistId}/tracks`, { trackId });

      // Re-normalize in case backend sends different shape
      const normalized = {
        ...updatedPlaylist,
        id: updatedPlaylist._id || updatedPlaylist.id,
        updatedAt: updatedPlaylist.updatedAt || new Date().toISOString(),
        createdAt: updatedPlaylist.createdAt || new Date().toISOString(),
        tracks: updatedPlaylist.tracks || [],
        isPublic: !!updatedPlaylist.isPublic,
        isCurated: !!updatedPlaylist.isCurated,
        curator: updatedPlaylist.curator || '',
        curatorName: updatedPlaylist.curatorName || '',
        trackCount: updatedPlaylist.trackCount || 0,
      };

      setPlaylists(prev => prev.map(p => p.id === playlistId ? normalized : p));

      toast({ title: "Track Added", description: "Track has been added to the playlist successfully." });
      return true;
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      // Revert optimistic update
      setPlaylists(prev => prev.map(playlist => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            trackCount: Math.max(0, playlist.trackCount - 1)
          };
        }
        return playlist;
      }));
      toast({
        title: "Error",
        description: `Failed to add track to playlist: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      return false;
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string): Promise<boolean> => {
    try {
      const updatedPlaylist = await apiService.delete<AdminPlaylist>(`/playlists/${playlistId}/tracks`, { data: { trackId } });

      const normalized = {
        ...updatedPlaylist,
        id: updatedPlaylist._id || updatedPlaylist.id,
        updatedAt: updatedPlaylist.updatedAt || new Date().toISOString(),
        createdAt: updatedPlaylist.createdAt || new Date().toISOString(),
        tracks: updatedPlaylist.tracks || [],
        isPublic: !!updatedPlaylist.isPublic,
        isCurated: !!updatedPlaylist.isCurated,
        curator: updatedPlaylist.curator || '',
        curatorName: updatedPlaylist.curatorName || '',
        trackCount: updatedPlaylist.trackCount || 0,
      };

      setPlaylists(prev => prev.map(p => p.id === playlistId ? normalized : p));

      toast({ title: "Track Removed", description: "Track has been removed from the playlist successfully." });
      return true;
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove track from playlist",
        variant: "destructive"
      });
      return false;
    }
  };

  const getPlaylistById = async (id: string): Promise<AdminPlaylist | null> => {
    try {
      const playlist = await apiService.get<AdminPlaylist>(`/playlists/${id}`);

      const normalized: AdminPlaylist = {
        ...playlist,
        id: playlist._id || playlist.id,
        updatedAt: playlist.updatedAt || new Date().toISOString(),
        createdAt: playlist.createdAt || new Date().toISOString(),
        tracks: playlist.tracks || [],
        isPublic: !!playlist.isPublic,
        isCurated: !!playlist.isCurated,
        curator: playlist.curator || '',
        curatorName: playlist.curatorName || '',
        trackCount: playlist.trackCount || 0,
      };

      return normalized;
    } catch (error) {
      console.error('Error fetching playlist:', error);
      toast({
        title: "Error",
        description: "Failed to fetch playlist",
        variant: "destructive"
      });
      return null;
    }
  };

  const refreshPlaylists = async () => {
    await getPlaylists();
  };

  useEffect(() => {
    if (user) {
      getPlaylists();
    }
  }, [user, getPlaylists]);

  return (
    <AdminPlaylistsContext.Provider value={{
      playlists,
      isLoading,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      getPlaylists,
      getPlaylistById,
      refreshPlaylists
    }}>
      {children}
    </AdminPlaylistsContext.Provider>
  );
};