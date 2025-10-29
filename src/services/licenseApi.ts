import {
  License,
  CreateLicenseRequest,
  UpdateLicenseRequest,
} from "@/types/license";
import { apiService } from "./api";

class LicenseApiService {
  async getLicenses(): Promise<License[]> {
    return apiService.get<License[]>("/licenses");
  }

  async getLicense(id: string): Promise<License> {
    return apiService.get<License>(`/license/${id}`);
  }

  async createLicense(data: CreateLicenseRequest): Promise<License> {
    return apiService.post<License>("/license", data);
  }

  async updateLicense(id: string, data: UpdateLicenseRequest): Promise<License> {
    return apiService.put<License>(`/license/${id}`, data);
  }

  async deleteLicense(id: string): Promise<void> {
    return apiService.delete(`/license/${id}`);
  }

  async toggleLicense(id: string, isActive: boolean): Promise<License> {
    return apiService.patch<License>(`/license/${id}/toggle`, { isActive });
  }
}

export const licenseApiService = new LicenseApiService();
