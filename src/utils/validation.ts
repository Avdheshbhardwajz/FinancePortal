import { ValidationError, ColumnConfig } from '@/types/grid'
import { isValidDateString } from './dateUtils'

export const validateInput = (field: string, value: any, config: ColumnConfig): ValidationError => {
  if (!config) return { hasError: false, message: '' }

  if (value === null || value === undefined || value === '') {
    return { hasError: false, message: '' }
  }

  const stringValue = String(value).trim()

  switch (config.editType) {
    case 'amount free text- numeric':
      if (!/^\d*\.?\d*$/.test(stringValue)) {
        return { hasError: true, message: 'Please enter a valid number' }
      }
      if (stringValue.endsWith('.')) {
        return { hasError: true, message: 'Please enter a complete decimal number' }
      }
      const floatValue = parseFloat(stringValue)
      if (isNaN(floatValue) || floatValue < 0 || floatValue > 999999999.99) {
        return { hasError: true, message: 'Amount must be between 0 and 999,999,999.99' }
      }
      if (stringValue.includes('.') && stringValue.split('.')[1].length > 2) {
        return { hasError: true, message: 'Maximum 2 decimal places allowed' }
      }
      break

    case 'alphanumeric free text':
      if (!/^[a-zA-Z0-9]*$/.test(stringValue)) {
        return { hasError: true, message: 'Please enter only letters and numbers (no special characters)' }
      }
      if (stringValue.length > 50) {
        return { hasError: true, message: 'Maximum length is 50 characters' }
      }
      break

    case 'text free text':
      if (!/^[a-zA-Z\s]*$/.test(stringValue)) {
        return { hasError: true, message: 'Please enter only letters and spaces' }
      }
      if (stringValue.length > 100) {
        return { hasError: true, message: 'Maximum length is 100 characters' }
      }
      break

    case 'date calendar':
      if (!isValidDateString(stringValue)) {
        return { hasError: true, message: 'Please select a valid date' }
      }
      const date = new Date(stringValue)
      const minDate = new Date('1900-01-01')
      const maxDate = new Date('2100-12-31')
      if (date < minDate || date > maxDate) {
        return { hasError: true, message: 'Date must be between 1900 and 2100' }
      }
      break

    case 'dropdown':
    case 'drop down with predefined value in the column':
      if (!config.dropdownOptions?.includes(stringValue)) {
        return { hasError: true, message: 'Please select a valid option from the dropdown' }
      }
      break
  }

  return { hasError: false, message: '' }
}
