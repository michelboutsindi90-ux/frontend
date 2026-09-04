import { apiRequest } from '../apiClient'
import { StockItem, StockMovement, StockMovementType } from '../../types'

export function listStock(shopId: string, lowStock?: boolean): Promise<StockItem[]> {
  const qs = lowStock ? '?lowStock=true' : ''
  return apiRequest<StockItem[]>(`/shops/${shopId}/stock${qs}`)
}

export function getStockItem(shopId: string, productId: string): Promise<StockItem> {
  return apiRequest<StockItem>(`/shops/${shopId}/stock/${productId}`)
}

export function getStockMovements(shopId: string, productId: string): Promise<StockMovement[]> {
  return apiRequest<StockMovement[]>(`/shops/${shopId}/stock/${productId}/movements`)
}

export function adjustStock(
  shopId: string,
  productId: string,
  dto: { type: StockMovementType; quantity: number }
): Promise<StockItem> {
  return apiRequest<StockItem>(`/shops/${shopId}/stock/${productId}/adjust`, { method: 'POST', body: dto })
}

export function updateLowStockAlert(
  shopId: string,
  productId: string,
  lowStockAlert: number
): Promise<StockItem> {
  return apiRequest<StockItem>(`/shops/${shopId}/stock/${productId}/low-stock-alert`, {
    method: 'PATCH',
    body: { lowStockAlert },
  })
}
