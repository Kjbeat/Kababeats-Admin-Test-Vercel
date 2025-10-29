import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  Pause,
  ListMusic,
  Loader2,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Music,
} from "lucide-react";
import {
  useAdminPlaylists,
  AdminPlaylist,
} from "@/contexts/AdminPlaylistsContext";
import { getBeatArtworkUrl } from "@/utils/imageUtils";

// Use AdminPlaylist from context instead of local interfaces

// Helper: format seconds -> mm:ss
function formatTime(seconds: number) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, isLoading, refreshPlaylists } = useAdminPlaylists();

  const [playlist, setPlaylist] = useState<AdminPlaylist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<
    AdminPlaylist["tracks"][0] | null
  >(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);

  // Fetch playlist data from context
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setError(null);
        let found = playlists.find((p) => p.id === id);

        if (!found && playlists.length === 0) {
          // Refresh playlists if empty
          await refreshPlaylists();
          // Re-search after refresh
          found = playlists.find((p) => p.id === id);
        }

        if (found) {
          setPlaylist(found);
        } else {
          setError("Playlist not found");
          setPlaylist(null);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load playlist");
        setPlaylist(null);
      }
    };

    if (id) fetchPlaylist();
  }, [id, playlists, refreshPlaylists]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle track click / play / pause
  const handleTrackClick = (track: AdminPlaylist["tracks"][0]) => {
    const normalizedTrack = { ...track, id: track._id };

    const audioUrl = normalizedTrack.storageKey
      ? normalizedTrack.storageKey.startsWith("http")
        ? normalizedTrack.storageKey
        : `https://pub-6f3847c4d3f4471284d44c6913bcf6f0.r2.dev/${normalizedTrack.storageKey}`
      : null;

    if (!audioUrl) return;

    if (currentTrack?.id === normalizedTrack.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setCurrentTrack(normalizedTrack);
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Playback error", err));
    }
  };

  // Play first track of the playlist
  const handlePlaylistPlay = () => {
    if (playlist?.tracks?.length) {
      handleTrackClick(playlist.tracks[0]);
    }
  };

  // Play next track, memorized to avoid effect re-run
  const playNext = useCallback(() => {
    if (!playlist || !currentTrack) return;
    const idx = playlist.tracks.findIndex((t) => t._id === currentTrack._id);
    if (idx < playlist.tracks.length - 1) {
      handleTrackClick(playlist.tracks[idx + 1]);
    } else {
      handleTrackClick(playlist.tracks[0]);
    }
  }, [playlist, currentTrack]);

  // Play previous track, memorized
  const playPrevious = useCallback(() => {
    if (!playlist || !currentTrack) return;
    const idx = playlist.tracks.findIndex((t) => t._id === currentTrack._id);
    if (idx > 0) {
      handleTrackClick(playlist.tracks[idx - 1]);
    } else {
      handleTrackClick(playlist.tracks[playlist.tracks.length - 1]);
    }
  }, [playlist, currentTrack]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnd = () => playNext();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
    };
  }, [playNext]);

  if (isLoading) {
    return (
      <div className="mt-14 min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading playlist...</span>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="mt-14 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Playlist not found</h2>
          <p className="text-muted-foreground">
            {error ||
              "This playlist does not exist or you do not have access to it."}
          </p>
          <Button onClick={() => navigate("/content")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Playlists
          </Button>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mt-14 min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row gap-6 p-6 pb-40">
        {/* Left Side - Playlist Details & Tracklist */}
        <div className="flex-1">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/content")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Playlists
            </Button>
          </div>

          {/* Playlist Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-64 h-64 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex-shrink-0">
              {playlist.coverImage ? (
                <img
                  src={playlist.coverImage}
                  alt={playlist.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full rounded-lg flex items-center justify-center bg-black/10">
                  <ListMusic className="h-16 w-16 text-white/60" />
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <Badge variant="secondary" className="w-fit mb-2">
                {playlist.isPublic ? "Public" : "Private"}
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 break-words">
                {playlist.title}
              </h1>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {playlist.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <span className="font-medium text-foreground">
                  {playlist.curatorName || playlist.curator}
                </span>
                <span>•</span>
                <span>
                  {playlist.trackCount}{" "}
                  {playlist.trackCount === 1 ? "track" : "tracks"}
                </span>
              </div>
              <div className="flex gap-3">
                <Button size="lg" onClick={handlePlaylistPlay}>
                  {isPlaying && currentTrack ? (
                    <Pause className="h-5 w-5 mr-2" />
                  ) : (
                    <Play className="h-5 w-5 mr-2" />
                  )}
                  {isPlaying && currentTrack ? "Pause" : "Play"}
                </Button>
                <Button variant="outline">Queue All</Button>
              </div>
            </div>
          </div>

          {/* Tracklist Table */}
          <div className="space-y-1" role="table" aria-label="Tracklist">
            <div
              className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs uppercase tracking-wide font-medium text-muted-foreground border-b border-border"
              role="row"
            >
              <div className="col-span-1">#</div>
              <div className="col-span-6">Title</div>
              <div className="col-span-2">Genre</div>
              <div className="col-span-2">BPM</div>
              <div className="col-span-1"></div>
            </div>

            {playlist.tracks.map((track, index) => {
              const isCurrentTrack = currentTrack?._id === track._id;
              const isTrackPlaying = isCurrentTrack && isPlaying;

              return (
                <div
                  key={track.id || index}
                  role="row"
                  onClick={() => handleTrackClick(track)}
                  className={`grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-md cursor-pointer group transition-colors hover:bg-muted/50 ${
                    isCurrentTrack ? "bg-muted" : ""
                  }`}
                >
                  <div className="col-span-1 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackClick(track);
                      }}
                      aria-label={`${isTrackPlaying ? "Pause" : "Play"} ${
                        track.title
                      }`}
                    >
                      {isTrackPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="col-span-10 md:col-span-6 flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden ring-1 ring-border/40 flex-shrink-0 bg-muted">
                      {getBeatArtworkUrl(track) ? (
                        <img
                          src={getBeatArtworkUrl(track) || ""}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                          <Music className="h-4 w-4 text-primary/60" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{track.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {track.producer}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex col-span-2 items-center text-xs sm:text-sm text-muted-foreground">
                    {track.genre}
                  </div>
                  <div className="hidden md:flex col-span-2 items-center text-xs sm:text-sm text-muted-foreground">
                    {track.bpm}
                  </div>
                  <div className="col-span-1 flex items-center justify-end"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar - Now Playing */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <Card className="sticky top-20">
            <CardContent className="p-0">
              <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                {currentTrack ? (
                  getBeatArtworkUrl(currentTrack) ? (
                    <img
                      src={getBeatArtworkUrl(currentTrack) || ""}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                      <Music className="h-12 w-12 text-primary/60" />
                    </div>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No track playing
                  </p>
                )}
              </div>
              <div className="p-6">
                {currentTrack ? (
                  <>
                    <h3 className="font-bold text-lg">{currentTrack.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {currentTrack.producer}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span>Genre: {currentTrack.genre}</span>
                      <span>BPM: {currentTrack.bpm}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    Select a track to see details
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modern Media Player Bar */}
      {currentTrack && (
        <div
          className={`fixed left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-50 transition-[bottom] duration-300`}
          style={{
            bottom: isPlayerVisible ? "3rem" : "-120px", // 3rem = bottom-12 (48px) + bouton + marge
          }}
        >
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-4">
            <div className="flex items-center gap-6">
              {/* Left: Artwork + info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-14 h-14 shrink-0">
                  <div className="absolute inset-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {getBeatArtworkUrl(currentTrack) ? (
                      <img
                        src={getBeatArtworkUrl(currentTrack) || ""}
                        alt={currentTrack.title}
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
                    {currentTrack.title}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {currentTrack.producer}
                  </div>
                </div>
              </div>

              {/* Center: Controls + Progress */}
              <div className="flex-1 flex flex-col items-center gap-3">
                {/* Playback Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    onClick={playPrevious}
                    size="sm"
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleTrackClick(currentTrack)}
                    className="rounded-full w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    onClick={playNext}
                    size="sm"
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Fixed Progress Bar */}
                <div className="flex items-center gap-3 w-full max-w-md">
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTime(currentTime)}
                  </span>
                  <div className="relative flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
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
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Right: Utility Controls */}
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton toggle toujours visible */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-60">
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-600 hover:text-gray-900"
          onClick={() => setIsPlayerVisible(!isPlayerVisible)}
        >
          {isPlayerVisible ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          )}
        </Button>
      </div>

      {/* Audio element for playback */}
      <audio
        ref={audioRef}
        onError={(e) => {
          console.error("Audio error:", e);
          setIsPlaying(false);
        }}
      />
    </div>
  );
}
