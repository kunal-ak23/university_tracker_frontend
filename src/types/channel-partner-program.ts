import {ChannelPartner} from "@/types/channel-partner";

export interface ChannelPartnerProgram {
  id: string;
  channel_partner: string | ChannelPartner;  // ID of the channel partner
  program: string;          // ID of the program
  commission_rate: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
