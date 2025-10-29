import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface MediaPlayerProps {
  // Add props as needed for the media player
}

export function MediaPlayer({}: MediaPlayerProps) {
  return (
    <Card className="rounded-none border-t">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <Play className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h4 className="font-medium truncate">Track Title</h4>
              <p className="text-sm text-muted-foreground truncate">Producer Name</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <div className="w-20 h-1 bg-muted rounded-full">
              <div className="w-1/2 h-full bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
