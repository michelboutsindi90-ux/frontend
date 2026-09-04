import { apiRequest, apiRequestBlob } from '../apiClient'
import { Product } from '../../types'

export function listProducts(shopId: string, categoryId?: string): Promise<Product[]> {
  const qs = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''
  return apiRequest<Product[]>(`/shops/${shopId}/products${qs}`)
}

export function getProduct(shopId: string, productId: string): Promise<Product> {
  return apiRequest<Product>(`/shops/${shopId}/products/${productId}`)
}

export function createProduct(
  shopId: string,
  dto: { name: string; sku: string; price: number; categoryId: string }
): Promise<Product> {
  return apiRequest<Product>(`/shops/${shopId}/products`, { method: 'POST', body: dto })
}

export function updateProduct(
  shopId: string,
  productId: string,
  dto: Partial<{ name: string; sku: string; price: number; categoryId: string; isActive: boolean }>
): Promise<Product> {
  return apiRequest<Product>(`/shops/${shopId}/products/${productId}`, { method: 'PATCH', body: dto })
}

export function deleteProduct(shopId: string, productId: string): Promise<void> {
  return apiRequest<void>(`/shops/${shopId}/products/${productId}`, { method: 'DELETE' })
}

export function regenerateQrCode(shopId: string, productId: string): Promise<Product> {
  return apiRequest<Product>(`/shops/${shopId}/products/${productId}/regenerate-qr`, { method: 'POST' })
}

export async function fetchQrCodeImageUrl(shopId: string, productId: string): Promise<string> {
  const blob = await apiRequestBlob(`/shops/${shopId}/products/${productId}/qr-code.png`)
  return URL.createObjectURL(blob)
}

export function scanProduct(
  shopId: string,
  token: string,
  location?: { latitude: number; longitude: number }
): Promise<Product> {
  return apiRequest<Product>(`/shops/${shopId}/products/scan`, {
    method: 'POST',
    body: { token, ...location },
  })
}
