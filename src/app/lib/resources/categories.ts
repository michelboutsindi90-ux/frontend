import { apiRequest } from '../apiClient'
import { Category } from '../../types'

export function listCategories(shopId: string): Promise<Category[]> {
  return apiRequest<Category[]>(`/shops/${shopId}/categories`)
}

export function createCategory(shopId: string, name: string): Promise<Category> {
  return apiRequest<Category>(`/shops/${shopId}/categories`, { method: 'POST', body: { name } })
}

export function updateCategory(shopId: string, categoryId: string, name: string): Promise<Category> {
  return apiRequest<Category>(`/shops/${shopId}/categories/${categoryId}`, {
    method: 'PATCH',
    body: { name },
  })
}

export function deleteCategory(shopId: string, categoryId: string): Promise<void> {
  return apiRequest<void>(`/shops/${shopId}/categories/${categoryId}`, { method: 'DELETE' })
}
