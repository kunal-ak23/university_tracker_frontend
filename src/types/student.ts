export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  notes?: string;
  enrollment_source: 'direct' | 'channel_partner' | 'university';
  status: 'active' | 'completed' | 'dropped';
  created_at: string;
  updated_at: string;
}
