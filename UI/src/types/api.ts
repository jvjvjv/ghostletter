// API response types matching Laravel backend

// created_at and updated_at and deleted_at may be
// suppressed by API response, so they should be optional

export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
  initials: string | null;
  color: string | null;
  avatar_url: string | null;
}

export interface ApiImage {
  id: number;
  user_id: number;
  path: string;
  url: string;
  filename: string;
  mime_type: string;
  size: number | null;
  width: number | null;
  height: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ApiMessage {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  type: "text" | "image";
  is_read: boolean;
  status: "sent" | "delivered" | "read" | "expired";
  image_id: number | null;
  img_viewed: boolean;
  expiry_timestamp: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  sender?: ApiUser;
  recipient?: ApiUser;
  image?: ApiImage;
}

export interface ApiFriendship {
  id: number;
  user_id: number;
  friend_user_id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  user?: ApiUser;
  friendUser?: ApiUser;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface LoginResponse {
  token?: string;
  user: ApiUser;
}
