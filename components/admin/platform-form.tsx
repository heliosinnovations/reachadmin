'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdPlatform, CreatePlatformData } from '@/lib/types/platform.types'

interface PlatformFormProps {
  platform?: AdPlatform
  onSubmit: (data: CreatePlatformData) => Promise<void>
  loading?: boolean
}

export function PlatformForm({ platform, onSubmit, loading }: PlatformFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')

  const [name, setName] = useState(platform?.name || '')
  const [slug, setSlug] = useState(platform?.slug || '')
  const [description, setDescription] = useState(platform?.description || '')
  const [platformType, setPlatformType] = useState(platform?.platformType || 'social')
  const [oauthClientId, setOauthClientId] = useState(platform?.oauthClientId || '')
  const [oauthClientSecret, setOauthClientSecret] = useState(platform?.oauthClientSecret || '')
  const [oauthAuthUrl, setOauthAuthUrl] = useState(platform?.oauthAuthUrl || '')
  const [oauthTokenUrl, setOauthTokenUrl] = useState(platform?.oauthTokenUrl || '')
  const [oauthScopes, setOauthScopes] = useState((platform?.oauthScopes || []).join(', '))
  const [apiBaseUrl, setApiBaseUrl] = useState(platform?.apiBaseUrl || '')
  const [isEnabled, setIsEnabled] = useState(platform?.isEnabled || false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required')
      return
    }

    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        platformType,
        oauthClientId: oauthClientId.trim() || undefined,
        oauthClientSecret: oauthClientSecret.trim() || undefined,
        oauthAuthUrl: oauthAuthUrl.trim() || undefined,
        oauthTokenUrl: oauthTokenUrl.trim() || undefined,
        oauthScopes: oauthScopes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        apiBaseUrl: apiBaseUrl.trim() || undefined,
        isEnabled,
      })
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to save platform')
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)
    if (!platform) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder="Meta Ads"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder="meta"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder="Facebook and Instagram advertising platform"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform Type</label>
            <select
              value={platformType}
              onChange={(e) => setPlatformType(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
            >
              <option value="social">Social</option>
              <option value="search">Search</option>
              <option value="display">Display</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
              />
              <span className="text-sm text-gray-700">Enabled</span>
            </label>
          </div>
        </div>
      </div>

      {/* OAuth Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">OAuth Configuration</h3>
        {slug === 'twitter' && (
          <p className="text-sm text-amber-600 mb-4">
            X/Twitter uses OAuth 1.0a. Use the <strong>API Key</strong> and <strong>API Key Secret</strong> from
            the "Keys and tokens" → "Consumer Keys" section in the X Developer Portal.
          </p>
        )}
        {slug === 'google_ads' && (
          <p className="text-sm text-blue-600 mb-4">
            Google Ads uses OAuth 2.0. Create credentials in the{' '}
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">
              Google Cloud Console
            </a>. Enable the Google Ads API and set the redirect URI to your callback URL.
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {slug === 'twitter' ? 'API Key (Consumer Key)' : 'Client ID'}
            </label>
            <input
              type="text"
              value={oauthClientId}
              onChange={(e) => setOauthClientId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder={
                slug === 'twitter' ? 'X API Key' :
                slug === 'google_ads' ? 'Google OAuth Client ID' :
                'Facebook App ID'
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {slug === 'twitter' ? 'API Key Secret (Consumer Secret)' : 'Client Secret'}
            </label>
            <input
              type="password"
              value={oauthClientSecret}
              onChange={(e) => setOauthClientSecret(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder={
                slug === 'twitter' ? 'X API Key Secret' :
                slug === 'google_ads' ? 'Google OAuth Client Secret' :
                'Facebook App Secret'
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auth URL</label>
            <input
              type="text"
              value={oauthAuthUrl}
              onChange={(e) => setOauthAuthUrl(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder={
                slug === 'google_ads' ? 'https://accounts.google.com/o/oauth2/v2/auth' :
                'https://www.facebook.com/v21.0/dialog/oauth'
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token URL</label>
            <input
              type="text"
              value={oauthTokenUrl}
              onChange={(e) => setOauthTokenUrl(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder={
                slug === 'google_ads' ? 'https://oauth2.googleapis.com/token' :
                'https://graph.facebook.com/v21.0/oauth/access_token'
              }
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Scopes (comma-separated)</label>
            <input
              type="text"
              value={oauthScopes}
              onChange={(e) => setOauthScopes(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder={
                slug === 'google_ads' ? 'https://www.googleapis.com/auth/adwords' :
                'pages_show_list, pages_read_engagement, pages_manage_posts'
              }
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">API Base URL</label>
            <input
              type="text"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder="https://graph.facebook.com/v21.0"
            />
          </div>
        </div>
      </div>

      {/* Error & Submit */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : platform ? 'Update Platform' : 'Create Platform'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/platforms')}
          className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
