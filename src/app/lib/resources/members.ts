import { apiRequest } from '../apiClient'
import { ShopMember } from '../../types'

export function listMembers(shopId: string): Promise<ShopMember[]> {
  return apiRequest<ShopMember[]>(`/shops/${shopId}/members`)
}

export function addMember(
  shopId: string,
  dto: { email: string; fullName: string; role: 'MANAGER' | 'CASHIER' }
): Promise<ShopMember & { temporaryPassword?: string }> {
  return apiRequest<ShopMember & { temporaryPassword?: string }>(`/shops/${shopId}/members`, {
    method: 'POST',
    body: dto,
  })
}

export function updateMember(
  shopId: string,
  memberId: string,
  role: 'MANAGER' | 'CASHIER'
): Promise<ShopMember> {
  return apiRequest<ShopMember>(`/shops/${shopId}/members/${memberId}`, { method: 'PATCH', body: { role } })
}

export function removeMember(shopId: string, memberId: string): Promise<void> {
  return apiRequest<void>(`/shops/${shopId}/members/${memberId}`, { method: 'DELETE' })
}
