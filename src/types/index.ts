export interface VanityItem {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  variant?: string;
  category: string;
  price?: number;
  rating?: number;
  acquisition_type: 'bought' | 'gifted';
  acquired_on: string;
  status: 'active' | 'finished' | 'decluttered';
  current_progress: number;
  created_at: string;
  updated_at: string;
}

export interface ProgressLog {
  id: string;
  vanity_item_id: string;
  user_id: string;
  photo_url: string;
  progress_percentage: number;
  notes?: string;
  logged_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  item_name: string;
  year: number;
  month_name: string;
  day: number;
  row_number?: number;
  is_bought: boolean;
  is_need: boolean;
  created_at: string;
}
