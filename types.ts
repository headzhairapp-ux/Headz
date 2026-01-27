
export interface Hairstyle {
  id: string;
  name: string;
  thumbnailUrl: string;
  prompt: string;
  gender: 'male' | 'female';
}

export interface HistoryItem {
  imageUrl: string;
  styleName: string;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  location?: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
  email_verified?: boolean;
  auth_provider?: string;
  download_count?: number;
  share_count?: number;
  custom_prompt_count?: number;
  generation_count?: number;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}
