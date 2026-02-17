import { apiClient } from './client'
import type {
  PostField,
  CreatePostFieldData,
  UpdatePostFieldData,
  PlatformPostField,
  CreatePlatformPostFieldData,
  UpdatePlatformPostFieldData,
  BulkPlatformFieldMapping,
} from '@/lib/types/post-field.types'

export const adminPostFieldsApi = {
  // ==========================================
  // POST FIELDS (Field Registry)
  // ==========================================

  getFields: async (): Promise<PostField[]> => {
    const response = await apiClient.get('/admin/post-fields')
    return response.data.data || response.data
  },

  getField: async (id: string): Promise<PostField> => {
    const response = await apiClient.get(`/admin/post-fields/${id}`)
    return response.data.data || response.data
  },

  createField: async (data: CreatePostFieldData): Promise<PostField> => {
    const response = await apiClient.post('/admin/post-fields', data)
    return response.data.data || response.data
  },

  updateField: async (id: string, data: UpdatePostFieldData): Promise<PostField> => {
    const response = await apiClient.patch(`/admin/post-fields/${id}`, data)
    return response.data.data || response.data
  },

  deleteField: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/admin/post-fields/${id}`)
    return response.data.data || response.data
  },

  // ==========================================
  // PLATFORM POST FIELDS (Mappings)
  // ==========================================

  getPlatformMappings: async (platformId: string): Promise<PlatformPostField[]> => {
    const response = await apiClient.get(`/admin/platform-fields/platform/${platformId}`)
    return response.data.data || response.data
  },

  createMapping: async (data: CreatePlatformPostFieldData): Promise<PlatformPostField> => {
    const response = await apiClient.post('/admin/platform-fields', data)
    return response.data.data || response.data
  },

  updateMapping: async (id: string, data: UpdatePlatformPostFieldData): Promise<PlatformPostField> => {
    const response = await apiClient.patch(`/admin/platform-fields/${id}`, data)
    return response.data.data || response.data
  },

  deleteMapping: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/admin/platform-fields/${id}`)
    return response.data.data || response.data
  },

  bulkUpdateMappings: async (platformId: string, mappings: BulkPlatformFieldMapping[]): Promise<PlatformPostField[]> => {
    const response = await apiClient.put(`/admin/platform-fields/platform/${platformId}/bulk`, { mappings })
    return response.data.data || response.data
  },
}
