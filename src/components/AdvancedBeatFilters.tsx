import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Search, Calendar as CalendarIcon } from 'lucide-react';
import { BeatFilters } from '@/types';
import { format } from 'date-fns';

interface AdvancedBeatFiltersProps {
  filters: BeatFilters;
  onFiltersChange: (filters: Partial<BeatFilters>) => void;
  onClearFilters: () => void;
  activeFilters: string[];
}

const genres = [
  'All', 'Hip Hop', 'Trap', 'R&B', 'Pop', 'LoFi', 'EDM', 'Drill', 
  'Afrobeat', 'Jazz', 'Ambient', 'Rock', 'Electronic', 'Classical'
];

const statuses = [
  'All', 'Draft', 'Published', 'Scheduled', 'Archived'
];

const sortOptions = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'title', label: 'Title' },
  { value: 'plays', label: 'Plays' },
  { value: 'likes', label: 'Likes' },
  { value: 'downloads', label: 'Downloads' },
  { value: 'sales', label: 'Sales' }
];

export function AdvancedBeatFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilters
}: AdvancedBeatFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  );

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    onFiltersChange({ dateFrom: date });
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    onFiltersChange({ dateTo: date });
  };

  const clearFilter = (filterType: string, value: string) => {
    switch (filterType) {
      case 'search':
        onFiltersChange({ search: '' });
        break;
      case 'genre':
        onFiltersChange({ genre: undefined });
        break;
      case 'status':
        onFiltersChange({ status: undefined });
        break;
      case 'owner':
        onFiltersChange({ owner: undefined });
        break;
      case 'dateFrom':
        setDateFrom(undefined);
        onFiltersChange({ dateFrom: undefined });
        break;
      case 'dateTo':
        setDateTo(undefined);
        onFiltersChange({ dateTo: undefined });
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search beats, producers, titles..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <Select
          value={filters.sortBy || 'createdAt'}
          onValueChange={(value) => onFiltersChange({ sortBy: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={filters.sortOrder || 'desc'}
          onValueChange={(value) => onFiltersChange({ sortOrder: value as 'asc' | 'desc' })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant={activeFilters.length > 0 ? "default" : "outline"} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-4 space-y-4" align="end">
            <div className="space-y-4">
              {/* Genre Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Genre</label>
                <Select
                  value={filters.genre || 'All'}
                  onValueChange={(value) => onFiltersChange({ genre: value === 'All' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || 'All'}
                  onValueChange={(value) => onFiltersChange({ status: value === 'All' ? undefined : value.toLowerCase() as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Owner Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner</label>
                <Input
                  placeholder="Search by owner username or email"
                  value={filters.owner || ''}
                  onChange={(e) => onFiltersChange({ owner: e.target.value })}
                />
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, 'PPP') : 'From date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={handleDateFromChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, 'PPP') : 'To date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={handleDateToChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* BPM Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">BPM Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min BPM"
                    value={filters.minBpm || ''}
                    onChange={(e) => onFiltersChange({ minBpm: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                  <Input
                    type="number"
                    placeholder="Max BPM"
                    value={filters.maxBpm || ''}
                    onChange={(e) => onFiltersChange({ maxBpm: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range ($)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice || ''}
                    onChange={(e) => onFiltersChange({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice || ''}
                    onChange={(e) => onFiltersChange({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {activeFilters.length > 0 ? (
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                  Clear All
                </Button>
              ) : <span />}
              <Button size="sm" onClick={() => setShowFilters(false)}>
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="gap-1">
              {filter}
              <button
                onClick={() => {
                  // Extract filter type and value for clearing
                  const parts = filter.split(': ');
                  if (parts.length === 2) {
                    clearFilter(parts[0].toLowerCase(), parts[1]);
                  }
                }}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
