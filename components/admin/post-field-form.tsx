'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PostField, CreatePostFieldData, FieldType } from '@/lib/types/post-field.types'

interface PostFieldFormProps {
  field?: PostField
  onSubmit: (data: CreatePostFieldData) => Promise<void>
  loading?: boolean
}

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'richtext', label: 'Rich Text' },
  { value: 'select', label: 'Select' },
  { value: 'url', label: 'URL' },
  { value: 'number', label: 'Number' },
]

export function PostFieldForm({ field, onSubmit, loading }: PostFieldFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')

  const [name, setName] = useState(field?.name || '')
  const [label, setLabel] = useState(field?.label || '')
  const [fieldType, setFieldType] = useState<FieldType>(field?.fieldType || 'text')
  const [description, setDescription] = useState(field?.description || '')
  const [displayOrder, setDisplayOrder] = useState(field?.displayOrder ?? 0)
  const [isActive, setIsActive] = useState(field?.isActive ?? true)

  // Validation
  const [maxLength, setMaxLength] = useState(field?.defaultValidation?.maxLength ?? '')
  const [minLength, setMinLength] = useState(field?.defaultValidation?.minLength ?? '')
  const [required, setRequired] = useState(field?.defaultValidation?.required ?? false)
  const [min, setMin] = useState(field?.defaultValidation?.min ?? '')
  const [max, setMax] = useState(field?.defaultValidation?.max ?? '')
  const [pattern, setPattern] = useState(field?.defaultValidation?.pattern || '')

  // Options (for select type)
  const [optionsText, setOptionsText] = useState(
    field?.options?.map((o) => `${o.value}:${o.label}`).join('\n') || ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !label.trim()) {
      setError('Name and label are required')
      return
    }

    const validation: Record<string, any> = {}
    if (required) validation.required = true
    if (maxLength !== '') validation.maxLength = Number(maxLength)
    if (minLength !== '') validation.minLength = Number(minLength)
    if (min !== '') validation.min = Number(min)
    if (max !== '') validation.max = Number(max)
    if (pattern.trim()) validation.pattern = pattern.trim()

    const options = fieldType === 'select'
      ? optionsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [value, ...rest] = line.split(':')
            return { value: value.trim(), label: rest.join(':').trim() || value.trim() }
          })
      : []

    try {
      await onSubmit({
        name: name.trim(),
        label: label.trim(),
        fieldType,
        description: description.trim() || undefined,
        displayOrder,
        isActive,
        defaultValidation: Object.keys(validation).length > 0 ? validation : undefined,
        options: options.length > 0 ? options : undefined,
      })
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to save field')
    }
  }

  const handleLabelChange = (value: string) => {
    setLabel(value)
    if (!field) {
      setName(value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Field Definition</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder="Headline"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Machine Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder="headline"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as FieldType)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
            >
              {fieldTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder="Short description or help text for admins"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Validation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Default Validation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
              />
              <span className="text-sm text-gray-700">Required by default</span>
            </label>
          </div>
          <div />
          {(fieldType === 'text' || fieldType === 'textarea' || fieldType === 'richtext' || fieldType === 'url') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Length</label>
                <input
                  type="number"
                  value={minLength}
                  onChange={(e) => setMinLength(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                <input
                  type="number"
                  value={maxLength}
                  onChange={(e) => setMaxLength(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
                  placeholder="5000"
                />
              </div>
            </>
          )}
          {fieldType === 'number' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
                />
              </div>
            </>
          )}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pattern (Regex)</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600"
              placeholder="Optional regex pattern"
            />
          </div>
        </div>
      </div>

      {/* Options (for select type) */}
      {fieldType === 'select' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Select Options</h3>
          <p className="text-xs text-gray-500 mb-2">One option per line, format: <code>value:Label</code></p>
          <textarea
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            className="w-full h-32 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-600 font-mono"
            placeholder={"awareness:Awareness\nconsideration:Consideration\nconversion:Conversion"}
          />
        </div>
      )}

      {/* Error & Submit */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : field ? 'Update Field' : 'Create Field'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/post-fields')}
          className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
