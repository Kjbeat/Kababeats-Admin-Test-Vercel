import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Music, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Grid3X3,
  List,
  Plus,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useBeats } from '@/hooks/useBeats';
import { Beat, BeatFilters } from '@/types';
import { getBeatArtworkUrl, getPlaceholderImageUrl } from '@/utils/imageUtils';

export function BeatsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [bpmRange, setBpmRange] = useState({ min: 0, max: 200 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [playlists, setPlaylists] = useState<Array<{id: string, title: string}>>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [selectedBeatForPlaylist, setSelectedBeatForPlaylist] = useState<string | null>(null);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastNonZero = useRef(volume || 0.7);
  const hideTimer = useRef<number | null>(null);

  // API filters
  const filters: BeatFilters = {
    search: searchTerm,
    genre: selectedGenre || undefined,
    status: undefined, // Remove status filtering for now
    page: 1,
    limit: 100
  };

  // Fetch beats from API
  const { data: beatsData, isLoading, error } = useBeats(filters);

  // Extract beats from API response
  const beats = useMemo(() => {
    return Array.isArray(beatsData) ? beatsData : (beatsData as { data?: Beat[] })?.data || [];
  }, [beatsData]);
  const [filteredBeats, setFilteredBeats] = useState<Beat[]>([]);

  // Mock playlists - you might want to fetch these from API too
  useEffect(() => {
    const mockPlaylists = [
      { id: '1', title: 'Hip Hop Collection' },
      { id: '2', title: 'Trap Beats' },
      { id: '3', title: 'Chill Vibes' },
      { id: '4', title: 'Drill Type Beats' }
    ];
    setPlaylists(mockPlaylists);
  }, []);

  // Filter and search logic
  useEffect(() => {
    if (!beats || !Array.isArray(beats)) {
      setFilteredBeats([]);
      return;
    }

    const filtered = beats.filter(beat => {
      const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (beat.owner?.username || beat.owner?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = !selectedGenre || beat.genre === selectedGenre;
      const matchesLicense = !selectedLicense || (beat.isExclusive ? 'Exclusive' : 'Non-Exclusive') === selectedLicense;
      const matchesBpm = beat.bpm >= bpmRange.min && beat.bpm <= bpmRange.max;
      
      return matchesSearch && matchesGenre && matchesLicense && matchesBpm;
    });

    // Sort logic
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'popularity':
          comparison = (a.plays + a.likes) - (b.plays + b.likes);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'producer':
          comparison = (a.owner?.username || a.owner?.email || '').localeCompare(b.owner?.username || b.owner?.email || '');
          break;
        case 'bpm':
          comparison = a.bpm - b.bpm;
          break;
        case 'plays':
          comparison = a.plays - b.plays;
          break;
        case 'downloads':
          comparison = a.downloads - b.downloads;
          break;
        case 'uploadDate':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredBeats(filtered);
  }, [beats, searchTerm, selectedGenre, selectedLicense, bpmRange, sortBy, sortOrder]);

  const genres = useMemo(() => {
    return [...new Set(beats.map((beat: Beat) => beat.genre).filter(Boolean))];
  }, [beats]);
  const licenses = ['Exclusive', 'Non-Exclusive'];

  const toggleBeatVisibility = (beatId: string) => {
    // This would need to be implemented with an API call to update beat status
    console.log('Toggle visibility for beat:', beatId);
  };

  const playBeat = (beat: Beat) => {
    if (currentlyPlaying === beat._id && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.src = beat.audioFile || '';
        audioRef.current.play();
        setCurrentlyPlaying(beat._id);
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };


  // Volume control functions exactly like VolumeControl.tsx
  useEffect(() => {
    if (volume > 0) lastNonZero.current = volume;
  }, [volume]);

  const handleToggleMute = () => {
    if (volume === 0) {
      handleVolumeChange(lastNonZero.current || 0.7);
    } else {
      handleVolumeChange(0);
    }
  };

  const changeVolume = (delta: number, fine = false) => {
    const step = fine ? 0.01 : 0.05;
    let next = volume + (delta * step);
    next = Math.min(1, Math.max(0, next));
    handleVolumeChange(Number(next.toFixed(3)));
  };

  const onWheel: React.WheelEventHandler = (e) => {
    e.preventDefault();
    const fine = e.shiftKey;
    changeVolume(e.deltaY < 0 ? 1 : -1, fine);
  };

  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); changeVolume(1, e.shiftKey); }
    if (e.key === 'ArrowDown') { e.preventDefault(); changeVolume(-1, e.shiftKey); }
    if (e.key === 'm' || e.key === 'M') { e.preventDefault(); handleToggleMute(); }
  };

  // Open on hover
  const handleMouseEnter = () => setVolumeOpen(true);
  const handleMouseLeave = (e: React.MouseEvent) => {
    if (containerRef.current && containerRef.current.contains(e.relatedTarget as Node)) return;
    setVolumeOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!volumeOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setVolumeOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [volumeOpen]);

  const triggerShowValue = React.useCallback(() => {
    setShowValue(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowValue(false), 900);
  }, []);

  useEffect(() => () => { if (hideTimer.current) window.clearTimeout(hideTimer.current); }, []);

  // Time formatting function
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentlyPlaying(null);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentlyPlaying]);

  // VolumeBubble component exactly like VolumeControl.tsx
  const VolumeBubble: React.FC<{ volume: number }> = ({ volume }) => {
    const pct = Math.min(100, Math.max(0, volume * 100));
    const clamped = pct > 98 ? 98 : pct < 2 ? 2 : pct;
    return (
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none px-2 py-0.5 rounded-full bg-foreground text-background text-[10px] font-semibold shadow shadow-black/30 animate-in fade-in zoom-in-95"
        style={{ bottom: `calc(${clamped}% - 6px)` }}
      >
        {Math.round(pct)}%
        <span className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-foreground -bottom-1 rounded-[2px]" />
      </div>
    );
  };


  const handleAddToPlaylist = (playlistId: string, beatId: string) => {
    // Add beat to playlist logic here
    console.log(`Adding beat ${beatId} to playlist ${playlistId}`);
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist = {
      id: Date.now().toString(),
      title: newPlaylistName
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    setNewPlaylistName('');
    setIsPlaylistDialogOpen(false);
    
    // If we have a selected beat, add it to the new playlist
    if (selectedBeatForPlaylist) {
      handleAddToPlaylist(newPlaylist.id, selectedBeatForPlaylist);
      setSelectedBeatForPlaylist(null);
    }
  };

  const handleOpenPlaylistDialog = (beatId: string) => {
    setSelectedBeatForPlaylist(beatId);
    setIsPlaylistDialogOpen(true);
  };

  // Seek functionality
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const time = ratio * duration;
    seekTo(time);
  };

  // Extract tags function like in BeatListItem
  const extractTags = (title: string, genre: string): string[] => {
    const match = title.match(/\(([^)]+)\)/);
    if (match) {
      return match[1].split(/x|,|\//i).map(t => t.trim()).filter(Boolean).slice(0,4).map(t => t.toLowerCase());
    }
    return [genre.toLowerCase()];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Beat Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage, review, and moderate beat submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {filteredBeats.length} of {beats.length} beats
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by title or producer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="popularity">Popularity</option>
                <option value="title">Title</option>
                <option value="producer">Producer</option>
                <option value="bpm">BPM</option>
                <option value="plays">Plays</option>
                <option value="downloads">Downloads</option>
                <option value="uploadDate">Upload Date</option>
              </select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">License Type</label>
                  <select
                    value={selectedLicense}
                    onChange={(e) => setSelectedLicense(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="">All Licenses</option>
                    {licenses.map((license: string) => (
                      <option key={license} value={license}>{license}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    BPM Range: {bpmRange.min} - {bpmRange.max}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={bpmRange.min}
                      onChange={(e) => setBpmRange({...bpmRange, min: parseInt(e.target.value) || 0})}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={bpmRange.max}
                      onChange={(e) => setBpmRange({...bpmRange, max: parseInt(e.target.value) || 200})}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGenre('');
                    setSelectedLicense('');
                    setBpmRange({ min: 0, max: 200 });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Player */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading beats...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <Music className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">Error loading beats</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        </div>
      )}

      {/* Beats Display */}
      {!isLoading && !error && viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredBeats.map((beat) => (
            <Card key={beat._id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                  {/* Cover Art - exactly like Artwork.tsx */}
                <div className="relative aspect-square bg-muted overflow-hidden group ring-1 ring-border/40 group-hover:ring-primary/40 transition-all duration-300">
                  <img
                    src={getBeatArtworkUrl(beat) || getPlaceholderImageUrl()}
                    alt={beat.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Only set placeholder if it's not already a placeholder
                      if (!target.src.includes('data:image/svg+xml')) {
                        target.src = getPlaceholderImageUrl();
                      }
                    }}
                  />

                  {/* Overlay - exactly like Artwork.tsx */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="w-16 h-16 rounded-full bg-white/90 text-black hover:bg-white border-2 border-white/20"
                      onClick={() => playBeat(beat)}
                    >
                      {currentlyPlaying === beat._id && isPlaying ? (
                        <Pause className="h-6 w-6" fill="currentColor" />
                      ) : (
                        <Play className="h-6 w-6 ml-1" fill="currentColor" />
                      )}
                    </Button>
                  </div>

                  {/* Visibility Toggle */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white transition-opacity duration-200 ${
                      beat.status === 'published' ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={() => toggleBeatVisibility(beat._id)}
                  >
                    {beat.status === 'published' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>

                </div>

                {/* Beat Info - exactly like BeatInfo.tsx */}
                <div className="p-2">
                  <div className="space-y-1">
                    <div>
                      <h3 className="font-semibold text-xs leading-snug text-foreground hover:text-primary transition-colors duration-200 cursor-pointer block truncate">
                        {beat.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground hover:text-primary cursor-pointer transition-colors block truncate mt-0.5">
                        by {beat.owner?.username || beat.owner?.email || 'Unknown'}
                      </p>
                    </div>
                    
                    {/* Beat Meta - exactly like BeatMeta.tsx */}
                    <div className="flex items-center gap-1 text-[9px] flex-wrap">
                      <Badge variant="secondary" className="px-1 py-0.5 text-[9px] font-medium">
                        {beat.bpm} BPM
                      </Badge>
                      <Badge variant="secondary" className="px-1 py-0.5 text-[9px] font-medium">
                        {beat.genre}
                      </Badge>
                    </div>

                    {/* Actions - Playlist dropdown */}
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="w-5 h-5 p-0 hover:bg-muted/50">
                            <MoreHorizontal className="h-3 w-3" style={{ transform: "rotate(90deg)" }} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {playlists.map((playlist) => (
                            <DropdownMenuItem 
                              key={playlist.id} 
                              onClick={() => handleAddToPlaylist(playlist.id, beat._id)}
                            >
                              <List className="h-4 w-4 mr-2" />
                              Add to "{playlist.title}"
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenPlaylistDialog(beat._id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Playlist
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
      ) : (
        /* List View - exactly like BeatListItem.tsx */
        <div className="space-y-2">
          {filteredBeats.map((beat) => {
            const tags = extractTags(beat.title, beat.genre);
            const isPlayingBeat = currentlyPlaying === beat._id && isPlaying;

            return (
              <div 
                key={beat._id}
                className={`group relative w-full flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl bg-card/80 border ${isPlayingBeat ? 'border-primary' : 'border-border/40 hover:border-primary/40'} transition-colors cursor-pointer`}
              >
                {/* Play button - exactly like BeatListItem.tsx */}
                <Button 
                  size="icon" 
                  variant={isPlayingBeat ? "default" : "ghost"} 
                  aria-label={isPlayingBeat ? "Pause" : "Play"} 
                  onClick={() => playBeat(beat)} 
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isPlayingBeat ? 'bg-primary text-primary-foreground' : 'bg-muted/60 hover:bg-muted text-foreground'} flex-shrink-0`}
                >
                  {isPlayingBeat ? (
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>

                {/* Artwork thumbnail - exactly like BeatListItem.tsx */}
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden ring-1 ring-border/40 flex-shrink-0 bg-muted">
                  <img 
                    src={getBeatArtworkUrl(beat) || getPlaceholderImageUrl()} 
                    alt={beat.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Only set placeholder if it's not already a placeholder
                      if (!target.src.includes('data:image/svg+xml')) {
                        target.src = getPlaceholderImageUrl();
                      }
                    }}
                  />
                </div>

                {/* Title + producer - exactly like BeatListItem.tsx */}
                <div className="flex flex-col min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold text-foreground truncate">
                    <a href={`/beat/${beat._id}`} className="hover:underline focus:underline outline-none">{beat.title}</a>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                    <a href={`/creator/${(beat.owner?.username || beat.owner?.email || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`} className="hover:text-foreground hover:underline focus:underline outline-none transition-colors">
                      {beat.owner?.username || beat.owner?.email || 'Unknown'}
                    </a>
                  </p>
                  {/* BPM and key info - hidden on smallest screens */}
                  <div className="hidden xs:flex items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground mt-1">
                    <span>{beat.bpm} BPM</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <span>{beat.genre}</span>
                  </div>
                </div>

                {/* Tags - exactly like BeatListItem.tsx */}
                <div className="hidden md:flex items-center gap-2 flex-shrink-0 max-w-md overflow-hidden">
                  {tags.map(tag => (
                    <span key={tag} className="px-2 sm:px-3 py-1 rounded-full bg-muted text-[10px] sm:text-xs font-medium text-muted-foreground/90 whitespace-nowrap">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions - exactly like BeatListItem.tsx */}
                <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0 ml-auto sm:ml-0 order-last sm:order-none w-full sm:w-auto justify-end sm:justify-start mt-2 sm:mt-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="w-6 h-6 sm:w-8 sm:h-8 p-0 hover:bg-muted">
                        <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {playlists.map((playlist) => (
                        <DropdownMenuItem 
                          key={playlist.id} 
                          onClick={() => handleAddToPlaylist(playlist.id, beat._id)}
                        >
                          <List className="h-4 w-4 mr-2" />
                          Add to "{playlist.title}"
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleOpenPlaylistDialog(beat._id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Playlist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Player Bar - exactly like MediaPlayer.tsx */}
      {currentlyPlaying && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 py-3">
              {/* Left: Artwork + info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 shrink-0">
                  <div className="absolute inset-0 rounded-lg ring-1 ring-border/40 overflow-hidden bg-muted/40">
                    <img
                      src={getBeatArtworkUrl(filteredBeats.find(beat => beat._id === currentlyPlaying) || {}) || getPlaceholderImageUrl()}
                      alt={filteredBeats.find(beat => beat._id === currentlyPlaying)?.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Only set placeholder if it's not already a placeholder
                        if (!target.src.includes('data:image/svg+xml')) {
                          target.src = getPlaceholderImageUrl();
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {filteredBeats.find(beat => beat._id === currentlyPlaying)?.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    by {filteredBeats.find(beat => beat._id === currentlyPlaying)?.owner?.username || filteredBeats.find(beat => beat._id === currentlyPlaying)?.owner?.email || 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Center: Controls and Progress */}
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Previous"
                    className="h-8 w-8 p-0 rounded-full hover:bg-muted/50"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => playBeat(filteredBeats.find(beat => beat._id === currentlyPlaying)!)}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Next"
                    className="h-8 w-8 p-0 rounded-full hover:bg-muted/50"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Progress Bar */}
                <div className="flex items-center gap-2 w-full max-w-md">
                  <span className="text-xs text-muted-foreground w-8 text-right">{formatTime(currentTime)}</span>
                  <div
                    className="relative h-1 flex-1 rounded-full bg-muted cursor-pointer hover:h-1.5 transition-colors"
                    onClick={handleProgressClick}
                  >
                    <div 
                      className="absolute inset-y-0 left-0 bg-primary rounded-full"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right: Volume */}
              <div className="flex items-center gap-4">
                
                {/* Volume Control */}
                <div
                  ref={containerRef}
                  className="relative flex items-center"
                  onWheel={onWheel}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                    onClick={handleToggleMute}
                    className={cn('h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground/70 hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition bg-transparent hover:bg-muted/40')}
                  >
                    {volume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                  {volumeOpen && (
                    <div className={cn('absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in-95')}>
                      <div
                        onKeyDown={onKeyDown}
                        tabIndex={0}
                        aria-label="Volume control" role="group"
                        className={cn('outline-none px-2.5 pt-2.5 pb-2 rounded-2xl shadow-lg border border-border/40 backdrop-blur-md bg-background/90 dark:bg-background/80 relative overflow-hidden')}
                        style={{ minWidth: '3rem', maxHeight: '28rem' }}
                      >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 dark:from-white/10" />
                        <div className="relative flex flex-col items-center mt-3 gap-1.5">
                          <div className="relative h-28 px-1 mb-2 flex items-stretch">
                            <Slider
                              orientation="vertical"
                              value={[volume * 100]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={([value]) => { handleVolumeChange(value / 100); triggerShowValue(); }}
                              className="h-full"
                              aria-label="Volume"
                              onPointerDown={() => triggerShowValue()}
                              onPointerMove={(e) => e.buttons === 1 && triggerShowValue()}
                              thumbClassName={cn('border-foreground/40 bg-background/95 shadow-sm data-[state=active]:shadow-lg transition-all data-[state=active]:scale-110 h-4 w-4 backdrop-blur-sm')}
                              trackClassName="relative w-1.5 h-full my-0 bg-gradient-to-b from-muted/50 via-muted/30 to-muted/40 border border-border/40 rounded-full shadow-inner"
                              rangeClassName={volume === 0 ? 'bg-transparent' : 'bg-gradient-to-b from-foreground to-foreground/80'}
                            />
                            {showValue && <VolumeBubble volume={volume} />}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-[8px] text-muted-foreground/70 uppercase tracking-[0.15em]">VOL</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && filteredBeats.length === 0 && (
        <div className="text-center py-12">
          <Music className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">No beats found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}

      {/* Playlist Creation Dialog */}
      <Dialog open={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Create a new playlist and add this beat to it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="playlist-name">Playlist Name</Label>
              <Input 
                id="playlist-name" 
                value={newPlaylistName} 
                onChange={(e) => setNewPlaylistName(e.target.value)} 
                placeholder="Enter playlist name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreatePlaylist();
                  }
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPlaylistDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()}>
                Create & Add Beat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
