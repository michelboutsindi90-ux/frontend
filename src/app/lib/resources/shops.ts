import { apiRequest } from '../apiClient'
import { Shop, ShopStats } from '../../types'

export function listShops(): Promise<Shop[]> {
  return apiRequest<Shop[]>('/shops')
}

export function getShop(shopId: string): Promise<Shop> {
  return apiRequest<Shop>(`/shops/${shopId}`)
}

export function createShop(dto: {
  name: string
  address?: string
  latitude?: number
  longitude?: number
  zoneId?: string
}): Promise<Shop> {
  return apiRequest<Shop>('/shops', { method: 'POST', body: dto })
}

export function updateShop(
  shopId: string,
  dto: Partial<{
    name: string
    address: string
    latitude: number
    longitude: number
    isActive: boolean
    zoneId: string
  }>
): Promise<Shop> {
  return apiRequest<Shop>(`/shops/${shopId}`, { method: 'PATCH', body: dto })
}

export function deleteShop(shopId: string): Promise<void> {
  return apiRequest<void>(`/shops/${shopId}`, { method: 'DELETE' })
}

export function getShopStats(
  shopId: string,
  params: { period?: 'day' | 'week' | 'month'; days?: number } = {}
): Promise<ShopStats> {
  const query = new URLSearchParams()
  if (params.period) query.set('period', params.period)
  if (params.days) query.set('days', String(params.days))
  const qs = query.toString()
  return apiRequest<ShopStats>(`/shops/${shopId}/stats${qs ? `?${qs}` : ''}`)
}
