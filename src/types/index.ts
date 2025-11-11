// Admin Types
export type BeatStatus = 'draft' | 'published' | 'scheduled' | 'archived' | 'rejected';


export interface AdminUser {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: AdminRole;
  permissions: AdminPermission[];
  isActive: boolean;
  lastLogin?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminRole = 
  | 'super_admin' 
  | 'admin' 
  | 'moderator' 
  | 'content_manager' 
  | 'sales_admin' 
  | 'finance_admin'
  | 'support_admin';

export type AdminPermission = 
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.suspend'
  | 'users.impersonate'
  | 'beats.view'
  | 'beats.moderate'
  | 'beats.approve'
  | 'beats.reject'
  | 'beats.delete'
  | 'playlists.view'
  | 'playlists.manage'
  | 'content.manage'
  | 'content.homepage'
  | 'content.categories'
  | 'sales.view'
  | 'sales.manage'
  | 'analytics.view'
  | 'logs.view'
  | 'notifications.send'
  | 'settings.manage'
  | 'payouts.manage'
  | 'admin_users.manage'
  | 'system.settings'
  | 'subscriptions.manage'
  | 'licenses.manage';

// Auth Types
export interface AuthResponse {
  admin: AdminUser;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

// User Types
export interface User {
  _id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: 'active' | 'suspended' | 'deleted';
  verified?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// Extended User Details Types
export interface UserDetails {
  user: User;
  stats: UserStats;
  sales: UserSale[];
  subscriptions: UserSubscription[];
  beats: UserBeat[];
  playlists: UserPlaylist[];
  library: UserLibraryItem[];
}

export interface UserStats {
  totalSales: number;
  totalRevenue: number;
  totalBeats: number;
  totalPlaylists: number;
  totalLibraryItems: number;
  totalFollowers: number;
  totalFollowing: number;
  averageRating: number;
  totalPlays: number;
  totalDownloads: number;
}

export interface UserSale {
  _id: string;
  beatId: string;
  beatTitle: string;
  amount: number;
  platformFee: number;
  producerAmount: number;
  status: 'pending' | 'completed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

export interface UserSubscription {
  _id: string;
  planName: string;
  planType: 'monthly' | 'yearly' | 'lifetime';
  amount: number;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  createdAt: string;
}

export interface UserBeat {
  _id: string;
  title: string;
  description?: string;
  artwork?: string;
  bpm: number;
  key: string;
  genre: string;
  mood?: string;
  tags: string[];
  basePrice: number;
  salePrice?: number;
  isExclusive: boolean;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  plays: number;
  likes: number;
  downloads: number;
  sales: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPlaylist {
  _id: string;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  beatCount: number;
  totalPlays: number;
  totalLikes: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserLibraryItem {
  _id: string;
  beatId: string;
  beatTitle: string;
  beatArtwork?: string;
  beatProducer: string;
  purchaseType: 'purchase' | 'free_download' | 'subscription';
  purchaseDate: string;
  downloadCount: number;
  lastPlayed?: string;
}

// Beat Types
export interface Beat {
  _id: string;
  id: string; // Alias for _id
  title: string;
  producer: string;
  description?: string;
  artwork?: string;
  audioFile?: string;
  storageKey?: string; // For R2 storage
  bpm: number;
  key: string;
  genre: string;
  mood?: string;
  tags: string[];
  allowFreeDownload: boolean;
  basePrice: number;
  salePrice?: number;
  isExclusive: boolean;
  duration?: number;
  fileSize?: number;
  audioFormat: 'mp3' | 'wav' | 'm4a';
  status: BeatStatus;
  plays: number;
  owner: {
    _id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  likes: number;
  downloads: number;
  sales: number;
  createdAt: string;
  updatedAt: string;
}

export interface BeatFilters {
  search?: string;
  status?: 'draft' | 'published' | 'archived' | 'flagged' | 'rejected';
  genre?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Frontend-specific filters for EnhancedBeatsPage
export interface AdvancedBeatFilters {
  search?: string;
  genre?: string;
  mood?: string;
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'popular' | 'plays' | 'likes' | 'title' | 'producer' | 'genre';
  sortOrder?: 'asc' | 'desc';
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalBeats: number;
  publishedBeats: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalSales: number;
  monthlySales: number;
  pendingBeats: number;
  flaggedContent: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
  admin?: string;
}

// Content Types
export interface HomepageContent {
  _id: string;
  type: 'banner' | 'featured_playlist' | 'trending_beats' | 'announcement';
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  playlistId?: string;
  beatIds?: string[];
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
  parentId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Sales Types
export interface Sale {
  _id: string;
  beatId: {
    _id: string;
    title: string;
    producer: string;
    genre: string;
    artwork: string;
    storageKey: string;
  };
  buyerId: {
    _id: string;
    username: string;
    email: string;
  };
  sellerId: {
    _id: string;
    username: string;
    email: string;
  };
  licenseName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentProviderTransactionId: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentStatus: 'initialized' | 'successful' | 'failed' | 'refunded' | 'pending';
  platformFee: number;
  sellerProfit?: number;
  earningsSplits?: Array<{
    userId: string;
    percent: number;
    amount: number;
  }>;
  provider?: string;
  txRef?: string;
  flwTxId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  revenueByMonth: { month: string; revenue: number }[];
  revenueByGenre: { genre: string; revenue: number }[];
  topProducers: { producer: string; revenue: number }[];
}

// Audit Log Types
export interface AuditLog {
  _id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditLogFilters {
  adminId?: string;
  action?: string;
  resource?: string;
  success?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// Notification Types
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  targetUsers: 'all' | 'admins' | 'specific';
  targetUserIds?: string[];
  isActive: boolean;
  scheduledAt?: string;
  sentAt?: string;
  createdBy: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Settings Types
export interface SystemSettings {
  [key: string]: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface CreateAdminForm {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  permissions: AdminPermission[];
}

export interface UpdateUserForm {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface CreateNotificationForm {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  targetUsers: 'all' | 'admins' | 'specific';
  targetUserIds?: string[];
  scheduledAt?: string;
}

// Chart Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

// Table Types
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
}

// Role Permission Mapping
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.suspend', 'users.impersonate',
    'beats.view', 'beats.moderate', 'beats.approve', 'beats.reject', 'beats.delete',
    'content.manage', 'content.homepage', 'content.categories',
    'playlists.view', 'playlists.manage',
    'sales.view', 'sales.manage',
    'subscriptions.manage',
    'licenses.manage',
    'analytics.view',
    'logs.view',
    'notifications.send',
    'settings.manage',
    'payouts.manage',
    'admin_users.manage',
    'system.settings'
  ],
  admin: [
    'users.view', 'users.create', 'users.edit', 'users.suspend', 'users.impersonate',
    'beats.view', 'beats.moderate', 'beats.approve', 'beats.reject',
    'content.manage', 'content.homepage', 'content.categories',
    'playlists.view', 'playlists.manage',
    'subscriptions.manage',
    'licenses.manage',
    'sales.view',
    'analytics.view',
    'logs.view',
    'notifications.send',
    'settings.manage'
  ],
  moderator: [
    'users.view', 'users.suspend',
    'beats.view', 'beats.moderate', 'beats.approve', 'beats.reject',
    'licenses.manage',
    'content.manage',
    'playlists.view',
    'analytics.view',
    'logs.view'
  ],
  content_manager: [
    'beats.view',
    'content.manage', 'content.homepage', 'content.categories',
    'playlists.view', 'playlists.manage',
    'analytics.view'
  ],
  sales_admin: [
    'users.view',
    'beats.view',
    'sales.view', 'sales.manage',
    'analytics.view',
    'payouts.manage'
  ],
  finance_admin: [
    'sales.view', 'sales.manage',
    'analytics.view',
    'payouts.manage',
    'settings.manage'
  ],
  support_admin: [
    'users.view', 'users.impersonate',
    'beats.view',
    'logs.view',
    'notifications.send'
  ]
};

// Payout status type
export type PayoutStatus = 
  | 'pending'
  | 'approved'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'rejected'
  | 'payment_method_not_found';
