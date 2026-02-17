'use client'

import Link from 'next/link'
import type { AdPlatform } from '@/lib/types/platform.types'

interface PlatformTableProps {
  platforms: AdPlatform[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function PlatformTable({ platforms, onToggle, onDelete }: PlatformTableProps) {
  if (platforms.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">No platforms configured yet.</p>
        <Link
          href="/dashboard/platforms/new"
          className="inline-block mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Create your first platform &rarr;
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Slug</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
            <th className="text-center px-4 py-3 font-medium text-gray-500">Enabled</th>
            <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {platforms.map((platform) => (
            <tr key={platform.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{platform.name}</td>
              <td className="px-4 py-3 text-gray-500">
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{platform.slug}</code>
              </td>
              <td className="px-4 py-3 text-gray-500">{platform.platformType}</td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onToggle(platform.id)}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    platform.isEnabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {platform.isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <Link
                  href={`/dashboard/post-fields/platforms/${platform.id}`}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Fields
                </Link>
                <Link
                  href={`/dashboard/platforms/${platform.id}/edit`}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(platform.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
