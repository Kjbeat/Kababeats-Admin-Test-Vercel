import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  Play,
  Pause,
  Music,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Grid3X3,
  List,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  AlertCircle,
  BarChart3,
  PlusCircle,
  MoreVertical,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
  ListMusic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBeats } from "@/hooks/useBeats";
// import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"; // Removed for now
import { AdminBeatFilters } from "@/components/AdminBeatFilters";
import { BeatAnalytics } from "@/components/BeatAnalytics";
import { Beat } from "@/types";
import { getBeatArtworkUrl } from "@/utils/imageUtils";
import { useAdminPlaylists } from "@/contexts/AdminPlaylistsContext";
import { apiService } from "@/services/api";

export function EnhancedBeatsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const {
    playlists,
    isLoading: playlistsLoading,
    addTrackToPlaylist,
    refreshPlaylists,
  } = useAdminPlaylists();

  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [selectedBeatForPlaylist, setSelectedBeatForPlaylist] = useState<
    string | null
  >(null);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // États pour les actions avec loading
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [beatToDelete, setBeatToDelete] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedMood, setSelectedMood] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const activeFilters = useMemo(() => {
    const filters: string[] = [];
    if (searchQuery) filters.push(`Search: "${searchQuery}"`);
    if (selectedGenre !== "All") filters.push(selectedGenre);
    if (selectedMood !== "All") filters.push(selectedMood);
    return filters;
  }, [searchQuery, selectedGenre, selectedMood]);

  // Helper function to map frontend sort values to backend values and determine sort order
  const mapSortByToBackend = useCallback((frontendSort: string): { sortBy: string; sortOrder: 'asc' | 'desc' } => {
    const mapping: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
      'newest': { sortBy: 'createdAt', sortOrder: 'desc' },
      'oldest': { sortBy: 'createdAt', sortOrder: 'asc' }, 
      'price-low': { sortBy: 'basePrice', sortOrder: 'asc' },
      'price-high': { sortBy: 'basePrice', sortOrder: 'desc' },
      'popular': { sortBy: 'plays', sortOrder: 'desc' },
      'plays': { sortBy: 'plays', sortOrder: 'desc' },
      'likes': { sortBy: 'likes', sortOrder: 'desc' },
      'title': { sortBy: 'title', sortOrder: 'asc' },
      'producer': { sortBy: 'owner', sortOrder: 'asc' },
      'genre': { sortBy: 'genre', sortOrder: 'asc' }
    };
    return mapping[frontendSort] || { sortBy: 'createdAt', sortOrder: 'desc' };
  }, []);

  const queryParams = useMemo(
    () => {
      const sortConfig = mapSortByToBackend(sortBy);
      console.log(`Sorting by: ${sortBy} -> Backend: ${sortConfig.sortBy} ${sortConfig.sortOrder}`);
      return {
        search: searchQuery || undefined,
        genre: selectedGenre !== "All" ? selectedGenre : undefined,
        // Note: mood filtering will be done on the frontend since backend doesn't support it
        page: 1,
        limit: 1000, // Get a large number of beats to filter on frontend
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      };
    },
    [searchQuery, selectedGenre, selectedMood, sortBy, mapSortByToBackend]
  );

  // Use the simple useBeats hook
  const { data: beatsResponse, isLoading, error, refetch } = useBeats(queryParams);

  // Extract beats from the API response
  const beats = useMemo(() => {
    if (!beatsResponse) return [];
    // The useBeats hook returns the response from apiService.getBeats
    return Array.isArray(beatsResponse) ? beatsResponse : (beatsResponse as any)?.data || [];
  }, [beatsResponse]);

  // Remove infinite scroll since we're using simple pagination
  // const { sentinelRef } = useInfiniteScroll(loadMore, {
  //   threshold: 100,
  //   enabled: hasMore && !isLoadingMore,
  // });

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedGenre("All");
    setSelectedMood("All");
    setSortBy("newest");
  }, []);

  const clearFilter = useCallback((filter: string) => {
    if (filter.startsWith("Search:")) {
      setSearchQuery("");
    } else if (
      [
        "Hip Hop",
        "Trap",
        "R&B",
        "Pop",
        "LoFi",
        "EDM",
        "Drill",
        "Afrobeat",
        "Jazz",
        "Ambient",
      ].includes(filter)
    ) {
      setSelectedGenre("All");
    } else if (
      [
        "Chill",
        "Energetic",
        "Dark",
        "Happy",
        "Sad",
        "Aggressive",
        "Romantic",
        "Mysterious",
      ].includes(filter)
    ) {
      setSelectedMood("All");
    }
  }, []);

  const [filteredBeats, setFilteredBeats] = useState<Beat[]>([]);

  useEffect(() => {
    let filtered = [...beats];

    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (beat) =>
          beat.title.toLowerCase().includes(searchTerm) ||
          (beat.owner?.username || beat.owner?.email || "")
            .toLowerCase()
            .includes(searchTerm)
      );
    }

    if (selectedGenre && selectedGenre !== "All") {
      filtered = filtered.filter((beat) => beat.genre === selectedGenre);
    }

    // Handle mood filtering on frontend since backend doesn't support it
    if (selectedMood && selectedMood !== "All") {
      filtered = filtered.filter((beat) => beat.mood === selectedMood);
    }

    // Only apply frontend sorting if we're filtering by mood or search
    // Otherwise, rely on backend sorting which is more efficient
    if ((selectedMood && selectedMood !== "All") || searchQuery) {
      console.log(`Applying frontend sorting for: ${sortBy} (due to mood/search filtering)`);
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "newest":
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            break;
          case "oldest":
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case "price-low":
            comparison = a.basePrice - b.basePrice;
            break;
          case "price-high":
            comparison = b.basePrice - a.basePrice;
            break;
          case "popular":
            comparison = (b.plays + b.likes) - (a.plays + a.likes);
            break;
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "producer":
            comparison = (
              a.owner?.username ||
              a.owner?.email ||
              ""
            ).localeCompare(b.owner?.username || b.owner?.email || "");
            break;
          case "genre":
            comparison = a.genre.localeCompare(b.genre);
            break;
          case "plays":
            comparison = b.plays - a.plays;
            break;
          case "likes":
            comparison = b.likes - a.likes;
            break;
          default:
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return comparison;
      });
    }

    console.log(`Final filtered beats: ${filtered.length} beats`);
    if (filtered.length > 0) {
      console.log(`First beat: ${filtered[0].title} (${filtered[0].createdAt})`);
      console.log(`Last beat: ${filtered[filtered.length - 1].title} (${filtered[filtered.length - 1].createdAt})`);
    }

    setFilteredBeats(filtered);
  }, [beats, searchQuery, selectedGenre, selectedMood, sortBy, sortOrder]);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Approve Beat — utilise apiService
  const handleApproveBeat = useCallback(async (beatId: string) => {
    try {
      setIsApproving(beatId);
      await apiService.approveBeat(beatId);
      setFilteredBeats((prev) =>
        prev.map((beat) =>
          beat._id === beatId ? { ...beat, status: "published" } : beat
        )
      );
    } catch (error) {
      console.error("Approve error:", error);
      alert(`Failed to approve beat: ${(error as Error).message}`);
    } finally {
      setIsApproving(null);
    }
  }, []);

  // Reject Beat — utilise apiService
  const handleRejectBeat = useCallback(async (beatId: string) => {
    const reason = prompt("Please enter a reason for rejection:");
    if (!reason) return;

    try {
      setIsRejecting(beatId);
      await apiService.rejectBeat(beatId, reason);
      setFilteredBeats((prev) =>
        prev.map((beat) =>
          beat._id === beatId ? { ...beat, status: "rejected" } : beat
        )
      );
    } catch (error) {
      console.error("Reject error:", error);
      alert(`Failed to reject beat: ${(error as Error).message}`);
    } finally {
      setIsRejecting(null);
    }
  }, []);

  // Delete Beat — utilise apiService
  const openDeleteConfirmation = (beatId: string) => {
    setBeatToDelete(beatId);
  };

  const confirmDelete = useCallback(async () => {
    if (!beatToDelete) return;
    try {
      setIsDeleting(beatToDelete);
      await apiService.deleteBeat(beatToDelete);
      setFilteredBeats((prev) =>
        prev.filter((beat) => beat._id !== beatToDelete)
      );
      if (currentlyPlaying === beatToDelete) {
        setCurrentlyPlaying(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Failed to delete beat: ${(error as Error).message}`);
    } finally {
      setIsDeleting(null);
      setBeatToDelete(null);
    }
  }, [currentlyPlaying, beatToDelete]);

  // Play/pause functionality
  const playBeat = (beatId: string) => {
    const beat = filteredBeats.find((b) => b._id === beatId);
    if (!beat) return;

    const audioUrl = beat.storageKey
      ? beat.storageKey.startsWith("http")
        ? beat.storageKey
        : `https://pub-6f3847c4d3f4471284d44c6913bcf6f0.r2.dev/${beat.storageKey}`
      : null;

    if (!audioUrl) {
      console.warn("No audio file available for this beat");
      return;
    }

    if (currentlyPlaying === beatId) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentlyPlaying(beatId);
      setIsPlaying(true);
      if (audioRef.current && audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume;
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const toggleMute = () => {
    setVolume((prev) => (prev > 0 ? 0 : 0.7));
  };

  const playNext = () => {
    const currentIndex = filteredBeats.findIndex(
      (b) => b._id === currentlyPlaying
    );
    if (currentIndex < filteredBeats.length - 1) {
      playBeat(filteredBeats[currentIndex + 1]._id);
    }
  };

  const playPrevious = () => {
    const currentIndex = filteredBeats.findIndex(
      (b) => b._id === currentlyPlaying
    );
    if (currentIndex > 0) {
      playBeat(filteredBeats[currentIndex - 1]._id);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    if (currentlyPlaying) {
      setIsVisible(true);
    } else {
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [currentlyPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioDuration = () => setDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshPlaylists();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshPlaylists]);

  const handleOpenPlaylistDialog = async (beatId: string) => {
    setSelectedBeatForPlaylist(beatId);
    setIsPlaylistDialogOpen(true);
    await refreshPlaylists();
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (selectedBeatForPlaylist) {
      try {
        setAddingToPlaylist(playlistId);
        const success = await addTrackToPlaylist(
          playlistId,
          selectedBeatForPlaylist
        );
        if (success) {
          await refreshPlaylists();
          setIsPlaylistDialogOpen(false);
          setSelectedBeatForPlaylist(null);
        }
      } catch (error) {
        console.error("Error adding beat to playlist:", error);
      } finally {
        setAddingToPlaylist(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Beat Management</h1>
          <p className="text-muted-foreground">
            Manage and moderate beats in your platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalytics ? "Hide" : "Show"} Analytics
          </Button>
        </div>
      </div>

      {showAnalytics && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <BeatAnalytics />
          </TabsContent>
          <TabsContent value="analytics">
            <div className="text-center py-8 text-muted-foreground">
              Advanced analytics coming soon...
            </div>
          </TabsContent>
        </Tabs>
      )}

      <AdminBeatFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        selectedMood={selectedMood}
        setSelectedMood={setSelectedMood}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFilters={activeFilters}
        clearFilter={clearFilter}
        clearAllFilters={clearAllFilters}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            {isLoading ? "Loading..." : `${filteredBeats.length} beats found`}
          </p>
          {error && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error.message}</span>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </Button>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading beats...</p>
          </div>
        </div>
      ) : (
        !error && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBeats.map((beat) => (
                  <Card
                    key={beat._id}
                    className="group hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square bg-muted overflow-hidden group ring-1 ring-border/40 group-hover:ring-primary/40 transition-all duration-300">
                        {getBeatArtworkUrl(beat) ? (
                          <img
                            src={getBeatArtworkUrl(beat) || ""}
                            alt={beat.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                            <Music className="h-12 w-12 text-primary/60" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            size="lg"
                            onClick={() => playBeat(beat._id)}
                            className="rounded-full w-12 h-12"
                          >
                            {currentlyPlaying === beat._id && isPlaying ? (
                              <Pause className="h-6 w-6" />
                            ) : (
                              <Play className="h-6 w-6" />
                            )}
                          </Button>
                          <Button
                            size="lg"
                            variant="secondary"
                            onClick={() => handleOpenPlaylistDialog(beat._id)}
                            className="rounded-full w-12 h-12"
                          >
                            <PlusCircle className="h-6 w-6" />
                          </Button>
                        </div>

                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={
                              beat.status === "published"
                                ? "default"
                                : beat.status === "draft"
                                ? "secondary"
                                : beat.status === "archived"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {beat.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-lg truncate">
                          {beat.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by{" "}
                          {beat.owner?.username ||
                            beat.owner?.email ||
                            "Unknown"}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{beat.genre}</span>
                          <span>{beat.bpm} BPM</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>{beat.plays} plays</span>
                          <span>{beat.likes} likes</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBeats.map((beat) => (
                  <Card
                    key={beat._id}
                    className="group hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden ring-1 ring-border/40 flex-shrink-0 bg-muted">
                          {getBeatArtworkUrl(beat) ? (
                            <img
                              src={getBeatArtworkUrl(beat) || ""}
                              alt={beat.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                              <Music className="h-6 w-6 text-primary/60" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">
                            {beat.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            by{" "}
                            {beat.owner?.username ||
                              beat.owner?.email ||
                              "Unknown"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{beat.genre}</span>
                            <span>{beat.bpm} BPM</span>
                            <span>{beat.plays} plays</span>
                            <span>{beat.likes} likes</span>
                          </div>
                        </div>

                        <Badge
                          variant={
                            beat.status === "published"
                              ? "default"
                              : beat.status === "draft"
                              ? "secondary"
                              : beat.status === "archived"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {beat.status}
                        </Badge>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playBeat(beat._id)}
                          >
                            {currentlyPlaying === beat._id && isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => playBeat(beat._id)}
                              >
                                {currentlyPlaying === beat._id && isPlaying
                                  ? "Pause"
                                  : "Play"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleOpenPlaylistDialog(beat._id)
                                }
                              >
                                Add to Playlist
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {beat.status !== "published" && (
                                <DropdownMenuItem
                                  onClick={() => handleApproveBeat(beat._id)}
                                  disabled={isApproving === beat._id}
                                >
                                  {isApproving === beat._id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {beat.status !== "rejected" && (
                                <DropdownMenuItem
                                  onClick={() => handleRejectBeat(beat._id)}
                                  disabled={isRejecting === beat._id}
                                >
                                  {isRejecting === beat._id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Reject
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => openDeleteConfirmation(beat._id)}
                                disabled={isDeleting === beat._id}
                              >
                                {isDeleting === beat._id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Removed infinite scroll functionality */}

            {!isLoading && !error && filteredBeats.length === 0 && (
              <div className="text-center py-12">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No beats found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </>
        )
      )}

      {currentlyPlaying &&
        isVisible &&
        (() => {
          const currentBeat = filteredBeats.find(
            (beat) => beat._id === currentlyPlaying
          );
          if (!currentBeat) return null;

          const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

          return (
            <div
              className={`
              fixed left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-50 
              transition-all duration-500 ease-in-out
              ${
                isVisible
                  ? "bottom-6 opacity-100 translate-y-0"
                  : "bottom-0 opacity-0 translate-y-10"
              }
            `}
            >
              <div
                className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden
                relative transition-all duration-500 ease-in-out ${
                  isMinimized ? "h-14 overflow-visible" : "p-4 overflow-hidden"
                }
              `}
              >
                {/* Chevron minimisation */}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className={`
                  absolute z-10 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-500 ease-in-out p-1
                  ${
                    isMinimized
                      ? "left-1/2 -translate-x-1/2 -top-3"
                      : "right-3 top-3 translate-x-0"
                  }
                `}
                  aria-label={isMinimized ? "Expand player" : "Minimize player"}
                >
                  {isMinimized ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-gray-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-gray-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </button>

                {/* Contenu du player */}
                {!isMinimized && (
                  <div className="flex items-center gap-6">
                    {/* Artwork + infos */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-14 h-14 shrink-0">
                        <div className="absolute inset-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                          {getBeatArtworkUrl(currentBeat) ? (
                            <img
                              src={getBeatArtworkUrl(currentBeat) || ""}
                              alt={currentBeat.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                              <Music className="h-6 w-6 text-primary/60" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-gray-900 truncate">
                          {currentBeat.title}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {currentBeat.owner?.username || "Unknown"}
                        </div>
                      </div>
                    </div>

                    {/* Contrôles + barre de progression */}
                    <div className="flex-1 flex flex-col items-center gap-3">
                      {/* Boutons de lecture */}
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:text-gray-900"
                          onClick={playPrevious}
                          disabled={
                            filteredBeats.findIndex(
                              (b) => b._id === currentlyPlaying
                            ) === 0
                          }
                        >
                          <SkipBack className="h-5 w-5" />
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => playBeat(currentlyPlaying)}
                          className="rounded-full w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:text-gray-900"
                          onClick={playNext}
                          disabled={
                            filteredBeats.findIndex(
                              (b) => b._id === currentlyPlaying
                            ) ===
                            filteredBeats.length - 1
                          }
                        >
                          <SkipForward className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Barre de progression */}
                      <div className="flex items-center gap-3 w-full max-w-md">
                        <span className="text-xs text-gray-500 font-mono">
                          {formatTime(currentTime)}
                        </span>

                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden relative group">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                          <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => {
                              const newTime = Number(e.target.value);
                              if (audioRef.current)
                                audioRef.current.currentTime = newTime;
                              setCurrentTime(newTime);
                            }}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer"
                          />
                        </div>

                        <span className="text-xs text-gray-500 font-mono">
                          {formatTime(duration)}
                        </span>
                      </div>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleMute}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {volume > 0 ? (
                          <Volume2 className="h-5 w-5" />
                        ) : (
                          <VolumeX className="h-5 w-5" />
                        )}
                      </Button>

                      <Slider
                        value={[volume * 100]}
                        onValueChange={(v) => setVolume(v[0] / 100)}
                        className="w-20"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      {/* Audio player */}
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentlyPlaying(null);
        }}
        onError={(e) => {
          console.error("Audio playback error:", e);
          setIsPlaying(false);
          setCurrentlyPlaying(null);
        }}
      />

      <Dialog
        open={isPlaylistDialogOpen}
        onOpenChange={(open) => {
          setIsPlaylistDialogOpen(open);
          if (!open) refreshPlaylists();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
            <DialogDescription>
              Choose a playlist to add this beat to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {playlistsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">
                  Loading playlists...
                </span>
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No playlists available
                </h3>
                <p className="text-sm">
                  Create playlists in the Content section to add beats to them.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {playlists.map((playlist) => (
                  <Button
                    key={playlist.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    disabled={addingToPlaylist === playlist.id}
                  >
                    {addingToPlaylist === playlist.id ? (
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    ) : (
                      <ListMusic className="h-5 w-5 mr-3" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium text-base">
                        {playlist.title}
                      </div>
                      {playlist.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {playlist.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {playlist.trackCount} tracks •{" "}
                        {playlist.isPublic ? "Public" : "Private"}
                        {addingToPlaylist === playlist.id && (
                          <span className="ml-2 text-primary">Adding...</span>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!beatToDelete} onOpenChange={() => setBeatToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Beat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this beat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBeatToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting !== null}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
