export interface AdPlatform {
  id: string
  name: string
  slug: string
  description?: string
  iconUrl?: string
  platformType: string
  oauthClientId?: string
  oauthClientSecret?: string
  oauthAuthUrl?: string
  oauthTokenUrl?: string
  oauthScopes: string[]
  apiBaseUrl?: string
  isEnabled: boolean
  displayOrder: number
  config: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreatePlatformData {
  name: string
  slug: string
  description?: string
  iconUrl?: string
  platformType?: string
  oauthClientId?: string
  oauthClientSecret?: string
  oauthAuthUrl?: string
  oauthTokenUrl?: string
  oauthScopes?: string[]
  apiBaseUrl?: string
  isEnabled?: boolean
  displayOrder?: number
  config?: Record<string, any>
}

export interface UpdatePlatformData extends Partial<CreatePlatformData> {}
