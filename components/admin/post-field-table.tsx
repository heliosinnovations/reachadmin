'use client'

import Link from 'next/link'
import type { PostField } from '@/lib/types/post-field.types'

interface PostFieldTableProps {
  fields: PostField[]
  onDelete: (id: string) => void
}

const fieldTypeLabels: Record<string, string> = {
  text: 'Text',
  textarea: 'Text Area',
  richtext: 'Rich Text',
  select: 'Select',
  url: 'URL',
  number: 'Number',
}

export function PostFieldTable({ fields, onDelete }: PostFieldTableProps) {
  if (fields.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500">No post fields defined yet.</p>
        <Link
          href="/dashboard/post-fields/new"
          className="inline-block mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Create your first field &rarr;
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-500">Label</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
            <th className="text-center px-4 py-3 font-medium text-gray-500">Order</th>
            <th className="text-center px-4 py-3 font-medium text-gray-500">Active</th>
            <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{field.label}</td>
              <td className="px-4 py-3 text-gray-500">
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{field.name}</code>
              </td>
              <td className="px-4 py-3 text-gray-500">{fieldTypeLabels[field.fieldType] || field.fieldType}</td>
              <td className="px-4 py-3 text-center text-gray-500">{field.displayOrder}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    field.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {field.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <Link
                  href={`/dashboard/post-fields/${field.id}/edit`}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(field.id)}
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
