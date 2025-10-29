import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { licenseApiService } from "@/services/licenseApi";
import {
  License,
  CreateLicenseRequest,
  UpdateLicenseRequest,
} from "@/types/license";
import { useToast } from "@/components/ui/use-toast";

// Query keys
export const licenseKeys = {
  all: ["licenses"] as const,
  lists: () => [...licenseKeys.all, "list"] as const,
  list: (filters: string) => [...licenseKeys.lists(), { filters }] as const,
  details: () => [...licenseKeys.all, "detail"] as const,
  detail: (id: string) => [...licenseKeys.details(), id] as const,
};

// Get all licenses
export function useLicenses() {
  return useQuery({
    queryKey: licenseKeys.lists(),
    queryFn: () => licenseApiService.getLicenses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single license
export function useLicense(id: string) {
  return useQuery({
    queryKey: licenseKeys.detail(id),
    queryFn: () => licenseApiService.getLicense(id),
    enabled: !!id,
  });
}

// Create license
export function useCreateLicense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateLicenseRequest) => licenseApiService.createLicense(data),
    onSuccess: (newLicense) => {
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
      toast({
        title: "License created",
        description: `${newLicense.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create license: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Update license
export function useUpdateLicense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLicenseRequest }) =>
      licenseApiService.updateLicense(id, data),
    onSuccess: (updatedLicense) => {
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: licenseKeys.detail(updatedLicense._id) });
      toast({
        title: "License updated",
        description: `${updatedLicense.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update license: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Delete license
export function useDeleteLicense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => licenseApiService.deleteLicense(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
      toast({
        title: "License deleted",
        description: "License has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete license: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Toggle license active status
export function useToggleLicense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      licenseApiService.toggleLicense(id, isActive),
    onSuccess: (updatedLicense) => {
      queryClient.invalidateQueries({ queryKey: licenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: licenseKeys.detail(updatedLicense._id) });
      toast({
        title: "License updated",
        description: `${updatedLicense.name} has been ${
          updatedLicense.isActive ? "activated" : "deactivated"
        }.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update license status: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}
