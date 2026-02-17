export type FieldType = 'text' | 'textarea' | 'richtext' | 'select' | 'url' | 'number'

export interface FieldOption {
  value: string
  label: string
}

export interface FieldValidation {
  maxLength?: number
  minLength?: number
  required?: boolean
  min?: number
  max?: number
  pattern?: string
}

export interface PostField {
  id: string
  name: string
  label: string
  fieldType: FieldType
  defaultValidation: FieldValidation
  options: FieldOption[]
  displayOrder: number
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePostFieldData {
  name: string
  label: string
  fieldType: FieldType
  defaultValidation?: FieldValidation
  options?: FieldOption[]
  displayOrder?: number
  description?: string
  isActive?: boolean
}

export interface UpdatePostFieldData extends Partial<CreatePostFieldData> {}

export interface PlatformPostField {
  id: string
  platformId: string
  fieldId: string
  isRequired: boolean
  labelOverride?: string
  placeholder?: string
  validationOverride: FieldValidation
  optionsOverride?: FieldOption[]
  displayOrder: number
  helpText?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePlatformPostFieldData {
  platformId: string
  fieldId: string
  isRequired?: boolean
  labelOverride?: string
  placeholder?: string
  validationOverride?: FieldValidation
  optionsOverride?: FieldOption[]
  displayOrder?: number
  helpText?: string
  isActive?: boolean
}

export interface UpdatePlatformPostFieldData extends Partial<Omit<CreatePlatformPostFieldData, 'platformId' | 'fieldId'>> {}

export interface BulkPlatformFieldMapping {
  fieldId: string
  isRequired?: boolean
  labelOverride?: string
  placeholder?: string
  validationOverride?: FieldValidation
  optionsOverride?: FieldOption[]
  displayOrder?: number
  helpText?: string
  isActive?: boolean
}
