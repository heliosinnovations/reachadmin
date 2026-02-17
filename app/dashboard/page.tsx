'use client'

import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/dashboard/platforms"
          className="rounded-xl border border-gray-200 bg-white p-6 hover:border-purple-300 transition-colors"
        >
          <h3 className="font-semibold text-gray-900">Platforms</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage ad platform configurations and OAuth credentials.
          </p>
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-6 opacity-50">
          <h3 className="font-semibold text-gray-900">Users</h3>
          <p className="text-sm text-gray-500 mt-1">
            View and manage user accounts.
          </p>
          <span className="inline-block mt-2 text-xs text-gray-400">Coming soon</span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 opacity-50">
          <h3 className="font-semibold text-gray-900">Settings</h3>
          <p className="text-sm text-gray-500 mt-1">
            Global application settings.
          </p>
          <span className="inline-block mt-2 text-xs text-gray-400">Coming soon</span>
        </div>
      </div>
    </div>
  )
}
