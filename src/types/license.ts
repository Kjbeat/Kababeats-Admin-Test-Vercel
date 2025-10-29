export type Territory =
  | "worldwide"
  | "us-only"
  | "north-america"
  | "europe"
  | "custom";

export interface License {
  _id: string;
  name: string;
  type: "FREE" | "MP3" | "WAV" | "STEMS" | "EXCLUSIVE" | string;
  description: string;
  price: number;

  territory: Territory;
  streamLimit: number;
  saleLimit: number;
  distribution: boolean;
  videos: boolean;
  radio: boolean;
  live: boolean;

  features?: string[];
  usageRights?: string;
  restrictions?: string[];

  isActive: boolean;
  sortOrder: number;

  createdAt: string;
  updatedAt: string;
}

export interface CreateLicenseRequest {
  name: string;
  type: License["type"];
  description: string;
  price?: number;
  features?: string[];
  usageRights?: string;
  restrictions?: string[];
  isActive?: boolean;
  sortOrder?: number;
  territory?: Territory;
  streamLimit?: number;
  saleLimit?: number;
  distribution?: boolean;
  videos?: boolean;
  radio?: boolean;
  live?: boolean;
}

export interface UpdateLicenseRequest extends Partial<CreateLicenseRequest> {
  _id: string;
}
