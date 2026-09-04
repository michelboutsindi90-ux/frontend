import { apiRequest } from '../apiClient'
import { Sale } from '../../types'

export function createSale(shopId: string, idempotencyKey: string): Promise<Sale> {
  return apiRequest<Sale>(`/shops/${shopId}/sales`, { method: 'POST', body: { idempotencyKey } })
}

export function listSales(shopId: string, status?: string): Promise<Sale[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiRequest<Sale[]>(`/shops/${shopId}/sales${qs}`)
}

export function getSale(shopId: string, saleId: string): Promise<Sale> {
  return apiRequest<Sale>(`/shops/${shopId}/sales/${saleId}`)
}

// Note: the backend returns the whole Sale (with its recomputed `lines`) from every
// line mutation, not just the affected line — the caller should replace its local
// lines from the response rather than merge a single line into existing state.
export function addSaleLine(
  shopId: string,
  saleId: string,
  dto: { productId: string; quantity: number }
): Promise<Sale> {
  return apiRequest<Sale>(`/shops/${shopId}/sales/${saleId}/lines`, { method: 'POST', body: dto })
}

export function updateSaleLine(
  shopId: string,
  saleId: string,
  lineId: string,
  quantity: number
): Promise<Sale> {
  return apiRequest<Sale>(`/shops/${shopId}/sales/${saleId}/lines/${lineId}`, {
    method: 'PATCH',
    body: { quantity },
  })
}

export function removeSaleLine(shopId: string, saleId: string, lineId: string): Promise<Sale> {
  return apiRequest<Sale>(`/shops/${shopId}/sales/${saleId}/lines/${lineId}`, { method: 'DELETE' })
}

export function validateSale(shopId: string, saleId: string): Promise<Sale> {
  return apiRequest<Sale>(`/shops/${shopId}/sales/${saleId}/validate`, { method: 'POST' })
}

export function cancelSale(shopId: string, saleId: string): Promise<Sale> {
  return apiRequest<Sale>(`/shops/${shopId}/sales/${saleId}/cancel`, { method: 'POST' })
}

export function refundSale(shopId: string, saleId: string): Promise<Sale> {
  return apiRequest<Sale>(`/shops/${shopId}/sales/${saleId}/refund`, { method: 'POST' })
}
