'use client'

import { useState, useEffect } from 'react'
import type { PostField, PlatformPostField, BulkPlatformFieldMapping } from '@/lib/types/post-field.types'

interface PlatformFieldMapperProps {
  platformId: string
  platformName: string
  allFields: PostField[]
  currentMappings: PlatformPostField[]
  onSave: (mappings: BulkPlatformFieldMapping[]) => Promise<void>
  loading?: boolean
}

interface FieldMapping {
  fieldId: string
  enabled: boolean
  isRequired: boolean
  labelOverride: string
  placeholder: string
  helpText: string
  displayOrder: number
  maxLengthOverride: string
  minLengthOverride: string
}

export function PlatformFieldMapper({
  platformId,
  platformName,
  allFields,
  currentMappings,
  onSave,
  loading,
}: PlatformFieldMapperProps) {
  const [error, setError] = useState('')
  const [mappings, setMappings] = useState<FieldMapping[]>([])

  useEffect(() => {
    const initial = allFields.map((field) => {
      const existing = currentMappings.find((m) => m.fieldId === field.id)
      return {
        fieldId: field.id,
        enabled: !!existing,
        isRequired: existing?.isRequired ?? false,
        labelOverride: existing?.labelOverride || '',
        placeholder: existing?.placeholder || '',
        helpText: existing?.helpText || '',
        displayOrder: existing?.displayOrder ?? field.displayOrder,
        maxLengthOverride: existing?.validationOverride?.maxLength?.toString() || '',
        minLengthOverride: existing?.validationOverride?.minLength?.toString() || '',
      }
    })
    setMappings(initial)
  }, [allFields, currentMappings])

  const updateMapping = (fieldId: string, updates: Partial<FieldMapping>) => {
    setMappings((prev) =>
      prev.map((m) => (m.fieldId === fieldId ? { ...m, ...updates } : m))
    )
  }

  const handleSave = async () => {
    setError('')
    const enabledMappings: BulkPlatformFieldMapping[] = mappings
      .filter((m) => m.enabled)
      .map((m) => {
        const validationOverride: Record<string, any> = {}
        if (m.maxLengthOverride) validationOverride.maxLength = Number(m.maxLengthOverride)
        if (m.minLengthOverride) validationOverride.minLength = Number(m.minLengthOverride)

        return {
          fieldId: m.fieldId,
          isRequired: m.isRequired,
          labelOverride: m.labelOverride || undefined,
          placeholder: m.placeholder || undefined,
          helpText: m.helpText || undefined,
          displayOrder: m.displayOrder,
          validationOverride: Object.keys(validationOverride).length > 0 ? validationOverride : undefined,
          isActive: true,
        }
      })

    try {
      await onSave(enabledMappings)
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to save mappings')
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">
            Fields for {platformName}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Enable fields and configure per-platform overrides
          </p>
        </div>

        <div className="divide-y divide-gray-50">
          {mappings.map((mapping) => {
            const field = allFields.find((f) => f.id === mapping.fieldId)
            if (!field) return null

            return (
              <div key={mapping.fieldId} className={`px-4 py-4 ${mapping.enabled ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mapping.enabled}
                      onChange={(e) => updateMapping(mapping.fieldId, { enabled: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-900">{field.label}</span>
                  </label>
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{field.name}</code>
                  <span className="text-xs text-gray-400">{field.fieldType}</span>

                  {mapping.enabled && (
                    <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapping.isRequired}
                        onChange={(e) => updateMapping(mapping.fieldId, { isRequired: e.target.checked })}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                      />
                      <span className="text-xs text-gray-600">Required</span>
                    </label>
                  )}
                </div>

                {mapping.enabled && (
                  <div className="grid grid-cols-4 gap-3 ml-6">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Label Override</label>
                      <input
                        type="text"
                        value={mapping.labelOverride}
                        onChange={(e) => updateMapping(mapping.fieldId, { labelOverride: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-gray-200 text-xs focus:outline-none focus:border-purple-600"
                        placeholder={field.label}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Placeholder</label>
                      <input
                        type="text"
                        value={mapping.placeholder}
                        onChange={(e) => updateMapping(mapping.fieldId, { placeholder: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-gray-200 text-xs focus:outline-none focus:border-purple-600"
                        placeholder="Placeholder text..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Help Text</label>
                      <input
                        type="text"
                        value={mapping.helpText}
                        onChange={(e) => updateMapping(mapping.fieldId, { helpText: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-gray-200 text-xs focus:outline-none focus:border-purple-600"
                        placeholder="Hint for users..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Order</label>
                      <input
                        type="number"
                        value={mapping.displayOrder}
                        onChange={(e) => updateMapping(mapping.fieldId, { displayOrder: Number(e.target.value) })}
                        className="w-full h-8 px-2 rounded border border-gray-200 text-xs focus:outline-none focus:border-purple-600"
                      />
                    </div>
                    {(field.fieldType === 'text' || field.fieldType === 'textarea' || field.fieldType === 'richtext' || field.fieldType === 'url') && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Min Length Override</label>
                          <input
                            type="number"
                            value={mapping.minLengthOverride}
                            onChange={(e) => updateMapping(mapping.fieldId, { minLengthOverride: e.target.value })}
                            className="w-full h-8 px-2 rounded border border-gray-200 text-xs focus:outline-none focus:border-purple-600"
                            placeholder={field.defaultValidation?.minLength?.toString() || '-'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Max Length Override</label>
                          <input
                            type="number"
                            value={mapping.maxLengthOverride}
                            onChange={(e) => updateMapping(mapping.fieldId, { maxLengthOverride: e.target.value })}
                            className="w-full h-8 px-2 rounded border border-gray-200 text-xs focus:outline-none focus:border-purple-600"
                            placeholder={field.defaultValidation?.maxLength?.toString() || '-'}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSave}
        disabled={loading}
        className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : 'Save Mappings'}
      </button>
    </div>
  )
}
