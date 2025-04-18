import { ChannelPartner } from "@/types/channel-partner"
import { apiFetch } from "./fetch"

export async function getChannelPartners() {
  return apiFetch(`/channel-partners/`, {
    method: 'GET',
  })
}

export async function getChannelPartner(id: string) {
  return apiFetch(`/channel-partners/${id}/`, {
    method: 'GET',
  })
}

export async function createChannelPartner(data: Partial<ChannelPartner>) {
  return apiFetch(`/channel-partners/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateChannelPartner(id: string, data: Partial<ChannelPartner>) {
  return apiFetch(`/channel-partners/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteChannelPartner(id: string) {
  return apiFetch(`/channel-partners/${id}/`, {
    method: 'DELETE',
  })
} 