import {ChannelPartner} from "@/types/channel-partner";
import {Program} from "@/types/program";

export interface ChannelPartnerProgram {
  id: string;
  channel_partner: string | ChannelPartner;  // ID of the channel partner
  program: string | Program;          // ID of the program
  commission_rate: number;
  transfer_price: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
