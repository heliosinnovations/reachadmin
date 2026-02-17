import apiClient from './client'
import type { AdPlatform, CreatePlatformData, UpdatePlatformData } from '@/lib/types/platform.types'

export const adminPlatformsApi = {
  getPlatforms: async (): Promise<AdPlatform[]> => {
    const response = await apiClient.get('/admin/platforms')
    return response.data.data || response.data
  },

  getPlatform: async (id: string): Promise<AdPlatform> => {
    const response = await apiClient.get(`/admin/platforms/${id}`)
    return response.data.data || response.data
  },

  createPlatform: async (data: CreatePlatformData): Promise<AdPlatform> => {
    const response = await apiClient.post('/admin/platforms', data)
    return response.data.data || response.data
  },

  updatePlatform: async (id: string, data: UpdatePlatformData): Promise<AdPlatform> => {
    const response = await apiClient.patch(`/admin/platforms/${id}`, data)
    return response.data.data || response.data
  },

  deletePlatform: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/admin/platforms/${id}`)
    return response.data.data || response.data
  },

  togglePlatform: async (id: string): Promise<AdPlatform> => {
    const response = await apiClient.patch(`/admin/platforms/${id}/toggle`)
    return response.data.data || response.data
  },
}
