import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { X, Upload, Loader2 } from "lucide-react";
import {
  useAdminPlaylists,
  CreatePlaylistData,
  AdminPlaylist,
} from "@/contexts/AdminPlaylistsContext";
import { uploadImageToR2 } from "@/utils/uploadUtils";

interface CreateCuratedPlaylistModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePlaylist: (playlist: CreatePlaylistData) => void;
  onUpdatePlaylist?: (
    id: string,
    data: Partial<AdminPlaylist>
  ) => Promise<void>;
  playlistToEdit?: AdminPlaylist | null;
}

export function CreateCuratedPlaylistModal({
  isOpen,
  onOpenChange,
  onCreatePlaylist,
  onUpdatePlaylist,
  playlistToEdit,
}: CreateCuratedPlaylistModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: true,
    coverImage: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const { createPlaylist } = useAdminPlaylists();
  const isEditMode = !!playlistToEdit;

  // Focus handling
  useEffect(() => {
    if (isOpen) setTimeout(() => titleInputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(
    () => () => {
      if (previewUrl && previewUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  useEffect(() => {
    if (playlistToEdit) {
      setFormData({
        title: playlistToEdit.title,
        description: playlistToEdit.description || "",
        isPublic: playlistToEdit.isPublic,
        coverImage: null, // on ne peut pas précharger le fichier, juste garder l’URL en preview si on veut
      });

      setPreviewUrl(playlistToEdit.coverImage ?? null);
    } else {
      setFormData({
        title: "",
        description: "",
        isPublic: true,
        coverImage: null,
      });
      setPreviewUrl(null);
    }
  }, [playlistToEdit]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submitting) return;

    const trimmed = formData.title.trim();
    if (!trimmed) {
      toast({
        title: "Title Required",
        description: "Please enter a playlist title",
        variant: "destructive",
      });
      return;
    }

    if (trimmed.length > 100) {
      toast({
        title: "Title Too Long",
        description: "Title must be 100 characters or less",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      let coverImageUrl: string | undefined = undefined;

      // Upload image to R2 if provided
      if (formData.coverImage) {
        setUploadingImage(true);
        setUploadProgress(0);

        const uploadResult = await uploadImageToR2(
          formData.coverImage,
          (progress) => setUploadProgress(progress.percentage),
          localStorage.getItem("admin_access_token") || undefined
        );

        if (uploadResult.success && uploadResult.url) {
          coverImageUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || "Failed to upload image");
        }

        setUploadingImage(false);
      }

      if (isEditMode && playlistToEdit && onUpdatePlaylist) {
        await onUpdatePlaylist(playlistToEdit.id, {
          title: trimmed,
          description: formData.description.trim() || undefined,
          coverImage: coverImageUrl || playlistToEdit.coverImage, // garder l'image actuelle si pas modifiée
          isPublic: formData.isPublic,
        });
      } else {
        const playlistData: CreatePlaylistData = {
          title: trimmed,
          description: formData.description.trim() || undefined,
          coverImage: coverImageUrl,
          isPublic: formData.isPublic,
          trackIds: [],
        };

        await createPlaylist(playlistData);
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        isPublic: true,
        coverImage: null,
      });
      setPreviewUrl(null);
      setUploadProgress(0);

      onOpenChange(false);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create playlist",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be 3MB or smaller",
        variant: "destructive",
      });
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:"))
      URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFormData((prev) => ({ ...prev, coverImage: file }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Playlist" : "Create Curated Playlist"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Edit this playlist’s details below"
              : "Create a curated playlist by selecting tracks from the platform"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto">
          {/* Playlist Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="playlist-title">Playlist Title *</Label>
              <Input
                id="playlist-title"
                ref={titleInputRef}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter playlist title..."
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="playlist-visibility">Visibility</Label>
              <Select
                value={formData.isPublic ? "public" : "private"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPublic: value === "public",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="playlist-description">Description</Label>
            <Textarea
              id="playlist-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter playlist description..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500
            </p>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="cover-image">Cover Image</Label>
            <div className="flex items-start gap-3">
              <div className="w-20 h-20 rounded-md bg-muted overflow-hidden flex items-center justify-center ring-1 ring-border">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground text-center px-1">
                    No image
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={onFileChange}
                />
                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      if (previewUrl.startsWith("blob:"))
                        URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                      setFormData((prev) => ({ ...prev, coverImage: null }));
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Optional. Max 3MB. JPG, PNG, or GIF.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.title.trim() || submitting || uploadingImage}
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Image... {uploadProgress}%
                </>
              ) : submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Playlist" : "Create Playlist"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
