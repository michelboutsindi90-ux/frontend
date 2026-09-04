import { apiRequest } from '../apiClient'
import { Zone } from '../../types'

export function listZones(): Promise<Zone[]> {
  return apiRequest<Zone[]>('/zones')
}

export function createZone(name: string): Promise<Zone> {
  return apiRequest<Zone>('/zones', { method: 'POST', body: { name } })
}
