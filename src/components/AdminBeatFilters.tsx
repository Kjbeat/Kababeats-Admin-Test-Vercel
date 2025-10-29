import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X, Search } from "lucide-react";

const genres = ["All", "Hip Hop", "Trap", "R&B", "Pop", "LoFi", "EDM", "Drill", "Afrobeat", "Jazz", "Ambient"];
const moods = ["All", "Chill", "Energetic", "Dark", "Happy", "Sad", "Aggressive", "Romantic", "Mysterious"];

interface AdminBeatFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedMood: string;
  setSelectedMood: (mood: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFilters: string[];
  clearFilter: (filter: string) => void;
  clearAllFilters: () => void;
}

export function AdminBeatFilters({
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  selectedMood,
  setSelectedMood,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  activeFilters,
  clearFilter,
  clearAllFilters
}: AdminBeatFiltersProps) {
  const activeCount = activeFilters.length;

  return (
    <div className="space-y-3 mb-6">
      {/* Primary toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search beats, producers, titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search beats"
            className="pl-8"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]" aria-label="Sort by">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="plays">Most Plays</SelectItem>
            <SelectItem value="likes">Most Likes</SelectItem>
          </SelectContent>
        </Select>

        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant={activeCount ? "default" : "outline"} size="sm" aria-label="Open filters">
              <Filter className="h-4 w-4 mr-1" />
              Filters{activeCount ? ` (${activeCount})` : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-4 space-y-5" align="end">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium">Genre</label>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {genres.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Mood</label>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {moods.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              {activeCount > 0 ? (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">Reset</Button>
              ) : <span />}
              <Button size="sm" onClick={() => setShowFilters(false)} className="text-xs">Done</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((f) => (
            <Badge key={f} variant="secondary" className="gap-1">
              {f}
              <button aria-label={`Remove filter ${f}`} onClick={() => clearFilter(f)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearAllFilters}>Clear All</Button>
        </div>
      )}
    </div>
  );
}
