import apiClient from './client'
import { tokenStorage } from '@/lib/utils/token-storage'

interface SignInData {
  email: string
  password: string
}

interface AuthResponse {
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export const authApi = {
  signIn: async (data: SignInData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/signin', data)
    const result = response.data.data || response.data
    tokenStorage.setTokens({
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    })
    return result
  },

  getOAuthUrl: async (provider: string): Promise<{ url: string; provider: string }> => {
    const callbackUrl = `${window.location.origin}/auth/callback`
    const response = await apiClient.get(`/auth/oauth/${provider}`, {
      params: { redirect_url: callbackUrl },
    })
    return response.data.data || response.data
  },

  signOut: async () => {
    try {
      await apiClient.post('/auth/signout')
    } finally {
      tokenStorage.clearTokens()
    }
  },

  getProfile: async () => {
    const response = await apiClient.get('/users/me')
    return response.data.data || response.data
  },

  /**
   * Check if the current user has admin access.
   * Hits an admin-only endpoint — returns true if allowed, false if 403.
   */
  checkAdminAccess: async (): Promise<boolean> => {
    try {
      await apiClient.get('/admin/platforms')
      return true
    } catch (err: any) {
      if (err?.response?.status === 403) return false
      throw err // re-throw network errors, 401s, etc.
    }
  },
}
