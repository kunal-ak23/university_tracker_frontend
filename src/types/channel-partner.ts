export interface ChannelPartner {
  id: string;
  name: string;
  website: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  poc: number;
  commission_rate: number;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
} 