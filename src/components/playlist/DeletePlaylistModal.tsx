import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Playlist {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  isPublic: boolean;
  trackCount: number;
  updatedAt: string;
  curator: string;
  beats: any[];
  createdAt: string;
}

interface DeletePlaylistModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeletePlaylist: (playlistId: string) => void;
  playlist: Playlist | null;
}

export function DeletePlaylistModal({ 
  isOpen, 
  onOpenChange, 
  onDeletePlaylist, 
  playlist 
}: DeletePlaylistModalProps) {
  const handleDelete = () => {
    if (playlist) {
      onDeletePlaylist(playlist.id);
      onOpenChange(false);
    }
  };

  if (!playlist) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{playlist.title}"? This action cannot be undone.
            <br />
            <br />
            This will permanently remove the playlist and all its tracks from the platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Playlist
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
